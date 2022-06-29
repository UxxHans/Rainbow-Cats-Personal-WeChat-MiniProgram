"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const update_1 = require("../commands/update");
const symbol_1 = require("../helper/symbol");
const type_1 = require("../utils/type");
const operator_map_1 = require("../operator-map");
const common_1 = require("./common");
class UpdateSerializer {
    constructor() { }
    static encode(query) {
        const stringifier = new UpdateSerializer();
        return stringifier.encodeUpdate(query);
    }
    encodeUpdate(query) {
        if (update_1.isUpdateCommand(query)) {
            return this.encodeUpdateCommand(query);
        }
        else if (type_1.getType(query) === 'object') {
            return this.encodeUpdateObject(query);
        }
        else {
            return query;
        }
    }
    encodeUpdateCommand(query) {
        if (query.fieldName === symbol_1.SYMBOL_UNSET_FIELD_NAME) {
            throw new Error('Cannot encode a comparison command with unset field name');
        }
        switch (query.operator) {
            case update_1.UPDATE_COMMANDS_LITERAL.PUSH:
            case update_1.UPDATE_COMMANDS_LITERAL.PULL:
            case update_1.UPDATE_COMMANDS_LITERAL.PULL_ALL:
            case update_1.UPDATE_COMMANDS_LITERAL.POP:
            case update_1.UPDATE_COMMANDS_LITERAL.SHIFT:
            case update_1.UPDATE_COMMANDS_LITERAL.UNSHIFT:
            case update_1.UPDATE_COMMANDS_LITERAL.ADD_TO_SET: {
                return this.encodeArrayUpdateCommand(query);
            }
            default: {
                return this.encodeFieldUpdateCommand(query);
            }
        }
    }
    encodeFieldUpdateCommand(query) {
        const $op = operator_map_1.operatorToString(query.operator);
        switch (query.operator) {
            case update_1.UPDATE_COMMANDS_LITERAL.REMOVE: {
                return {
                    [$op]: {
                        [query.fieldName]: ''
                    }
                };
            }
            default: {
                return {
                    [$op]: {
                        [query.fieldName]: query.operands[0]
                    }
                };
            }
        }
    }
    encodeArrayUpdateCommand(query) {
        const $op = operator_map_1.operatorToString(query.operator);
        switch (query.operator) {
            case update_1.UPDATE_COMMANDS_LITERAL.PUSH: {
                let modifiers;
                if (type_1.isArray(query.operands)) {
                    modifiers = {
                        $each: query.operands.map(common_1.encodeInternalDataType)
                    };
                }
                else {
                    modifiers = query.operands;
                }
                return {
                    [$op]: {
                        [query.fieldName]: modifiers
                    }
                };
            }
            case update_1.UPDATE_COMMANDS_LITERAL.UNSHIFT: {
                const modifiers = {
                    $each: query.operands.map(common_1.encodeInternalDataType),
                    $position: 0
                };
                return {
                    [$op]: {
                        [query.fieldName]: modifiers
                    }
                };
            }
            case update_1.UPDATE_COMMANDS_LITERAL.POP: {
                return {
                    [$op]: {
                        [query.fieldName]: 1
                    }
                };
            }
            case update_1.UPDATE_COMMANDS_LITERAL.SHIFT: {
                return {
                    [$op]: {
                        [query.fieldName]: -1
                    }
                };
            }
            default: {
                return {
                    [$op]: {
                        [query.fieldName]: common_1.encodeInternalDataType(query.operands)
                    }
                };
            }
        }
    }
    encodeUpdateObject(query) {
        const flattened = common_1.flattenQueryObject(query);
        for (const key in flattened) {
            if (/^\$/.test(key))
                continue;
            let val = flattened[key];
            if (update_1.isUpdateCommand(val)) {
                flattened[key] = val._setFieldName(key);
                const condition = this.encodeUpdateCommand(flattened[key]);
                common_1.mergeConditionAfterEncode(flattened, condition, key);
            }
            else {
                flattened[key] = val = common_1.encodeInternalDataType(val);
                const $setCommand = new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.SET, [val], key);
                const condition = this.encodeUpdateCommand($setCommand);
                common_1.mergeConditionAfterEncode(flattened, condition, key);
            }
        }
        return flattened;
    }
}
exports.UpdateSerializer = UpdateSerializer;
