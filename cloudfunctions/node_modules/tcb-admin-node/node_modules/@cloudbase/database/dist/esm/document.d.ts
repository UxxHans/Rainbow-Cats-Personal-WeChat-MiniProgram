import { IWatchOptions, DBRealtimeListener } from './typings/index';
export declare class DocumentReference {
    readonly id: string | number;
    readonly projection: Object;
    set(data: Object, callback?: any): Promise<any>;
    update(data: Object, callback?: any): any;
    remove(callback?: any): Promise<any>;
    get(callback?: any): Promise<any>;
    field(projection: Object): DocumentReference;
    watch: (options: IWatchOptions) => DBRealtimeListener;
}
