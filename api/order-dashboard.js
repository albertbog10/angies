import crypto from "node:crypto";
import {clearOrderRecords, listOrderRecords} from "./_order-dashboard-store.js";

const getHeader = (headers = {}, key) => {
  const target = String(key || "").toLowerCase();
  const match = Object.entries(headers).find(
    ([headerName]) => String(headerName).toLowerCase() === target,
  );
  const value = match?.[1];
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return value || "";
};

const safeTimingEqual = (left, right) => {
  const leftBuffer = Buffer.from(left || "", "utf8");
  const rightBuffer = Buffer.from(right || "", "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const isAuthorized = (req) => {
  const requiredToken = String(process.env.ORDER_DASHBOARD_TOKEN || "").trim();
  if (!requiredToken) {
    return true;
  }

  const origin = req.headers.host || "localhost";
  const protocol =
    getHeader(req.headers, "x-forwarded-proto") ||
    (origin.includes("localhost") ? "http" : "https");
  const url = new URL(req.url || "/", `${protocol}://${origin}`);
  const queryToken = String(url.searchParams.get("token") || "").trim();
  const headerToken = String(
    getHeader(req.headers, "x-dashboard-token") || "",
  ).trim();
  const suppliedToken = queryToken || headerToken;

  return safeTimingEqual(requiredToken, suppliedToken);
};

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({error: "Unauthorized dashboard request."});
  }

  if (req.method === "GET") {
    const orders = await listOrderRecords();
    return res.status(200).json({
      ok: true,
      count: orders.length,
      orders,
    });
  }

  if (req.method === "DELETE") {
    await clearOrderRecords();
    return res.status(200).json({ok: true, cleared: true});
  }

  return res.status(405).json({error: "Method not allowed."});
}
