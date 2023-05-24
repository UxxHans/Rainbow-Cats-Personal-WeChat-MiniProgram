"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const query_1 = require("./commands/query");
const logic_1 = require("./commands/logic");
const update_1 = require("./commands/update");
exports.OperatorMap = {};
for (const key in query_1.QUERY_COMMANDS_LITERAL) {
    exports.OperatorMap[key] = '$' + key;
}
for (const key in logic_1.LOGIC_COMMANDS_LITERAL) {
    exports.OperatorMap[key] = '$' + key;
}
for (const key in update_1.UPDATE_COMMANDS_LITERAL) {
    exports.OperatorMap[key] = '$' + key;
}
exports.OperatorMap[query_1.QUERY_COMMANDS_LITERAL.NEQ] = '$ne';
exports.OperatorMap[update_1.UPDATE_COMMANDS_LITERAL.REMOVE] = '$unset';
exports.OperatorMap[update_1.UPDATE_COMMANDS_LITERAL.SHIFT] = '$pop';
exports.OperatorMap[update_1.UPDATE_COMMANDS_LITERAL.UNSHIFT] = '$push';
function operatorToString(operator) {
    return exports.OperatorMap[operator] || '$' + operator;
}
exports.operatorToString = operatorToString;
