export const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));
const counters = {};
export const autoCount = (domain = 'any') => {
    if (!counters[domain]) {
        counters[domain] = 0;
    }
    return counters[domain]++;
};
