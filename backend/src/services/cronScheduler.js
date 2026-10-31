const cron = require('node-cron');
const { generateForDate } = require('./deliveryGenerator');
const { todayIST, addDays } = require('../utils/date');

function startCronJobs() {
    console.log('[Cron] Initializing daily delivery generator scheduler in Asia/Kolkata timezone...');

    // 23:30 IST daily: generate tomorrow's deliveries
    cron.schedule('30 23 * * *', async () => {
        const tomorrow = addDays(todayIST(), 1);
        console.log(`[Cron] 23:30 IST trigger: Generating deliveries for tomorrow (${tomorrow})`);
        try {
            await generateForDate(tomorrow);
        } catch (err) {
            console.error('[Cron] Failed 23:30 delivery generation:', err);
        }
    }, {
        timezone: 'Asia/Kolkata'
    });

    // 04:30 IST daily: safety re-run for today
    cron.schedule('30 4 * * *', async () => {
        const today = todayIST();
        console.log(`[Cron] 04:30 IST trigger: Safety re-run generation for today (${today})`);
        try {
            await generateForDate(today);
        } catch (err) {
            console.error('[Cron] Failed 04:30 delivery generation:', err);
        }
    }, {
        timezone: 'Asia/Kolkata'
    });

    console.log('[Cron] Delivery generator cron jobs scheduled: 23:30 IST (tomorrow) & 04:30 IST (today).');
}

module.exports = { startCronJobs };
