const { todayIST, addDays } = require('../utils/date');

// Cutoff time in 24-hour format: 21:00 = 9:00 PM IST
const CUTOFF_HOUR = 21;
const CUTOFF_MINUTE = 0;

/**
 * Checks whether changes (skips, add-ons, quantity modifications) can be made for targetDate.
 * Rule: Must be requested before 9:00 PM IST of the day prior to targetDate.
 *
 * @param {string} targetDate - Target delivery date 'YYYY-MM-DD'
 * @returns {{ allowed: boolean, reason?: string, cutoff: string }}
 */
function canModifyFor(targetDate) {
    const today = todayIST();
    const target = String(targetDate).slice(0, 10);

    if (target <= today) {
        return {
            allowed: false,
            reason: `Changes for today (${today}) or past dates are closed. Modifications must be requested before 9:00 PM the previous day.`,
            cutoff: '21:00'
        };
    }

    const tomorrow = addDays(today, 1);
    if (target === tomorrow) {
        // Check current IST time against 9:00 PM (21:00)
        const now = new Date();
        const istTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
        const [hour, minute] = istTimeStr.split(':').map(Number);

        if (hour > CUTOFF_HOUR || (hour === CUTOFF_HOUR && minute >= CUTOFF_MINUTE)) {
            return {
                allowed: false,
                reason: `Cutoff passed: Orders and adjustments for tomorrow (${tomorrow}) close strictly at 9:00 PM IST.`,
                cutoff: '21:00'
            };
        }
    }

    return { allowed: true, cutoff: '21:00' };
}

module.exports = {
    CUTOFF_HOUR,
    CUTOFF_MINUTE,
    canModifyFor
};
