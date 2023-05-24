import { LogicCommand } from '../commands/logic';
export declare type IQueryCondition = Record<string, any> | LogicCommand;
export declare type AnyObject = {
    [x: string]: any;
};
export declare function serialize(val: any): IQueryCondition;
export declare function deserialize(object: AnyObject): any;
