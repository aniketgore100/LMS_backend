const cron = require('node-cron');
const Member = require('../models/Member');
const mailService = require('../services/mail.service');

const paymentReminderJob = () => {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running payment reminder job...');
    try {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const members = await Member.find({
        status: 'ongoing',
        paymentStatus: 'due',
        nextPaymentDate: { $gte: today, $lte: threeDaysFromNow },
      });

      console.log(`[CRON] Found ${members.length} members with upcoming payments`);

      for (const member of members) {
        try {
          await mailService.sendPaymentReminder(member);
          console.log(`[CRON] Reminder sent to ${member.email}`);
        } catch (err) {
          console.error(`[CRON] Failed to send reminder to ${member.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[CRON] Payment reminder job failed:', err.message);
    }
  });

  console.log('[CRON] Payment reminder job scheduled');
};

module.exports = paymentReminderJob;
