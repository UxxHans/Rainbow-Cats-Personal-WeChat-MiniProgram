import { InternalSymbol } from '../helper/symbol';
export declare const SET = "set";
export declare const REMOVE = "remove";
export declare const INC = "inc";
export declare const MUL = "mul";
export declare const PUSH = "push";
export declare const POP = "pop";
export declare const SHIFT = "shift";
export declare const UNSHIFT = "unshift";
export declare enum UPDATE_COMMANDS_LITERAL {
    SET = "set",
    REMOVE = "remove",
    INC = "inc",
    MUL = "mul",
    PUSH = "push",
    POP = "pop",
    SHIFT = "shift",
    UNSHIFT = "unshift"
}
export declare class UpdateCommand {
    fieldName: string | InternalSymbol;
    operator: UPDATE_COMMANDS_LITERAL;
    operands: any[];
    _internalType: InternalSymbol;
    constructor(operator: UPDATE_COMMANDS_LITERAL, operands: any[], fieldName?: string | InternalSymbol);
    _setFieldName(fieldName: string): UpdateCommand;
}
export declare function isUpdateCommand(object: any): object is UpdateCommand;
export declare function isKnownUpdateCommand(object: any): object is UpdateCommand;
export default UpdateCommand;
