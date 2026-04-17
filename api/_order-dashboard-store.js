import fs from "node:fs/promises";

const DASHBOARD_FILE_PATH =
  process.env.ORDER_DASHBOARD_FILE || "/tmp/angies-order-dashboard.json";
const MAX_ORDER_RECORDS = 250;

let inMemoryRecords = [];

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
  const next = [normalized, ...existing].slice(0, MAX_ORDER_RECORDS);
  inMemoryRecords = next;
  await safeWriteFileRecords(next);
  return normalized;
};

export const clearOrderRecords = async () => {
  inMemoryRecords = [];
  await safeWriteFileRecords([]);
};
