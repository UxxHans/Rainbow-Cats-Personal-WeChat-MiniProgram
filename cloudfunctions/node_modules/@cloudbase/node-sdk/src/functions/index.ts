import httpRequest from '../utils/httpRequest'
import { E } from '../utils/utils'
import { ERROR } from '../const/code'
import { ICustomReqOpts, ICallFunctionOptions } from '../type'
import { CloudBase } from '../cloudbase'

/**
 * 调用云函数
 * @param {String} name  函数名
 * @param {Object} functionParam 函数参数
 * @return {Promise}
 */
export async function callFunction(cloudbase: CloudBase, { name, qualifier, data }: ICallFunctionOptions, opts?: ICustomReqOpts) {
    const { TCB_ROUTE_KEY } = CloudBase.getCloudbaseContext()
    let transformData
    try {
        transformData = data ? JSON.stringify(data) : ''
    } catch (e) {
        throw E({ ...e, code: ERROR.INVALID_PARAM.code, message: '对象出现了循环引用' })
    }
    if (!name) {
        throw E({
            ...ERROR.INVALID_PARAM,
            message: '函数名不能为空'
        })
    }

    const params = {
        action: 'functions.invokeFunction',
        function_name: name,
        qualifier: qualifier,
        // async: async,
        request_data: transformData
    }

    return httpRequest({
        config: cloudbase.config,
        params,
        method: 'post',
        opts,
        headers: {
            'content-type': 'application/json',
            ...(TCB_ROUTE_KEY ? { 'X-Tcb-Route-Key': TCB_ROUTE_KEY } : {})
        }
    }).then(res => {
        if (res.code) {
            return res
        }

        let result
        try {
            result = JSON.parse(res.data.response_data)
        } catch (e) {
            result = res.data.response_data
        }
        return {
            result,
            requestId: res.requestId
        }
    })
}
