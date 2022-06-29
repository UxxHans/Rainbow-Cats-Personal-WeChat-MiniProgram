import { SYMBOL_UNSET_FIELD_NAME, SYMBOL_LOGIC_COMMAND } from '../helper/symbol';
import { isQueryCommand } from './query';
export const AND = 'and';
export const OR = 'or';
export const NOT = 'not';
export const NOR = 'nor';
export var LOGIC_COMMANDS_LITERAL;
(function (LOGIC_COMMANDS_LITERAL) {
    LOGIC_COMMANDS_LITERAL["AND"] = "and";
    LOGIC_COMMANDS_LITERAL["OR"] = "or";
    LOGIC_COMMANDS_LITERAL["NOT"] = "not";
    LOGIC_COMMANDS_LITERAL["NOR"] = "nor";
})(LOGIC_COMMANDS_LITERAL || (LOGIC_COMMANDS_LITERAL = {}));
export class LogicCommand {
    constructor(operator, operands, fieldName) {
        this._internalType = SYMBOL_LOGIC_COMMAND;
        Object.defineProperties(this, {
            _internalType: {
                enumerable: false,
                configurable: false,
            },
        });
        this.operator = operator;
        this.operands = operands;
        this.fieldName = fieldName || SYMBOL_UNSET_FIELD_NAME;
        if (this.fieldName !== SYMBOL_UNSET_FIELD_NAME) {
            if (Array.isArray(operands)) {
                operands = operands.slice();
                this.operands = operands;
                for (let i = 0, len = operands.length; i < len; i++) {
                    const query = operands[i];
                    if (isLogicCommand(query) || isQueryCommand(query)) {
                        operands[i] = query._setFieldName(this.fieldName);
                    }
                }
            }
            else {
                const query = operands;
                if (isLogicCommand(query) || isQueryCommand(query)) {
                    operands = query._setFieldName(this.fieldName);
                }
            }
        }
    }
    _setFieldName(fieldName) {
        const operands = this.operands.map(operand => {
            if (operand instanceof LogicCommand) {
                return operand._setFieldName(fieldName);
            }
            else {
                return operand;
            }
        });
        const command = new LogicCommand(this.operator, operands, fieldName);
        return command;
    }
    and(...__expressions__) {
        const expressions = Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments);
        expressions.unshift(this);
        return new LogicCommand(LOGIC_COMMANDS_LITERAL.AND, expressions, this.fieldName);
    }
    or(...__expressions__) {
        const expressions = Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments);
        expressions.unshift(this);
        return new LogicCommand(LOGIC_COMMANDS_LITERAL.OR, expressions, this.fieldName);
    }
}
export function isLogicCommand(object) {
    return object && (object instanceof LogicCommand) && (object._internalType === SYMBOL_LOGIC_COMMAND);
}
export function isKnownLogicCommand(object) {
    return isLogicCommand && (object.operator.toUpperCase() in LOGIC_COMMANDS_LITERAL);
}
export default LogicCommand;
