/**
 * Date helper utilities for Indian Standard Time (IST - Asia/Kolkata).
 * Guarantees business dates match IST (+05:30) regardless of host system/server time.
 */

function todayIST() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function nowIST() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00+05:30');
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function isDateBefore(dateStr1, dateStr2) {
    return String(dateStr1).slice(0, 10) < String(dateStr2).slice(0, 10);
}

function isDateAfter(dateStr1, dateStr2) {
    return String(dateStr1).slice(0, 10) > String(dateStr2).slice(0, 10);
}

function isPastNoonIST(d = new Date()) {
    const istTimeStr = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    const [h] = istTimeStr.split(':').map(Number);
    return h >= 12;
}

module.exports = {
    todayIST,
    nowIST,
    addDays,
    isDateBefore,
    isDateAfter,
    isPastNoonIST
};
