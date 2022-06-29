import { ISingleDBEvent, SnapshotType, ISnapshot } from '../typings/index';
interface ISnapshotConstructorOptions {
    id: number;
    docChanges: ISingleDBEvent[];
    docs: Record<string, any>[];
    type?: SnapshotType;
    msgType?: String;
}
export declare class Snapshot implements ISnapshot {
    id: number;
    docChanges: ISingleDBEvent[];
    docs: Record<string, any>[];
    type?: 'init';
    constructor(options: ISnapshotConstructorOptions);
}
export {};
