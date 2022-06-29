import { InternalSymbol } from '../helper/symbol';
export declare const AND = "and";
export declare const OR = "or";
export declare const NOT = "not";
export declare const NOR = "nor";
export declare enum LOGIC_COMMANDS_LITERAL {
    AND = "and",
    OR = "or",
    NOT = "not",
    NOR = "nor"
}
export declare class LogicCommand {
    fieldName: string | InternalSymbol;
    operator: LOGIC_COMMANDS_LITERAL | string;
    operands: any[];
    _internalType: InternalSymbol;
    constructor(operator: LOGIC_COMMANDS_LITERAL | string, operands: any[], fieldName?: string | InternalSymbol);
    _setFieldName(fieldName: string): LogicCommand;
    and(...__expressions__: LogicCommand[]): LogicCommand;
    or(...__expressions__: LogicCommand[]): LogicCommand;
}
export declare function isLogicCommand(object: any): object is LogicCommand;
export declare function isKnownLogicCommand(object: any): object is LogicCommand;
export default LogicCommand;
