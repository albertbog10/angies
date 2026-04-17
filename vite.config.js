import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  clearOrderRecords,
  listOrderRecords,
} from "./api/_order-dashboard-store.js";
import squareWebhookHandler from "./api/square-payment-webhook.js";
import createSquarePaymentLinkHandler from "./api/create-square-payment-link.js";

const hydrateProcessEnvFromDotEnv = () => {
  try {
    const dotEnvRaw = fs.readFileSync(
      fileURLToPath(new URL("./.env", import.meta.url)),
      "utf8",
    );
    const pairs = dotEnvRaw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, value];
      });

    for (const [key, value] of pairs) {
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore in environments where .env is unavailable.
  }
};

hydrateProcessEnvFromDotEnv();

const sendJson = (res, statusCode, body) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const createOrderDashboardMiddleware = () => {
  return async (req, res) => {
    try {
      if (req.method === "GET") {
        const orders = await listOrderRecords();
        return sendJson(res, 200, {ok: true, count: orders.length, orders});
      }

      if (req.method === "DELETE") {
        await clearOrderRecords();
        return sendJson(res, 200, {ok: true, cleared: true});
      }

      return sendJson(res, 405, {error: "Method not allowed."});
    } catch {
      return sendJson(res, 500, {
        error: "Failed to process dashboard request in local dev.",
      });
    }
  };
};

const wrapVercelHandlerForVite = (handler) => {
  return async (req, res, next) => {
    let currentStatus = 200;

    const response = {
      ...res,
      status(code) {
        currentStatus = code;
        res.statusCode = code;
        return response;
      },
      json(body) {
        res.statusCode = currentStatus;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(body));
      },
    };

    try {
      await handler(req, response);
    } catch (error) {
      if (typeof next === "function") {
        next(error);
        return;
      }
      sendJson(res, 500, {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process local webhook request.",
      });
    }
  };
};

const orderDashboardDevPlugin = () => ({
  name: "order-dashboard-dev-plugin",
  configureServer(server) {
    const handler = createOrderDashboardMiddleware();
    const webhookHandler = wrapVercelHandlerForVite(squareWebhookHandler);
    const createSquarePaymentLinkDevHandler = wrapVercelHandlerForVite(
      createSquarePaymentLinkHandler,
    );
    server.middlewares.use("/api/order-dashboard", handler);
    server.middlewares.use("/.netlify/functions/order-dashboard", handler);
    server.middlewares.use("/api/square-payment-webhook", webhookHandler);
    server.middlewares.use(
      "/.netlify/functions/square-payment-webhook",
      webhookHandler,
    );
    server.middlewares.use(
      "/api/create-square-payment-link",
      createSquarePaymentLinkDevHandler,
    );
    server.middlewares.use(
      "/.netlify/functions/create-square-payment-link",
      createSquarePaymentLinkDevHandler,
    );
  },
});

export default defineConfig({
  plugins: [react(), orderDashboardDevPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        cakeOrder: fileURLToPath(new URL("./cake-order.html", import.meta.url)),
        orderDashboard: fileURLToPath(
          new URL("./order-dashboard.html", import.meta.url),
        ),
      },
    },
  },
});
