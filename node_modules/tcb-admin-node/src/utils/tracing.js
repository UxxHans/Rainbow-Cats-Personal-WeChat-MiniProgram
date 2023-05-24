let seqNum = 0

function getSeqNum() {
  return ++seqNum
}

function generateEvnentId() {
  return (
    Date.now() +
    '_' +
    getSeqNum() +
    '_' +
    Math.random()
      .toString()
      .substr(2, 5)
  )
}

exports.generateTracingInfo = function generateTracingInfo() {
  const TCB_SEQID = process.env.TCB_SEQID || ''
  const eventId = generateEvnentId()
  const seqId = TCB_SEQID ? `${TCB_SEQID}-${eventId}` : eventId

  return { eventId, seqId }
}
