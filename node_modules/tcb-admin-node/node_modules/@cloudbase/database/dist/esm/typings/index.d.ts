export declare type DataType = 'init' | 'update' | 'add' | 'remove' | 'replace' | 'limit';
export declare type QueueType = 'init' | 'enqueue' | 'dequeue' | 'update';
export interface IDatabaseServiceContext extends IServiceContext {
    appConfig: IAppConfig;
    ws?: any;
}
export interface IAppConfig {
    docSizeLimit: number;
    realtimePingInterval: number;
    realtimePongWaitTimeout: number;
    request: any;
}
export interface IWatchOptions {
    onChange: (snapshot: ISnapshot) => void;
    onError: (error: any) => void;
}
export interface ISnapshot {
    id: number;
    docChanges: ISingleDBEvent[];
    docs: Record<string, any>;
    type?: SnapshotType;
}
export interface ISingleDBEvent {
    id: number;
    dataType: DataType;
    queueType: QueueType;
    docId: string;
    doc: Record<string, any>;
    updatedFields?: any;
    removedFields?: any;
}
export declare type SnapshotType = 'init';
export interface DBRealtimeListener {
    close: () => void;
}
export interface IRealtimeListenerConstructorOptions extends IWatchOptions {
}
export interface IServiceContext {
    env?: string;
}
