import httpRequest from '../utils/httpRequest'
import { ICustomReqOpts, ICallWxOpenApiOptions } from '../type'
import { E } from '../utils/utils'
import { ERROR } from '../const/code'
import { CloudBase } from '../cloudbase'

function validateCrossAccount(config, opts = {}) {
    let getCrossAccountInfo = (opts as any).getCrossAccountInfo || config.getCrossAccountInfo
    if (getCrossAccountInfo) {
        throw E({
            ...ERROR.INVALID_PARAM,
            message: 'invalid config: getCrossAccountInfo'
        })
    }
}

export async function callWxOpenApi(
    cloudbase: CloudBase,
    { apiName, apiOptions, cgiName, requestData }: ICallWxOpenApiOptions,
    opts?: ICustomReqOpts
) {
    let transformRequestData
    try {
        transformRequestData = requestData ? JSON.stringify(requestData) : ''
    } catch (e) {
        throw E({ ...e, code: ERROR.INVALID_PARAM.code, message: '对象出现了循环引用' })
    }

    validateCrossAccount(cloudbase.config, opts)

    const params: any = {
        action: 'wx.api',
        apiName,
        apiOptions,
        cgiName,
        requestData: transformRequestData
    }

    return httpRequest({
        config: cloudbase.config,
        params,
        method: 'post',
        opts,
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => {
        if (res.code) {
            return res
        }
        let result
        try {
            result = JSON.parse(res.data.responseData)
        } catch (e) {
            result = res.data.responseData
        }
        return {
            result,
            requestId: res.requestId
        }
        // }
    })
}

/**
 * 调用wxopenAPi
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
export async function callCompatibleWxOpenApi(
    cloudbase: CloudBase,
    { apiName, apiOptions, cgiName, requestData }: ICallWxOpenApiOptions,
    opts?: ICustomReqOpts
) {
    validateCrossAccount(cloudbase.config, opts)

    const params: any = {
        action: 'wx.openApi',
        apiName,
        apiOptions,
        cgiName,
        requestData
    }

    return httpRequest({
        config: cloudbase.config,
        method: 'post',
        headers: { 'content-type': 'multipart/form-data' },
        params,
        isFormData: true,
        opts
    }).then(res => res)
}

/**
 * wx.wxPayApi 微信支付用
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
export async function callWxPayApi(
    cloudbase: CloudBase,
    { apiName, apiOptions, cgiName, requestData }: ICallWxOpenApiOptions,
    opts?: ICustomReqOpts
) {
    validateCrossAccount(cloudbase.config, opts)

    const params: any = {
        action: 'wx.wxPayApi',
        apiName,
        apiOptions,
        cgiName,
        requestData
    }

    return httpRequest({
        config: cloudbase.config,
        method: 'post',
        headers: { 'content-type': 'multipart/form-data' },
        params,
        isFormData: true,
        opts
    })
}

/**
 * wx.wxCallContainerApi
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
 export async function wxCallContainerApi(
    cloudbase: CloudBase,
    { apiName, apiOptions, cgiName, requestData }: ICallWxOpenApiOptions,
    opts?: ICustomReqOpts
) {
    validateCrossAccount(cloudbase.config, opts)

    const params: any = {
        action: 'wx.wxCallContainerApi',
        apiName,
        apiOptions,
        cgiName,
        requestData
    }

    return httpRequest({
        config: cloudbase.config,
        method: 'post',
        headers: { 'content-type': 'multipart/form-data' },
        params,
        isFormData: true,
        opts
    })
}
