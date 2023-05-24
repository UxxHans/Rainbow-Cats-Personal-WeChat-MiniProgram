import { ReadStream } from "fs"

export interface IAPIError {
  errMsg: string
}

export interface IAPISuccessParam {
  errMsg: string
}

export type IAPICompleteParam = IAPISuccessParam | IAPIError

export type IAPIFunction<T, P> = (param: P) => Promise<T> | any

export interface ICloudConfig {
  env?: string | {
    database?: string
    functions?: string
    storage?: string
  }
  traceUser?: boolean
  database: {
    realtime: {
      // max reconnect retries
      maxReconnect: number
      // interval between reconnection attempt, does not apply to the case of network offline, unit: ms
      reconnectInterval: number
      // maximum tolerance on the duration of websocket connection lost, unit: s
      totalConnectionTimeout: number
    }
  }
}

export type ICloudInitOptions = Partial<ICloudConfig>

export interface ICommonAPIConfig {
  env?: string
}

export interface IICloudAPI {
  init: (config?: ICloudConfig) => void
  [api: string]: AnyFunction | IAPIFunction<any, any>
}

export interface ICloudService {
  name: string
  context: IServiceContext
  getAPIs: () => { [name: string]: IAPIFunction<any, any> }
}

export interface IServiceContext {
  name: string
  identifiers: IRuntimeIdentifiers
  request: any
  debug: boolean
  env?: string
}

export interface ICloudServices {
  [serviceName: string]: ICloudService
}

export interface ICloudMetaData {
  session_id: string
  sdk_version?: string
}

export interface ICloudClass {
  apiPermissions: object
  config: ICloudConfig
  registerService(service: ICloudService): void
}

export interface IRuntimeIdentifiers {
  pluginId?: string
  [key: string]: any
}

export type AnyObject = {
  [x: string]: any
}

export type AnyArray = any[]

export type AnyFunction = (...args: any[]) => any

/**
 * cloud
 */

// init
export function init(config?: ICloudInitOptions): void
// functions
export function callFunction(param: ICloud.CallFunctionParam): Promise<ICloud.CallFunctionResult> | void
// storage
export function uploadFile(param: ICloud.UploadFileParam): Promise<ICloud.UploadFileResult>
export function downloadFile(param: ICloud.DownloadFileParam): Promise<ICloud.DownloadFileResult>
export function getTempFileURL(param: ICloud.GetTempFileURLParam): Promise<ICloud.GetTempFileURLResult> | void
export function deleteFile(param: ICloud.DeleteFileParam): Promise<ICloud.DeleteFileResult> | void
// database
export function database(config?: DB.IDatabaseConfig): DB.Database
// open
export const openapi: Record<string, any>
export function getOpenData(param: ICloud.GetOpenDataParam): ICloud.GetOpenDataResult
export function getOpenData(param: ICloud.GetOpenDataParam): ICloud.GetOpenDataResult
// utils
export function getWXContext(): ICloud.WXContext
export function logger(): ICloud.Logger
// constants
export const DYNAMIC_CURRENT_ENV: symbol

declare namespace ICloud {

  // === API: getWXContext ===
  export interface BaseWXContext {
    OPENID?: string
    APPID?: string
    UNIONID?: string
    ENV?: string
    SOURCE?: string
    CLIENTIP?: string
    CLIENTIPV6?: string
  }

  // === API: logger ===
  export class Logger {
    log(object: Record<string, any>): void
    info(object: Record<string, any>): void
    warn(object: Record<string, any>): void
    error(object: Record<string, any>): void
  }

  export type WXContext = BaseWXContext & Record<string, any>

  // === API: getOpenData ===
  export interface GetOpenDataParam {
    list: string[]
  }

  export interface GetOpenDataResult extends IAPISuccessParam {
    list: Record<string, any>[]
  }

  // === API: getVoIPSign ===
  export interface GetVoIPSignParam {
    groupId: string
    nonce: string
    timestamp: number
  }

  export interface GetVoIPSignResult extends IAPISuccessParam {
    signature: string
  }

  // === API: callFunction ===
  export type CallFunctionData = AnyObject

  export interface CallFunctionResult extends IAPISuccessParam {
    result: AnyObject | string | undefined
    requestID?: string
  }

  export interface CallFunctionParam {
    name: string
    data?: CallFunctionData
    slow?: boolean
    version?: number
    config?: {
      env?: string
    }
  }
  // === end ===

  // === API: uploadFile ===
  export interface UploadFileResult extends IAPISuccessParam {
    fileID: string
    statusCode: number
  }

  export interface UploadFileParam {
    cloudPath: string
    fileContent: Buffer | ReadStream
  }
  // === end ===

  // === API: downloadFile ===
  export interface DownloadFileResult extends IAPISuccessParam {
    fileContent: Buffer
    statusCode: number
  }

  export interface DownloadFileParam {
    fileID: string
  }
  // === end ===

  // === API: getTempFileURL ===
  export interface GetTempFileURLResult extends IAPISuccessParam {
    fileList: GetTempFileURLResultItem[]
  }

  export interface GetTempFileURLResultItem {
    fileID: string
    tempFileURL: string
    maxAge: number
    status: number
    errMsg: string
  }

  export interface GetTempFileURLParam {
    fileList: (string | {
      fileID: string
      maxAge?: number
    })[]
  }
  // === end ===

  // === API: deleteFile ===
  interface DeleteFileResult extends IAPISuccessParam {
    fileList: DeleteFileResultItem[]
  }

  interface DeleteFileResultItem {
    fileID: string
    status: number
    errMsg: string
  }

  interface DeleteFileParam {
    fileList: string[]
  }
  // === end ===

  // === API: CloudID ===
  abstract class CloudID {
    constructor(cloudID: string)
  }
  // === end ===

}

// === Functions ===
declare namespace Functions {
  export interface IFunctionsServiceContext extends IServiceContext {
    appConfig: {
      maxReqDataSize: number
      maxPollRetry: number
      maxStartRetryGap: number
      clientPollTimeout: number
    }
  }
}

// === Storage ===
declare namespace Storage {
  export interface IStorageServiceContext extends IServiceContext {
    appConfig: {
      uploadMaxFileSize: number
      getTempFileURLMaxReq: number
    }
  }
}

// === Utils ===
declare namespace Utils {
  export interface IUtilsServiceContext extends IServiceContext {
  }
}

// === Database ===
declare namespace DB {

  /**
   * The class of all exposed cloud database instances
   */
  export class Database {

    public readonly identifiers: IRuntimeIdentifiers
    public config: IDatabaseConfig
    public readonly command: DatabaseCommand
    public readonly Geo: IGeo
    public readonly serverDate: () => ServerDate
    public readonly RegExp: IRegExpConstructor
    public readonly debug?: boolean

    private constructor(options: IDatabaseConstructorOptions)

    collection(collectionName: string): CollectionReference
  }

  export interface IDatabaseInstanceContext {
    database: Database
    serviceContext: IDatabaseServiceContext
  }

  export class CollectionReference extends Query {

    public readonly collectionName: string

    constructor(name: string)

    doc(docId: string | number): DocumentReference

    add(options: IAddDocumentOptions): Promise<IAddResult> | void | string

    aggregate(): Aggregate

  }

  export class DocumentReference {

    constructor(collection: CollectionReference, docId: string | number)

    _id: string | number
    collection: CollectionReference

    field(object: object): this

    get(options?: IGetDocumentOptions): Promise<IQuerySingleResult> | void | string

    set(options?: ISetSingleDocumentOptions): Promise<ISetResult> | void | string

    update(options?: IUpdateSingleDocumentOptions): Promise<IUpdateResult> | void | string

    remove(options?: IRemoveSingleDocumentOptions): Promise<IRemoveResult> | void | string

  }

  export class Query {

    constructor(name: string)

    public readonly collectionName: string

    where(condition: IQueryCondition): Query

    orderBy(fieldPath: string, order: string): Query

    limit(max: number): Query

    skip(offset: number): Query

    field(object: object): Query

    get(options?: IGetDocumentOptions): Promise<IQueryResult> | void | string

    update(options?: IUpdateDocumentOptions): Promise<IUpdateResult> | void

    remove(options?: IRemoveDocumentOptions): Promise<IRemoveResult> | void

    count(options?: ICountDocumentOptions): Promise<ICountResult> | void | string

  }

  export class PipelineBase<T> {
    addFields(val: any): T
    bucket(val: any): T
    bucketAuto(val: any): T
    collStats(val: any): T
    count(val: any): T
    facet(val: any): T
    geoNear(val: any): T
    graphLookup(val: any): T
    group(val: any): T
    indexStats(val: any): T
    limit(val: any): T
    lookup(val: any): T
    match(val: any): T
    out(val: any): T
    project(val: any): T
    redact(val: any): T
    replaceRoot(val: any): T
    sample(val: any): T
    skip(val: any): T
    sort(val: any): T
    sortByCount(val: any): T
    unwind(val: any): T

    end(): void
  }

  export class Pipeline extends PipelineBase<Pipeline> {
    
  }

  export class PipelineStage {
    stage: string
    val: any
  }

  export class Aggregate extends PipelineBase<Aggregate> {
    constructor(collection: CollectionReference, stages: PipelineStage[])
    collection: CollectionReference
    end(): Promise<IAggregateResult> | void
  }

  export interface DatabaseCommand {

    eq(val: any): DatabaseQueryCommand
    neq(val: any): DatabaseQueryCommand
    gt(val: any): DatabaseQueryCommand
    gte(val: any): DatabaseQueryCommand
    lt(val: any): DatabaseQueryCommand
    lte(val: any): DatabaseQueryCommand
    in(val: any[]): DatabaseQueryCommand
    nin(val: any[]): DatabaseQueryCommand

    geoNear(options: IGeoNearCommandOptions): DatabaseQueryCommand
    geoWithin(options: IGeoWithinCommandOptions): DatabaseQueryCommand
    geoIntersects(options: IGeoIntersectsCommandOptions): DatabaseQueryCommand

    and(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand
    or(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand
    nor(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand
    not(expression: DatabaseLogicCommand): DatabaseLogicCommand

    exists(val: boolean): DatabaseQueryCommand

    mod(divisor: number, remainder: number): DatabaseQueryCommand

    all(val: any[]): DatabaseQueryCommand
    elemMatch(val: any): DatabaseQueryCommand
    size(val: number): DatabaseQueryCommand

    set(val: any): DatabaseUpdateCommand
    remove(): DatabaseUpdateCommand
    inc(val: number): DatabaseUpdateCommand
    mul(val: number): DatabaseUpdateCommand
    min(val: number): DatabaseUpdateCommand
    max(val: number): DatabaseUpdateCommand
    rename(val: string): DatabaseUpdateCommand
    bit(val: number): DatabaseUpdateCommand

    push(...values: any[]): DatabaseUpdateCommand
    pop(): DatabaseUpdateCommand
    shift(): DatabaseUpdateCommand
    unshift(...values: any[]): DatabaseUpdateCommand
    addToSet(val: any): DatabaseUpdateCommand
    pull(val: any): DatabaseUpdateCommand
    pullAll(val: any): DatabaseUpdateCommand

    project: {
      slice(val: number | [number, number]): DatabaseProjectionCommand
    }

    aggregate: {

      abs(val: any): DatabaseAggregateCommand
      add(val: any): DatabaseAggregateCommand
      addToSet(val: any): DatabaseAggregateCommand
      allElementsTrue(val: any): DatabaseAggregateCommand
      and(val: any): DatabaseAggregateCommand
      anyElementTrue(val: any): DatabaseAggregateCommand
      arrayElemAt(val: any): DatabaseAggregateCommand
      arrayToObject(val: any): DatabaseAggregateCommand
      avg(val: any): DatabaseAggregateCommand
      ceil(val: any): DatabaseAggregateCommand
      cmp(val: any): DatabaseAggregateCommand
      concat(val: any): DatabaseAggregateCommand
      concatArrays(val: any): DatabaseAggregateCommand
      cond(val: any): DatabaseAggregateCommand
      convert(val: any): DatabaseAggregateCommand
      dateFromParts(val: any): DatabaseAggregateCommand
      dateToParts(val: any): DatabaseAggregateCommand
      dateFromString(val: any): DatabaseAggregateCommand
      dateToString(val: any): DatabaseAggregateCommand
      dayOfMonth(val: any): DatabaseAggregateCommand
      dayOfWeek(val: any): DatabaseAggregateCommand
      dayOfYear(val: any): DatabaseAggregateCommand
      divide(val: any): DatabaseAggregateCommand
      eq(val: any): DatabaseAggregateCommand
      exp(val: any): DatabaseAggregateCommand
      filter(val: any): DatabaseAggregateCommand
      first(val: any): DatabaseAggregateCommand
      floor(val: any): DatabaseAggregateCommand
      gt(val: any): DatabaseAggregateCommand
      gte(val: any): DatabaseAggregateCommand
      hour(val: any): DatabaseAggregateCommand
      ifNull(val: any): DatabaseAggregateCommand
      in(val: any): DatabaseAggregateCommand
      indexOfArray(val: any): DatabaseAggregateCommand
      indexOfBytes(val: any): DatabaseAggregateCommand
      indexOfCP(val: any): DatabaseAggregateCommand
      isArray(val: any): DatabaseAggregateCommand
      isoDayOfWeek(val: any): DatabaseAggregateCommand
      isoWeek(val: any): DatabaseAggregateCommand
      isoWeekYear(val: any): DatabaseAggregateCommand
      last(val: any): DatabaseAggregateCommand
      let(val: any): DatabaseAggregateCommand
      literal(val: any): DatabaseAggregateCommand
      ln(val: any): DatabaseAggregateCommand
      log(val: any): DatabaseAggregateCommand
      log10(val: any): DatabaseAggregateCommand
      lt(val: any): DatabaseAggregateCommand
      lte(val: any): DatabaseAggregateCommand
      ltrim(val: any): DatabaseAggregateCommand
      map(val: any): DatabaseAggregateCommand
      max(val: any): DatabaseAggregateCommand
      mergeObjects(val: any): DatabaseAggregateCommand
      meta(val: any): DatabaseAggregateCommand
      min(val: any): DatabaseAggregateCommand
      millisecond(val: any): DatabaseAggregateCommand
      minute(val: any): DatabaseAggregateCommand
      mod(val: any): DatabaseAggregateCommand
      month(val: any): DatabaseAggregateCommand
      multiply(val: any): DatabaseAggregateCommand
      neq(val: any): DatabaseAggregateCommand
      not(val: any): DatabaseAggregateCommand
      objectToArray(val: any): DatabaseAggregateCommand
      or(val: any): DatabaseAggregateCommand
      pow(val: any): DatabaseAggregateCommand
      push(val: any): DatabaseAggregateCommand
      range(val: any): DatabaseAggregateCommand
      reduce(val: any): DatabaseAggregateCommand
      reverseArray(val: any): DatabaseAggregateCommand
      rtrim(val: any): DatabaseAggregateCommand
      second(val: any): DatabaseAggregateCommand
      setDifference(val: any): DatabaseAggregateCommand
      setEquals(val: any): DatabaseAggregateCommand
      setIntersection(val: any): DatabaseAggregateCommand
      setIsSubset(val: any): DatabaseAggregateCommand
      setUnion(val: any): DatabaseAggregateCommand
      size(val: any): DatabaseAggregateCommand
      slice(val: any): DatabaseAggregateCommand
      split(val: any): DatabaseAggregateCommand
      sqrt(val: any): DatabaseAggregateCommand
      stdDevPop(val: any): DatabaseAggregateCommand
      stdDevSamp(val: any): DatabaseAggregateCommand
      strcasecmp(val: any): DatabaseAggregateCommand
      strLenBytes(val: any): DatabaseAggregateCommand
      strLenCP(val: any): DatabaseAggregateCommand
      substr(val: any): DatabaseAggregateCommand
      substrBytes(val: any): DatabaseAggregateCommand
      substrCP(val: any): DatabaseAggregateCommand
      subtract(val: any): DatabaseAggregateCommand
      sum(val: any): DatabaseAggregateCommand
      switch(val: any): DatabaseAggregateCommand
      toBool(val: any): DatabaseAggregateCommand
      toDate(val: any): DatabaseAggregateCommand
      toDecimal(val: any): DatabaseAggregateCommand
      toDouble(val: any): DatabaseAggregateCommand
      toInt(val: any): DatabaseAggregateCommand
      toLong(val: any): DatabaseAggregateCommand
      toObjectId(val: any): DatabaseAggregateCommand
      toString(val: any): DatabaseAggregateCommand
      toLower(val: any): DatabaseAggregateCommand
      toUpper(val: any): DatabaseAggregateCommand
      trim(val: any): DatabaseAggregateCommand
      trunc(val: any): DatabaseAggregateCommand
      type(val: any): DatabaseAggregateCommand
      week(val: any): DatabaseAggregateCommand
      year(val: any): DatabaseAggregateCommand
      zip(val: any): DatabaseAggregateCommand
    }
  }

  export enum AGGREGATE_COMMANDS_LITERAL {
    AVG = 'avg',
    MULTIPLY = 'multiply',
    SUM = 'sum',
  }

  export class DatabaseAggregateCommand {
  }

  export enum LOGIC_COMMANDS_LITERAL {
    AND = 'and',
    OR = 'or',
    NOT = 'not',
    NOR = 'nor',
  }

  export class DatabaseLogicCommand {
    and(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand
    or(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand
    nor(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand
    not(expression: DatabaseLogicCommand): DatabaseLogicCommand
  }

  export enum QUERY_COMMANDS_LITERAL {
    // comparison
    EQ = 'eq',
    NEQ = 'neq',
    GT = 'gt',
    GTE = 'gte',
    LT = 'lt',
    LTE = 'lte',
    IN = 'in',
    NIN = 'nin',
    // geo
    GEO_NEAR = 'geoNear',
    GEO_WITHIN = 'geoWithin',
    GEO_INTERSECTS = 'geoIntersects',
    // element
    EXISTS = 'exists',
    // evaluation
    MOD = 'mod',
    // array
    ALL = 'all',
    ELEM_MATCH = 'elemMatch',
    SIZE = 'size',
  }

  export class DatabaseQueryCommand extends DatabaseLogicCommand {
    eq(val: any): DatabaseLogicCommand
    neq(val: any): DatabaseLogicCommand
    gt(val: any): DatabaseLogicCommand
    gte(val: any): DatabaseLogicCommand
    lt(val: any): DatabaseLogicCommand
    lte(val: any): DatabaseLogicCommand
    in(val: any[]): DatabaseLogicCommand
    nin(val: any[]): DatabaseLogicCommand

    exists(val: boolean): DatabaseLogicCommand

    mod(divisor: number, remainder: number): DatabaseLogicCommand

    all(val: any[]): DatabaseLogicCommand
    elemMatch(val: any): DatabaseLogicCommand
    size(val: number): DatabaseLogicCommand

    geoNear(options: IGeoNearCommandOptions): DatabaseLogicCommand
    geoWithin(options: IGeoWithinCommandOptions): DatabaseLogicCommand
    geoIntersects(options: IGeoIntersectsCommandOptions): DatabaseLogicCommand
  }

  export enum PROJECTION_COMMANDS_LITERAL {
    SLICE = 'slice',
  }

  export class DatabaseProjectionCommand {
  }

  export enum UPDATE_COMMANDS_LITERAL {
    // field
    SET = 'set',
    REMOVE = 'remove',
    INC = 'inc',
    MUL = 'mul',
    MIN = 'min',
    MAX = 'max',
    RENAME = 'rename',
    // bitwise
    BIT = 'bit',
    // array
    PUSH = 'push',
    POP = 'pop',
    SHIFT = 'shift',
    UNSHIFT = 'unshift',
    ADD_TO_SET = 'addToSet',
    PULL = 'pull',
    PULL_ALL = 'pullAll',
  }

  export class DatabaseUpdateCommand {
  }

  export enum UPDATE_COMMAND_MODIFIERS_LITERAL {
    EACH = 'each',
    POSITION = 'position',
    SLICE = 'slice',
    SORT = 'sort',
  }

  export class DatabaseUpdateCommandModifier {
  }

  export class Batch {

  }

  export interface IDatabaseConfig {
    env?: string
  }

  export interface IDatabaseConstructorOptions {
    config?: IDatabaseConfig
    context: IDatabaseServiceContext
  }

  export interface IAppConfig {
    docSizeLimit: number
    realtimePingInterval: number
    realtimePongWaitTimeout: number
    realtimeMaxReconnect: number
    realtimeReconnectInterval: number
    realtimeTotalConnectionTimeout: number
    realtimeQueryEventCacheTimeout: number
  }

  export interface IDatabaseServiceContext extends IServiceContext {
    appConfig: IAppConfig
    ws?: any
  }

  export interface IGeoPointConstructor {
    new (longitude: number, latitide: number): GeoPoint
    new (geojson: IGeoJSONPoint): GeoPoint
    (longitude: number, latitide: number): GeoPoint
    (geojson: IGeoJSONPoint): GeoPoint
  }

  export interface IGeoMultiPointConstructor {
    new (points: GeoPoint[] | IGeoJSONMultiPoint): GeoMultiPoint
    (points: GeoPoint[] | IGeoJSONMultiPoint): GeoMultiPoint
  }

  export interface IGeoLineStringConstructor {
    new (points: GeoPoint[] | IGeoJSONLineString): GeoLineString
    (points: GeoPoint[] | IGeoJSONLineString): GeoLineString
  }

  export interface IGeoMultiLineStringConstructor {
    new (lineStrings: GeoLineString[] | IGeoJSONMultiLineString): GeoMultiLineString
    (lineStrings: GeoLineString[] | IGeoJSONMultiLineString): GeoMultiLineString
  }

  export interface IGeoPolygonConstructor {
    new (lineStrings: GeoLineString[] | IGeoJSONPolygon): GeoPolygon
    (lineStrings: GeoLineString[] | IGeoJSONPolygon): GeoPolygon
  }

  export interface IGeoMultiPolygonConstructor {
    new (polygons: GeoPolygon[] | IGeoJSONMultiPolygon): GeoMultiPolygon
    (polygons: GeoPolygon[] | IGeoJSONMultiPolygon): GeoMultiPolygon
  }

  export interface IGeo {
    Point: IGeoPointConstructor
    MultiPoint: IGeoMultiPointConstructor
    LineString: IGeoLineStringConstructor
    MultiLineString: IGeoMultiLineStringConstructor
    Polygon: IGeoPolygonConstructor
    MultiPolygon: IGeoMultiPolygonConstructor
  }

  export interface IGeoJSONPoint {
    type: 'Point'
    coordinates: [number, number]
  }

  export interface IGeoJSONMultiPoint {
    type: 'MultiPoint'
    coordinates: [number, number][]
  }

  export interface IGeoJSONLineString {
    type: 'LineString'
    coordinates: [number, number][]
  }

  export interface IGeoJSONMultiLineString {
    type: 'MultiLineString'
    coordinates: [number, number][][]
  }

  export interface IGeoJSONPolygon {
    type: 'Polygon'
    coordinates: [number, number][][]
  }

  export interface IGeoJSONMultiPolygon {
    type: 'MultiPolygon'
    coordinates: [number, number][][][]
  }

  export type IGeoJSONObject = IGeoJSONPoint | IGeoJSONMultiPoint | IGeoJSONLineString | IGeoJSONMultiLineString | IGeoJSONPolygon | IGeoJSONMultiPolygon

  export abstract class GeoPoint {
    public longitude: number
    public latitude: number

    constructor(longitude: number, latitude: number)

    toJSON(): IGeoJSONPoint
    toString(): string
  }

  export abstract class GeoMultiPoint {
    public points: GeoPoint[]

    constructor(points: GeoPoint[])

    toJSON(): IGeoJSONMultiPoint
    toString(): string
  }

  export abstract class GeoLineString {
    public points: GeoPoint[]

    constructor(points: GeoPoint[])

    toJSON(): IGeoJSONLineString
    toString(): string
  }

  export abstract class GeoMultiLineString {
    public lines: GeoLineString[]

    constructor(lines: GeoLineString[])

    toJSON(): IGeoJSONMultiLineString
    toString(): string
  }

  export abstract class GeoPolygon {
    public lines: GeoLineString[]

    constructor(lines: GeoLineString[])

    toJSON(): IGeoJSONPolygon
    toString(): string
  }

  export abstract class GeoMultiPolygon {
    public polygons: GeoPolygon[]

    constructor(polygons: GeoPolygon[])

    toJSON(): IGeoJSONMultiPolygon
    toString(): string
  }

  export type GeoInstance = GeoPoint | GeoMultiPoint | GeoLineString | GeoMultiLineString | GeoPolygon | GeoMultiPolygon

  export interface IGeoNearCommandOptions {
    geometry: GeoPoint
    maxDistance?: number
    minDistance?: number
  }

  export interface IGeoWithinCommandOptions {
    geometry: GeoPolygon | GeoMultiPolygon
  }

  export interface IGeoIntersectsCommandOptions {
    geometry: GeoPoint | GeoMultiPoint | GeoLineString | GeoMultiLineString | GeoPolygon | GeoMultiPolygon
  }

  export interface IServerDateOptions {
    offset: number
  }

  export abstract class ServerDate {
    public readonly options: IServerDateOptions
    constructor(options?: IServerDateOptions)
  }

  export interface IRegExpOptions {
    regexp: string
    options?: string
  }

  export interface IRegExpConstructor {
    new (options: IRegExpOptions): RegExp
    (options: IRegExpOptions): RegExp
  }

  export abstract class RegExp {
    public readonly regexp: string
    public readonly options: string
    constructor(options: IRegExpOptions)
  }

  export type DocumentId = string | number

  export interface IDocumentData {
    _id?: DocumentId
    [key: string]: any
  }

  export interface IDBAPIParam {

  }

  export interface IAddDocumentOptions extends IDBAPIParam {
    data: IDocumentData
  }

  export interface IGetDocumentOptions extends IDBAPIParam {
    stringifyTest?: boolean
  }

  export interface ICountDocumentOptions extends IDBAPIParam {
    stringifyTest?: boolean
  }

  export interface IUpdateDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition
    stringifyTest?: boolean
  }

  export interface IUpdateSingleDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition
    stringifyTest?: boolean
  }

  export interface ISetDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition
    stringifyTest?: boolean
  }

  export interface ISetSingleDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition
    stringifyTest?: boolean
  }

  export interface IRemoveDocumentOptions extends IDBAPIParam {
    query: IQueryCondition
    stringifyTest?: boolean
  }

  export interface IRemoveSingleDocumentOptions extends IDBAPIParam {
    stringifyTest?: boolean
  }

  export type IQueryCondition = Record<string, any> | DatabaseLogicCommand

  export interface ConditionRecord {
    [key: string]: IQueryCondition
  }

  // export interface IQueryCondition {
  //   [key: string]: any
  // }

  export type IStringQueryCondition = string

  export interface IQueryResult extends IAPISuccessParam {
    data: IDocumentData[]
  }

  export interface IQuerySingleResult extends IAPISuccessParam {
    data: IDocumentData
  }

  export interface IUpdateCondition {
    [key: string]: any
  }

  export type IStringUpdateCondition = string

  export interface ISetCondition {

  }

  export interface IAddResult extends IAPISuccessParam {
    _id: DocumentId
  }

  export interface IUpdateResult extends IAPISuccessParam {
    stats: {
      updated: number
      // created: number
    }
  }

  export interface ISetResult extends IAPISuccessParam {
    _id: DocumentId
    stats: {
      updated: number
      created: number
    }
  }

  export interface IRemoveResult extends IAPISuccessParam {
    stats: {
      removed: number
    }
  }

  export interface ICountResult extends IAPISuccessParam {
    total: number
  }

  export interface IAggregateResult extends IAPISuccessParam {
    list: any[]
  }
}

type Optional<T> = { [K in keyof T]+?: T[K] }

type OQ<
    T extends Optional<
        Record<'complete' | 'success' | 'fail', (...args: any[]) => any>
    >
> =
    | (RQ<T> & Required<Pick<T, 'success'>>)
    | (RQ<T> & Required<Pick<T, 'fail'>>)
    | (RQ<T> & Required<Pick<T, 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'success' | 'fail'>>)
    | (RQ<T> & Required<Pick<T, 'success' | 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'fail' | 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'fail' | 'complete' | 'success'>>)

type RQ<
    T extends Optional<
        Record<'complete' | 'success' | 'fail', (...args: any[]) => any>
    >
> = Pick<T, Exclude<keyof T, 'complete' | 'success' | 'fail'>>
