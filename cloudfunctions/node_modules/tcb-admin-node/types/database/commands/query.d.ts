import { LogicCommand } from './logic';
import { InternalSymbol } from '../helper/symbol';
import { Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon } from '../geo';
export declare const EQ = "eq";
export declare const NEQ = "neq";
export declare const GT = "gt";
export declare const GTE = "gte";
export declare const LT = "lt";
export declare const LTE = "lte";
export declare const IN = "in";
export declare const NIN = "nin";
export declare enum QUERY_COMMANDS_LITERAL {
    EQ = "eq",
    NEQ = "neq",
    GT = "gt",
    GTE = "gte",
    LT = "lt",
    LTE = "lte",
    IN = "in",
    NIN = "nin",
    GEO_NEAR = "geoNear",
    GEO_WITHIN = "geoWithin",
    GEO_INTERSECTS = "geoIntersects"
}
export declare class QueryCommand extends LogicCommand {
    operator: QUERY_COMMANDS_LITERAL;
    constructor(operator: QUERY_COMMANDS_LITERAL, operands: any[], fieldName?: string | InternalSymbol);
    _setFieldName(fieldName: string): QueryCommand;
    eq(val: any): LogicCommand;
    neq(val: any): LogicCommand;
    gt(val: any): LogicCommand;
    gte(val: any): LogicCommand;
    lt(val: any): LogicCommand;
    lte(val: any): LogicCommand;
    in(list: any[]): LogicCommand;
    nin(list: any[]): LogicCommand;
    geoNear(val: IGeoNearOptions): LogicCommand;
    geoWithin(val: IGeoWithinOptions): LogicCommand;
    geoIntersects(val: IGeoIntersectsOptions): LogicCommand;
}
export declare function isQueryCommand(object: any): object is QueryCommand;
export declare function isKnownQueryCommand(object: any): object is QueryCommand;
export declare function isComparisonCommand(object: any): object is QueryCommand;
export default QueryCommand;
export interface IGeoNearOptions {
    geometry: Point;
    maxDistance?: number;
    minDistance?: number;
}
export interface IGeoWithinOptions {
    geometry: Polygon | MultiPolygon;
}
export interface IGeoIntersectsOptions {
    geometry: Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon;
}
