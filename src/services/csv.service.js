const csv = require('csv-parser');
const { Readable } = require('stream');
const Member = require('../models/Member');

const REQUIRED_FIELDS = ['name', 'email', 'contactNumber', 'admissionDate', 'seatType', 'monthlyFee'];

const processCSV = async (fileBuffer) => {
  return new Promise((resolve) => {
    const rows = [];
    const stream = Readable.from(fileBuffer);

    stream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        const preview = rows.slice(0, 5);
        resolve({ rows, preview, total: rows.length });
      });
  });
};

const bulkInsertMembers = async (rows) => {
  let success = 0;
  const failures = [];

  for (const [index, row] of rows.entries()) {
    try {
      // Validate required fields
      const missing = REQUIRED_FIELDS.filter((f) => !row[f]);
      if (missing.length) throw new Error(`Missing fields: ${missing.join(', ')}`);

      if (!['full-time', 'half-time'].includes(row.seatType)) {
        throw new Error('Invalid seatType');
      }

      await Member.create({
        name: row.name?.trim(),
        email: row.email?.toLowerCase().trim(),
        contactNumber: row.contactNumber?.trim(),
        admissionDate: new Date(row.admissionDate),
        seatType: row.seatType,
        monthlyFee: parseFloat(row.monthlyFee),
        nextPaymentDate: row.nextPaymentDate ? new Date(row.nextPaymentDate) : null,
      });
      success++;
    } catch (err) {
      failures.push({ row: index + 1, error: err.message, data: row });
    }
  }

  return { success, failureCount: failures.length, failures };
};

module.exports = { processCSV, bulkInsertMembers };
