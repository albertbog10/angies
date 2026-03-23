import crypto from "node:crypto";

const SQUARE_API_VERSION = "2026-01-22";
const SQUARE_GET_PAYMENT_URL = "https://connect.squareup.com/v2/payments";

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const getHeader = (headers = {}, key) => {
  const target = String(key || "").toLowerCase();
  const match = Object.entries(headers).find(
    ([headerName]) => String(headerName).toLowerCase() === target,
  );
  return match?.[1] || "";
};

const safeTimingEqual = (left, right) => {
  const leftBuffer = Buffer.from(left || "", "utf8");
  const rightBuffer = Buffer.from(right || "", "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const verifySquareWebhookSignature = ({
  rawBody,
  signatureHeader,
  notificationUrl,
  signatureKey,
}) => {
  const payload = `${notificationUrl}${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", signatureKey)
    .update(payload, "utf8")
    .digest("base64");

  return safeTimingEqual(expectedSignature, signatureHeader);
};

const formatAmount = (money) => {
  if (!money || typeof money.amount !== "number") {
    return "Unknown";
  }

  return `${(money.amount / 100).toFixed(2)} ${money.currency || "USD"}`;
};

const fetchPaymentById = async (paymentId) => {
  const response = await fetch(
    `${SQUARE_GET_PAYMENT_URL}/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": SQUARE_API_VERSION,
        "Content-Type": "application/json",
      },
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const detail = payload.errors?.[0]?.detail || payload.errors?.[0]?.code;
    throw new Error(detail || "Square payment lookup failed.");
  }

  return payload.payment;
};

const hasTwilioConfig = () =>
  Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_PHONE &&
      process.env.ORDER_ALERT_TO_PHONE,
  );

const hasResendConfig = () => Boolean(process.env.RESEND_API_KEY);

const sendTwilioSms = async (messageBody) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const fromPhone = process.env.TWILIO_FROM_PHONE || "";
  const toPhone = process.env.ORDER_ALERT_TO_PHONE || "";

  if (!accountSid || !authToken || !fromPhone || !toPhone) {
    throw new Error(
      "Missing Twilio config. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_PHONE, and ORDER_ALERT_TO_PHONE.",
    );
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
  const params = new URLSearchParams({
    To: toPhone,
    From: fromPhone,
    Body: messageBody,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Twilio SMS failed: ${responseText}`);
  }
};

const sendResendEmail = async ({ toEmail, subject, body, idempotencyKey }) => {
  const apiKey = process.env.RESEND_API_KEY || "";
  const fromEmail =
    process.env.ORDER_FROM_EMAIL || "Angies Bakery <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    throw new Error(
      "Missing email config. Set RESEND_API_KEY and valid recipient email.",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      text: body,
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Resend email failed: ${raw}`);
  }
};

const parseEmailFromNote = (note) => {
  const match = String(note || "").match(/email:\s*([^|\n]+)/i);
  return match?.[1]?.trim() || "";
};

const buildOrderDetails = (payment) => {
  const amount = formatAmount(payment.amount_money);
  const note = payment.note || payment.payment_note || "";
  const orderId = payment.order_id || "Unknown";
  const paymentId = payment.id || "Unknown";
  const details = note
    ? note
        .split("|")
        .map((piece) => piece.trim())
        .filter(Boolean)
        .join("\n")
    : "Detailed cake info was not included in the payment note.";

  return {
    amount,
    orderId,
    paymentId,
    note,
    details,
  };
};

const buildNotificationBody = (payment) => {
  const { amount, orderId, paymentId, details } = buildOrderDetails(payment);

  return [
    "New paid custom order",
    `Amount: ${amount}`,
    `Payment ID: ${paymentId}`,
    `Order ID: ${orderId}`,
    "Details:",
    details,
  ]
    .join("\n")
    .slice(0, 1500);
};

const getCustomerEmail = (payment) => {
  const fromPayment = String(payment.buyer_email_address || "").trim();
  if (fromPayment) {
    return fromPayment;
  }

  const note = payment.note || payment.payment_note || "";
  const fromNote = parseEmailFromNote(note);
  if (fromNote) {
    return fromNote;
  }

  return "";
};

const buildCustomerReceiptBody = (payment) => {
  const { amount, orderId, paymentId, details } = buildOrderDetails(payment);
  const receiptUrl = payment.receipt_url || "";

  return [
    "Thanks for your order with Angies Bakery.",
    "",
    "Payment received",
    `Amount: ${amount}`,
    `Payment ID: ${paymentId}`,
    `Order ID: ${orderId}`,
    "",
    "Order details",
    details,
    ...(receiptUrl ? ["", `Square receipt: ${receiptUrl}`] : []),
    "",
    "Need help? Call 732-515-9515.",
  ]
    .join("\n")
    .slice(0, 1500);
};

const sendOrderNotification = async (payment) => {
  const channelPreference = (
    process.env.ORDER_NOTIFICATION_CHANNEL || "email"
  ).toLowerCase();
  const messageBody = buildNotificationBody(payment);
  const ownerEmail = process.env.ORDER_ALERT_EMAIL || "";
  const customerEmail = getCustomerEmail(payment);
  const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();
  const normalizedCustomerEmail = customerEmail.trim().toLowerCase();
  const notificationId = payment.id || payment.order_id || crypto.randomUUID();

  if (channelPreference === "email") {
    if (!hasResendConfig()) {
      throw new Error(
        "Email notifications are enabled but not configured. Set RESEND_API_KEY first.",
      );
    }

    if (!ownerEmail) {
      throw new Error(
        "Missing ORDER_ALERT_EMAIL for owner notifications.",
      );
    }

    await sendResendEmail({
      toEmail: ownerEmail,
      subject: "New paid custom order",
      body: messageBody,
      idempotencyKey: `owner-${notificationId}`,
    });

    if (!normalizedCustomerEmail) {
      return { channel: "email", ownerEmail, customerEmail: "", customerEmailSent: false };
    }

    if (normalizedCustomerEmail === normalizedOwnerEmail) {
      return { channel: "email", ownerEmail, customerEmail, customerEmailSent: false };
    }

    await sendResendEmail({
      toEmail: customerEmail,
      subject: "Your Angies Bakery receipt",
      body: buildCustomerReceiptBody(payment),
      idempotencyKey: `customer-${notificationId}-${normalizedCustomerEmail}`,
    });
    return { channel: "email", ownerEmail, customerEmail, customerEmailSent: true };
  }

  if (channelPreference === "sms") {
    if (!hasTwilioConfig()) {
      throw new Error(
        "SMS notifications are enabled but Twilio is not fully configured.",
      );
    }

    await sendTwilioSms(messageBody);
    return { channel: "sms" };
  }

  if (channelPreference === "auto") {
    if (hasResendConfig() && ownerEmail && customerEmail) {
      await sendResendEmail({
        toEmail: ownerEmail,
        subject: "New paid custom order",
        body: messageBody,
        idempotencyKey: `owner-${notificationId}`,
      });
      if (normalizedCustomerEmail && normalizedCustomerEmail !== normalizedOwnerEmail) {
        await sendResendEmail({
          toEmail: customerEmail,
          subject: "Your Angies Bakery receipt",
          body: buildCustomerReceiptBody(payment),
          idempotencyKey: `customer-${notificationId}-${normalizedCustomerEmail}`,
        });
        return { channel: "email", ownerEmail, customerEmail, customerEmailSent: true };
      }
      return { channel: "email", ownerEmail, customerEmail, customerEmailSent: false };
    }

    if (hasTwilioConfig()) {
      await sendTwilioSms(messageBody);
      return { channel: "sms" };
    }

    throw new Error(
      "No notification channel is configured. Add email settings or Twilio SMS settings.",
    );
  }

  throw new Error(
    "Invalid ORDER_NOTIFICATION_CHANNEL. Use 'email', 'sms', or 'auto'.",
  );
};

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || "";
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";
  const signatureHeader =
    getHeader(event.headers, "x-square-hmacsha256-signature") ||
    getHeader(event.headers, "x-square-signature") ||
    "";

  // If signature settings are configured, enforce validation.
  if (notificationUrl && signatureKey) {
    const isValidSignature = verifySquareWebhookSignature({
      rawBody,
      signatureHeader,
      notificationUrl,
      signatureKey,
    });

    if (!isValidSignature) {
      return json(403, { error: "Invalid Square webhook signature." });
    }
  }

  try {
    const payload = JSON.parse(rawBody || "{}");
    const eventType = payload.type || payload.event_type || "";

    // Only handle completed payments.
    if (eventType !== "payment.updated") {
      return json(200, { ignored: true, reason: `Unhandled event type: ${eventType || "unknown"}` });
    }

    const embeddedPayment = payload.data?.object?.payment || null;
    const paymentId =
      embeddedPayment?.id || payload.data?.id || payload.data?.object?.id || "";

    if (!paymentId) {
      return json(400, { error: "Missing payment ID in webhook payload." });
    }

    let payment = embeddedPayment;

    if (paymentId && process.env.SQUARE_ACCESS_TOKEN) {
      try {
        payment = await fetchPaymentById(paymentId);
      } catch (error) {
        if (!embeddedPayment) {
          throw error;
        }
      }
    }

    if (payment.status !== "COMPLETED") {
      return json(200, { ignored: true, reason: `Payment status is ${payment.status}` });
    }

    const notification = await sendOrderNotification(payment);

    return json(200, { ok: true, notificationSent: true, ...notification });
  } catch (error) {
    return json(500, {
      error:
        error instanceof Error
          ? error.message
          : "Failed to process Square webhook.",
    });
  }
};

export default handler;
