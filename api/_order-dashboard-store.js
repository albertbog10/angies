import fs from "node:fs/promises";

const DASHBOARD_FILE_PATH =
  process.env.ORDER_DASHBOARD_FILE || "/tmp/angies-order-dashboard.json";
const NOTIFIED_PAYMENTS_FILE_PATH =
  process.env.ORDER_NOTIFIED_PAYMENTS_FILE || "/tmp/angies-notified-payments.json";
const MAX_ORDER_RECORDS = 250;
const MAX_NOTIFIED_PAYMENTS = 500;

let inMemoryRecords = [];
let inMemoryNotifiedPaymentIds = [];

const normalizeOrderRecord = (record = {}) => ({
  createdAt: record.createdAt || new Date().toISOString(),
  amount: record.amount || "Unknown",
  orderId: record.orderId || "Unknown",
  paymentId: record.paymentId || "Unknown",
  customerEmail: record.customerEmail || "",
  details: record.details || "",
  receiptUrl: record.receiptUrl || "",
  source: record.source || "square-webhook",
});

const safeReadFileRecords = async () => {
  try {
    const raw = await fs.readFile(DASHBOARD_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeOrderRecord);
  } catch {
    return [];
  }
};

const safeWriteFileRecords = async (records) => {
  try {
    await fs.writeFile(
      DASHBOARD_FILE_PATH,
      JSON.stringify(records, null, 2),
      "utf8",
    );
  } catch {
    // Ignore file persistence failures; in-memory fallback still works.
  }
};

const safeReadNotifiedPayments = async () => {
  try {
    const raw = await fs.readFile(NOTIFIED_PAYMENTS_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value) => typeof value === "string" && value.trim());
  } catch {
    return [];
  }
};

const safeWriteNotifiedPayments = async (paymentIds) => {
  try {
    await fs.writeFile(
      NOTIFIED_PAYMENTS_FILE_PATH,
      JSON.stringify(paymentIds, null, 2),
      "utf8",
    );
  } catch {
    // Ignore file persistence failures; in-memory fallback still works.
  }
};

export const listOrderRecords = async () => {
  const fileRecords = await safeReadFileRecords();
  if (fileRecords.length > 0) {
    inMemoryRecords = fileRecords;
    return fileRecords;
  }
  return inMemoryRecords;
};

export const appendOrderRecord = async (record) => {
  const normalized = normalizeOrderRecord(record);
  const existing = await listOrderRecords();
  const withoutDuplicate = existing.filter(
    (entry) =>
      !(
        normalized.paymentId &&
        entry.paymentId &&
        entry.paymentId === normalized.paymentId
      ),
  );
  const next = [normalized, ...withoutDuplicate].slice(0, MAX_ORDER_RECORDS);
  inMemoryRecords = next;
  await safeWriteFileRecords(next);
  return normalized;
};

export const hasProcessedPayment = async (paymentId) => {
  if (!paymentId) {
    return false;
  }

  const filePaymentIds = await safeReadNotifiedPayments();
  if (filePaymentIds.length > 0) {
    inMemoryNotifiedPaymentIds = filePaymentIds;
    return filePaymentIds.includes(paymentId);
  }

  return inMemoryNotifiedPaymentIds.includes(paymentId);
};

export const markProcessedPayment = async (paymentId) => {
  if (!paymentId) {
    return;
  }

  const existing = await safeReadNotifiedPayments();
  const source = existing.length > 0 ? existing : inMemoryNotifiedPaymentIds;
  const next = [paymentId, ...source.filter((entry) => entry !== paymentId)].slice(
    0,
    MAX_NOTIFIED_PAYMENTS,
  );
  inMemoryNotifiedPaymentIds = next;
  await safeWriteNotifiedPayments(next);
};

export const clearOrderRecords = async () => {
  inMemoryRecords = [];
  await safeWriteFileRecords([]);
};
