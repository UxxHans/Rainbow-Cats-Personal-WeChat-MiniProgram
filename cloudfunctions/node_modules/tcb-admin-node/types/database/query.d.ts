import { OrderByDirection } from "./constant";
interface getRes {
    data: any[];
    requestId: string;
    total: number;
    limit: number;
    offset: number;
}
export declare class Query {
    get(): Promise<getRes>;
    count(): Promise<any>;
    where(query: object): Query;
    orderBy(fieldPath: string, directionStr: OrderByDirection): Query;
    limit(limit: number): Query;
    skip(offset: number): Query;
    update(data: Object): Promise<any>;
    field(projection: Object): Query;
    remove(): Promise<any>;
}
export {};
