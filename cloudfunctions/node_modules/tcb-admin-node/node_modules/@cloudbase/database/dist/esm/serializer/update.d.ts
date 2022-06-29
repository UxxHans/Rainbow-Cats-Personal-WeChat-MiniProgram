import { UpdateCommand } from '../commands/update';
import { LogicCommand } from '../commands/logic';
export declare type IQueryCondition = Record<string, any> | LogicCommand;
export interface IUpdateCondition {
    [key: string]: any;
}
export declare class UpdateSerializer {
    private constructor();
    static encode(query: IQueryCondition | UpdateCommand): IUpdateCondition;
    encodeUpdate(query: IQueryCondition | UpdateCommand): IUpdateCondition;
    encodeUpdateCommand(query: UpdateCommand): IQueryCondition;
    encodeFieldUpdateCommand(query: UpdateCommand): IQueryCondition;
    encodeArrayUpdateCommand(query: UpdateCommand): IQueryCondition;
    encodeUpdateObject(query: Record<string, any>): IQueryCondition;
}
