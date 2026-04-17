import crypto from "node:crypto";

const SQUARE_API_VERSION = "2026-01-22";
const SQUARE_API_URL = "https://connect.squareup.com/v2/online-checkout/payment-links";

const cakeSizeConfig = {
  "1-inch-test": { label: '1" (test)', amount: 10 },
  "6-inch": { label: '6"', amount: 6500 },
  "8-inch": { label: '8"', amount: 7500 },
  "10-inch": { label: '10"', amount: 8500 },
};

const cakeProductLabels = {
  cakept1: "cakept1",
  cakept2: "cakept2",
  cakept3: "cakept3",
  cakept4: "cakept4",
  cakept5: "cakept5",
};

const optionLabels = {
  eventType: {
    birthday: "Birthday",
    "baby-shower": "Baby shower",
    graduation: "Graduation",
    "wedding-shower": "Wedding or shower",
    other: "Other celebration",
  },
  flavor: {
    yellow: "Yellow",
    chocolate: "Chocolate",
    marble: "Marble",
    "red-velvet": "Red velvet",
    "dominican-cake": "Dominican cake",
    "tres-leches": "Tres leches",
  },
  filling: {
    none: "No filling",
    "dulce-de-leche": "Dulce de leche",
    guava: "Guava",
    pineapple: "Pineapple",
    strawberry: "Strawberry",
    nutella: "Nutella",
  },
  frosting: {
    meringue: "Meringue frosting",
    "whipped-icing": "Whipped icing frosting",
  },
  outsideColor: {
    white: "White",
    pink: "Pink",
    yellow: "Yellow",
    gold: "Gold",
    green: "Green",
    blue: "Blue",
  },
};

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const getLabel = (group, value) => optionLabels[group]?.[value] ?? value ?? "";
const getCakeProductLabel = (value) => cakeProductLabels[value] || value || "cake";

const readRawBody = async (req) => {
  if (typeof req.body === "string") {
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }

  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
};

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  const raw = await readRawBody(req);
  return JSON.parse(raw || "{}");
};

const normalizePhoneForSquare = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (/^\+1\d{10}$/.test(String(phone || "").trim())) {
    return String(phone).trim();
  }

  return "";
};

const getSiteOrigin = (req) => {
  const protoHeader = String(req.headers["x-forwarded-proto"] || "https");
  const proto = protoHeader.split(",")[0].trim() || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
};

const buildCakeCheckoutRequest = (order, siteOrigin, supportEmail) => {
  const size = cakeSizeConfig[order.cakeSize];
  if (!size) {
    throw new Error("Select a valid cake size.");
  }

  const lineItems = [
    {
      name: `${getCakeProductLabel(order.productKey)} ${size.label}`,
      quantity: "1",
      base_price_money: {
        amount: size.amount,
        currency: "USD",
      },
    },
  ];

  if (order.extraFilling && order.extraFilling !== "none") {
    lineItems.push({
      name: "Extra cake filling",
      quantity: "1",
      base_price_money: {
        amount: 1000,
        currency: "USD",
      },
    });
  }

  const paymentNote = [
    "Order type: Custom cake",
    `Pickup date: ${order.pickupDate}`,
    `Pickup time: ${order.pickupTime}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Cake name: ${getCakeProductLabel(order.productKey)}`,
    `Occasion: ${getLabel("eventType", order.eventType)}`,
    `Cake size: ${size.label}`,
    `Cake flavor: ${getLabel("flavor", order.flavor)}`,
    `Included filling: ${getLabel("filling", order.filling)}`,
    `Extra filling: ${order.extraFilling === "none" ? "None" : getLabel("filling", order.extraFilling)}`,
    `Frosting: ${getLabel("frosting", order.frosting)}`,
    `Outside cake color: ${getLabel("outsideColor", order.outsideColor)}`,
    `Message on cake: ${order.inscription || "None"}`,
    `Cake notes: ${order.notes || "None"}`,
  ].join(" | ").slice(0, 500);

  const normalizedPhone = normalizePhoneForSquare(order.phone);

  return {
    idempotency_key: crypto.randomUUID(),
    description: `Custom cake order for ${order.customerName}`,
    order: {
      location_id: process.env.SQUARE_LOCATION_ID,
      note: paymentNote,
      line_items: lineItems,
    },
    checkout_options: {
      redirect_url: `${siteOrigin}/cake-order.html?payment=success&type=cake#payment-status`,
      allow_tipping: false,
      enable_coupon: false,
      ...(supportEmail ? { merchant_support_email: supportEmail } : {}),
    },
    pre_populated_data: {
      buyer_email: order.email,
      ...(normalizedPhone ? { buyer_phone_number: normalizedPhone } : {}),
    },
    payment_note: paymentNote,
  };
};

const buildCupcakeCheckoutRequest = (order, siteOrigin, supportEmail) => {
  const quantity = Math.max(1, Number(order.quantity) || 0);
  if (!quantity) {
    throw new Error("Enter a valid cupcake quantity.");
  }

  const lineItems = [
    {
      name: "Custom cupcakes",
      quantity: String(quantity),
      base_price_money: {
        amount: 350,
        currency: "USD",
      },
    },
  ];

  if (order.filling && order.filling !== "none") {
    lineItems.push({
      name: "Cupcake filling surcharge",
      quantity: String(quantity),
      base_price_money: {
        amount: 50,
        currency: "USD",
      },
    });
  }

  const paymentNote = [
    "Order type: Custom cupcakes",
    `Pickup date: ${order.pickupDate}`,
    `Pickup time: ${order.pickupTime}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Quantity: ${quantity}`,
    `Cupcake flavor: ${getLabel("flavor", order.flavor)}`,
    `Filling: ${order.filling === "none" ? "None" : getLabel("filling", order.filling)}`,
    `Cupcake color: ${getLabel("outsideColor", order.outsideColor)}`,
    `Notes: ${order.notes || "None"}`,
  ].join(" | ").slice(0, 500);

  const normalizedPhone = normalizePhoneForSquare(order.phone);

  return {
    idempotency_key: crypto.randomUUID(),
    description: `Custom cupcake order for ${order.customerName}`,
    order: {
      location_id: process.env.SQUARE_LOCATION_ID,
      note: paymentNote,
      line_items: lineItems,
    },
    checkout_options: {
      redirect_url: `${siteOrigin}/cake-order.html?payment=success&type=cupcake#payment-status`,
      allow_tipping: false,
      enable_coupon: false,
      ...(supportEmail ? { merchant_support_email: supportEmail } : {}),
    },
    pre_populated_data: {
      buyer_email: order.email,
      ...(normalizedPhone ? { buyer_phone_number: normalizedPhone } : {}),
    },
    payment_note: paymentNote,
  };
};

const buildCartItemSummary = (item) => {
  if (item?.type === "cake") {
    const size = cakeSizeConfig[item.order?.cakeSize];
    if (!size) {
      throw new Error("Select a valid cake size.");
    }

    const extraFillingCharge =
      item.order?.extraFilling && item.order.extraFilling !== "none" ? 1000 : 0;

    return {
      name: `${getCakeProductLabel(item.order?.productKey)} ${size.label}`,
      amount: size.amount + extraFillingCharge,
      note: [
        `Cake name: ${getCakeProductLabel(item.order?.productKey)}`,
        `Occasion: ${getLabel("eventType", item.order?.eventType)}`,
        `Cake size: ${size.label}`,
        `Cake flavor: ${getLabel("flavor", item.order?.flavor)}`,
        `Included filling: ${getLabel("filling", item.order?.filling)}`,
        `Extra filling: ${
          item.order?.extraFilling === "none"
            ? "None"
            : getLabel("filling", item.order?.extraFilling)
        }`,
        `Frosting: ${getLabel("frosting", item.order?.frosting)}`,
        `Outside cake color: ${getLabel("outsideColor", item.order?.outsideColor)}`,
        `Message on cake: ${item.order?.inscription || "None"}`,
        `Cake notes: ${item.order?.notes || "None"}`,
      ].join(" | ").slice(0, 500),
    };
  }

  if (item?.type === "cupcake") {
    const quantity = Math.max(1, Number(item.order?.quantity) || 0);
    const fillingSurcharge =
      item.order?.filling && item.order.filling !== "none" ? quantity * 50 : 0;

    return {
      name: `Custom cupcakes (${quantity})`,
      amount: quantity * 350 + fillingSurcharge,
      note: [
        `Quantity: ${quantity}`,
        `Cupcake flavor: ${getLabel("flavor", item.order?.flavor)}`,
        `Filling: ${
          item.order?.filling === "none" ? "None" : getLabel("filling", item.order?.filling)
        }`,
        `Cupcake color: ${getLabel("outsideColor", item.order?.outsideColor)}`,
        `Notes: ${item.order?.notes || "None"}`,
      ].join(" | ").slice(0, 500),
    };
  }

  throw new Error("Unsupported cart item.");
};

const buildCartCheckoutRequest = (cart, siteOrigin, supportEmail) => {
  const checkout = cart?.checkout || {};
  const items = Array.isArray(cart?.items) ? cart.items : [];

  const lineItems = items.map((item, index) => {
    const summary = buildCartItemSummary(item);

    return {
      name: `${index + 1}. ${summary.name}`,
      quantity: "1",
      base_price_money: {
        amount: summary.amount,
        currency: "USD",
      },
      note: summary.note,
    };
  });

  const paymentNote = [
    "Order type: Custom order cart",
    `Pickup date: ${checkout.pickupDate}`,
    `Pickup time: ${checkout.pickupTime}`,
    `Customer: ${checkout.customerName}`,
    `Phone: ${checkout.phone}`,
    `Email: ${checkout.email}`,
    `Items in cart: ${items.length}`,
    `Estimated total: $${(lineItems.reduce((sum, item) => sum + item.base_price_money.amount, 0) / 100).toFixed(2)}`,
  ].join(" | ").slice(0, 500);

  const normalizedPhone = normalizePhoneForSquare(checkout.phone);

  return {
    idempotency_key: crypto.randomUUID(),
    description: `Custom order for ${checkout.customerName}`,
    order: {
      location_id: process.env.SQUARE_LOCATION_ID,
      note: paymentNote,
      line_items: lineItems,
    },
    checkout_options: {
      redirect_url: `${siteOrigin}/cake-order.html?payment=success&type=cart#payment-status`,
      allow_tipping: false,
      enable_coupon: false,
      ...(supportEmail ? { merchant_support_email: supportEmail } : {}),
    },
    pre_populated_data: {
      buyer_email: checkout.email,
      ...(normalizedPhone ? { buyer_phone_number: normalizedPhone } : {}),
    },
    payment_note: paymentNote,
  };
};

const validateCakeOrder = (order) => {
  if (!requiredString(order.pickupDate) || !requiredString(order.pickupTime)) {
    throw new Error("Choose a pickup date and time.");
  }
  if (!requiredString(order.customerName) || !requiredString(order.phone) || !requiredString(order.email)) {
    throw new Error("Name, phone, and email are required.");
  }
};

const validateCupcakeOrder = (order) => {
  if (!requiredString(order.pickupDate) || !requiredString(order.pickupTime)) {
    throw new Error("Choose a pickup date and time.");
  }
  if (!requiredString(order.customerName) || !requiredString(order.phone) || !requiredString(order.email)) {
    throw new Error("Name, phone, and email are required.");
  }
  if ((Number(order.quantity) || 0) < 1) {
    throw new Error("Enter a valid cupcake quantity.");
  }
};

const validateCartOrder = (cart) => {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const checkout = cart?.checkout || {};

  if (!items.length) {
    throw new Error("Add at least one product to the cart.");
  }

  if (!requiredString(checkout.pickupDate) || !requiredString(checkout.pickupTime)) {
    throw new Error("Choose a pickup date and time.");
  }

  if (
    !requiredString(checkout.customerName) ||
    !requiredString(checkout.phone) ||
    !requiredString(checkout.email)
  ) {
    throw new Error("Name, phone, and email are required.");
  }

  items.forEach((item) => {
    if (item?.type === "cake") {
      const size = cakeSizeConfig[item.order?.cakeSize];
      if (!size) {
        throw new Error("Select a valid cake size.");
      }
      return;
    }

    if (item?.type === "cupcake") {
      if ((Number(item.order?.quantity) || 0) < 1) {
        throw new Error("Enter a valid cupcake quantity.");
      }
      return;
    }

    throw new Error("Unsupported cart item.");
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const requiredEnvKeys = ["SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID"];
  const missingEnvKeys = requiredEnvKeys.filter(
    (key) => !String(process.env[key] || "").trim(),
  );

  if (missingEnvKeys.length > 0) {
    return res.status(500).json({
      error: "Square is not configured yet.",
      missing: missingEnvKeys,
    });
  }

  try {
    const { orderType, order, cart } = await readJsonBody(req);
    const siteOrigin = getSiteOrigin(req);
    const supportEmail = process.env.SQUARE_SUPPORT_EMAIL || "";

    let requestBody;

    if (orderType === "cake") {
      validateCakeOrder(order);
      requestBody = buildCakeCheckoutRequest(order, siteOrigin, supportEmail);
    } else if (orderType === "cupcake") {
      validateCupcakeOrder(order);
      requestBody = buildCupcakeCheckoutRequest(order, siteOrigin, supportEmail);
    } else if (orderType === "cart") {
      validateCartOrder(cart);
      requestBody = buildCartCheckoutRequest(cart, siteOrigin, supportEmail);
    } else {
      return res.status(400).json({ error: "Unsupported order type." });
    }

    const response = await fetch(SQUARE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": SQUARE_API_VERSION,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const squareError = data.errors?.[0]?.detail || data.errors?.[0]?.code;
      return res.status(response.status).json({
        error: squareError || "Square could not create the checkout link.",
      });
    }

    return res.status(200).json({
      checkoutUrl: data.payment_link?.url || data.payment_link?.long_url,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unable to create the Square checkout link.",
    });
  }
}
