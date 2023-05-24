import { InternalSymbol } from '../helper/symbol';
export declare enum UPDATE_COMMANDS_LITERAL {
    SET = "set",
    REMOVE = "remove",
    INC = "inc",
    MUL = "mul",
    PUSH = "push",
    PULL = "pull",
    PULL_ALL = "pullAll",
    POP = "pop",
    SHIFT = "shift",
    UNSHIFT = "unshift",
    ADD_TO_SET = "addToSet",
    BIT = "bit",
    RENAME = "rename",
    MAX = "max",
    MIN = "min"
}
export declare class UpdateCommand {
    fieldName: string | InternalSymbol;
    operator: UPDATE_COMMANDS_LITERAL;
    operands: any;
    _internalType: InternalSymbol;
    constructor(operator: UPDATE_COMMANDS_LITERAL, operands?: any, fieldName?: string | InternalSymbol);
    _setFieldName(fieldName: string): UpdateCommand;
}
export declare function isUpdateCommand(object: any): object is UpdateCommand;
export declare function isKnownUpdateCommand(object: any): object is UpdateCommand;
export default UpdateCommand;
