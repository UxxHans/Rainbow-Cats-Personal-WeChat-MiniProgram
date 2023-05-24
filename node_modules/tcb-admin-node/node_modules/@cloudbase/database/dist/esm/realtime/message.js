export function genRequestId(prefix = '') {
    return `${prefix ? `${prefix}_` : ''}${+new Date()}_${Math.random()}`;
}
export function isInitEventMessage(msg) {
    return msg.msgType === 'INIT_EVENT';
}
