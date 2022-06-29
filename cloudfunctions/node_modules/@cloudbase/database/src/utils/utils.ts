import { QueryOption, UpdateOption } from '../query'
import { EJSON } from 'bson'
import { isObject } from './type'

export const sleep = (ms: number = 0) => new Promise(r => setTimeout(r, ms))

const counters: Record<string, number> = {}

export const autoCount = (domain: string = 'any'): number => {
  if (!counters[domain]) {
    counters[domain] = 0
  }
  return counters[domain]++
}

export const getReqOpts = (apiOptions: QueryOption | UpdateOption): any => {
  // 影响底层request的暂时只有timeout
  if (apiOptions.timeout !== undefined) {
    return {
      timeout: apiOptions.timeout
    }
  }

  return {}
}

// 递归过滤对象中的undefiend字段
export const filterUndefined = o => {
  // 如果不是对象类型，直接返回
  if (!isObject(o)) {
    return o
  }

  for (let key in o) {
    if (o[key] === undefined) {
      delete o[key]
    } else if (isObject(o[key])) {
      o[key] = filterUndefined(o[key])
    }
  }

  return o
}

export const stringifyByEJSON = params => {
  // params中删除undefined的key
  params = filterUndefined(params)

  return EJSON.stringify(params, { relaxed: false })
}

export const parseByEJSON = params => {
  return EJSON.parse(params)
}

export class TcbError extends Error {
  readonly code: string
  readonly message: string
  constructor(error: IErrorInfo) {
    super(error.message)
    this.code = error.code
    this.message = error.message
  }
}

export const E = (errObj: IErrorInfo) => {
  return new TcbError(errObj)
}

export function processReturn(throwOnCode: boolean, res: any) {
  if (throwOnCode === false) {
    // 不抛报错，正常return，兼容旧逻辑
    return res
  }

  throw E({ ...res })
}

interface IErrorInfo {
  code?: string
  message?: string
}
