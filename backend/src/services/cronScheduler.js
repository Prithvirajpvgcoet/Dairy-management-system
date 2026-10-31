const cron = require('node-cron');
const { generateForDate } = require('./deliveryGenerator');
const { todayIST, addDays } = require('../utils/date');
const { runNightlyBackup } = require('../jobs/backupJob');

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

    // 02:00 IST daily: automated database backup with 14-day retention
    cron.schedule('0 2 * * *', () => {
        console.log('[Cron] 02:00 IST trigger: Running nightly database backup');
        try {
            runNightlyBackup();
        } catch (err) {
            console.error('[Cron] Failed 02:00 database backup:', err);
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

    console.log('[Cron] Jobs scheduled: 23:30 IST (deliveries), 02:00 IST (backup), 04:30 IST (safety re-run).');
}

module.exports = { startCronJobs };
