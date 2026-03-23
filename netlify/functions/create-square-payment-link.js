import crypto from "node:crypto";

const SQUARE_API_VERSION = "2026-01-22";
const SQUARE_API_URL = "https://connect.squareup.com/v2/online-checkout/payment-links";

const cakeSizeConfig = {
  "1-inch-test": { label: '1" (test)', amount: 10 },
  "6-inch": { label: '6"', amount: 6500 },
  "8-inch": { label: '8"', amount: 7500 },
  "10-inch": { label: '10"', amount: 8500 },
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

const ok = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;

const getLabel = (group, value) => optionLabels[group]?.[value] ?? value ?? "";

const normalizePhoneForSquare = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  // Accept 10-digit US numbers and convert to E.164.
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Accept 11-digit US numbers with leading country code 1.
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // Accept already formatted +1XXXXXXXXXX values.
  if (/^\+1\d{10}$/.test(String(phone || "").trim())) {
    return String(phone).trim();
  }

  // Return empty so we can omit it from pre-populated buyer data.
  return "";
};

const getSiteOrigin = (event) => {
  if (event.rawUrl) {
    return new URL(event.rawUrl).origin;
  }

  const proto = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers.host;
  return `${proto}://${host}`;
};

const buildCakeCheckoutRequest = (order, siteOrigin, supportEmail) => {
  const size = cakeSizeConfig[order.cakeSize];
  if (!size) {
    throw new Error("Select a valid cake size.");
  }

  const lineItems = [
    {
      name: `Custom cake ${size.label}`,
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
    `Cake pickup: ${order.pickupDate} ${order.pickupTime}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Flavor: ${getLabel("flavor", order.flavor)}`,
    `Included filling: ${getLabel("filling", order.filling)}`,
    `Extra filling: ${order.extraFilling === "none" ? "None" : getLabel("filling", order.extraFilling)}`,
    `Frosting: ${getLabel("frosting", order.frosting)}`,
    `Outside color: ${getLabel("outsideColor", order.outsideColor)}`,
    `Message: ${order.inscription || "None"}`,
    `Notes: ${order.notes || "None"}`,
  ].join(" | ").slice(0, 500);

  const normalizedPhone = normalizePhoneForSquare(order.phone);

  return {
    idempotency_key: crypto.randomUUID(),
    description: `Custom cake order for ${order.customerName}`,
    order: {
      location_id: process.env.SQUARE_LOCATION_ID,
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
    `Cupcake pickup: ${order.pickupDate} ${order.pickupTime}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Quantity: ${quantity}`,
    `Flavor: ${getLabel("flavor", order.flavor)}`,
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

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return ok(405, { error: "Method not allowed." });
  }

  const requiredEnvKeys = ["SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID"];
  const missingEnvKeys = requiredEnvKeys.filter(
    (key) => !String(process.env[key] || "").trim(),
  );

  if (missingEnvKeys.length > 0) {
    return ok(500, {
      error: "Square is not configured yet.",
      missing: missingEnvKeys,
    });
  }

  try {
    const { orderType, order } = JSON.parse(event.body || "{}");
    const siteOrigin = getSiteOrigin(event);
    const supportEmail = process.env.SQUARE_SUPPORT_EMAIL || "";

    let requestBody;

    if (orderType === "cake") {
      validateCakeOrder(order);
      requestBody = buildCakeCheckoutRequest(order, siteOrigin, supportEmail);
    } else if (orderType === "cupcake") {
      validateCupcakeOrder(order);
      requestBody = buildCupcakeCheckoutRequest(order, siteOrigin, supportEmail);
    } else {
      return ok(400, { error: "Unsupported order type." });
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
      return ok(response.status, {
        error: squareError || "Square could not create the checkout link.",
      });
    }

    return ok(200, {
      checkoutUrl: data.payment_link?.url || data.payment_link?.long_url,
    });
  } catch (error) {
    return ok(500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to create the Square checkout link.",
    });
  }
};

export default handler;
