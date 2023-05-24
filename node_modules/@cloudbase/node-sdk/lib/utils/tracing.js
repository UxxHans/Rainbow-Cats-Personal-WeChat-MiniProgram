"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudbase_1 = require("../cloudbase");
let seqNum = 0;
function getSeqNum() {
    return ++seqNum;
}
function generateEventId() {
    return Date.now().toString(16) + '_' + getSeqNum().toString(16);
}
exports.generateTracingInfo = () => {
    let { TCB_SEQID, TCB_TRACELOG } = cloudbase_1.CloudBase.getCloudbaseContext();
    TCB_SEQID = TCB_SEQID || '';
    const eventId = generateEventId();
    const seqId = TCB_SEQID ? `${TCB_SEQID}-${eventId}` : eventId;
    return { eventId, seqId, trace: TCB_TRACELOG };
};
