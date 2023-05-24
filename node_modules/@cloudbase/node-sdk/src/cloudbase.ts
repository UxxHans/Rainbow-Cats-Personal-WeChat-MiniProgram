import { Db } from '@cloudbase/database'
import { callFunction } from './functions'
import { auth } from './auth'
import { callWxOpenApi, callCompatibleWxOpenApi, callWxPayApi, wxCallContainerApi } from './wx'
import {
    uploadFile,
    deleteFile,
    getTempFileURL,
    downloadFile,
    getUploadMetadata,
    getFileAuthority
} from './storage'

import {
    analytics
} from './analytics'

import {
    ICloudBaseConfig,
    ICustomReqOpts,
    ICustomErrRes,
    IDeleteFileRes,
    IGetFileUrlRes,
    IDownloadFileRes,
    IUploadFileRes,
    ICallFunctionOptions,
    ICallWxOpenApiOptions,
    IContextParam,
    ICompleteCloudbaseContext,
    ISCFContext,
    IReportData,
} from './type'
import { DBRequest } from './utils/dbRequest'
import { Log, logger } from './log'
import { ERROR } from './const/code'
import { E } from './utils/utils'
import axios from 'axios'

export class CloudBase {
    public static scfContext: ISCFContext
    public static parseContext(context: IContextParam): ISCFContext {
        if (typeof context !== 'object') {
            throw E({ ...ERROR.INVALID_CONTEXT, message: 'context 必须为对象类型' })
        }
        let {
            memory_limit_in_mb,
            time_limit_in_ms,
            request_id,
            environ,
            function_version,
            namespace,
            function_name,
            environment
        } = context
        let parseResult: any = {}

        try {
            parseResult.memoryLimitInMb = memory_limit_in_mb
            parseResult.timeLimitIns = time_limit_in_ms
            parseResult.requestId = request_id
            parseResult.functionVersion = function_version
            parseResult.namespace = namespace
            parseResult.functionName = function_name

            // 存在environment 为新架构 上新字段 JSON序列化字符串
            if (environment) {
                parseResult.environment = JSON.parse(environment)
                return parseResult
            }

            // 不存在environment 则为老字段，老架构上存在bug，无法识别value含特殊字符(若允许特殊字符，影响解析，这里特殊处理)

            const parseEnviron = environ.split(';')
            let parseEnvironObj = {}
            for (let i in parseEnviron) {
                // value含分号影响切割，未找到= 均忽略
                if (parseEnviron[i].indexOf('=') >= 0) {
                    const equalIndex = parseEnviron[i].indexOf('=')
                    const key = parseEnviron[i].slice(0, equalIndex)
                    let value: any = parseEnviron[i].slice(equalIndex + 1)

                    // value 含, 为数组
                    if (value.indexOf(',') >= 0) {
                        value = value.split(',')
                    }
                    parseEnvironObj[key] = value
                }
            }

            parseResult.environ = parseEnvironObj
        } catch (err) {
            throw E({ ...ERROR.INVALID_CONTEXT })
        }

        CloudBase.scfContext = parseResult
        return parseResult
    }
    /**
     * 获取当前函数内的所有环境变量(作为获取变量的统一方法，取值来源process.env 和 context)
     */
    public static getCloudbaseContext(context?: IContextParam): ICompleteCloudbaseContext {
        // WX_CONTEXT_ENV  WX_APPID WX_OPENID WX_UNIONID WX_API_TOKEN
        // TCB_CONTEXT_ENV TCB_ENV TCB_SEQID TRIGGER_SRC LOGINTYPE QQ_OPENID QQ_APPID TCB_UUID TCB_ISANONYMOUS_USER TCB_SESSIONTOKEN TCB_CUSTOM_USER_ID TCB_SOURCE_IP TCB_SOURCE TCB_ROUTE_KEY TCB_HTTP_CONTEXT TCB_CONTEXT_CNFG

        // 解析process.env
        const {
            TENCENTCLOUD_RUNENV,
            SCF_NAMESPACE,
            TCB_CONTEXT_KEYS,
            TENCENTCLOUD_SECRETID,
            TENCENTCLOUD_SECRETKEY,
            TENCENTCLOUD_SESSIONTOKEN,
            TRIGGER_SRC,
            WX_CONTEXT_KEYS,
            WX_TRIGGER_API_TOKEN_V0,
            WX_CLIENTIP,
            WX_CLIENTIPV6,
            _SCF_TCB_LOG,
            TCB_CONTEXT_CNFG,
            LOGINTYPE
        } = process.env

        let contextEnv: any = {}
        if (context) {
            const { environment, environ } = CloudBase.parseContext(context)
            contextEnv = environment || environ || {}
        }

        // 从TCB_CONTEXT_KEYS 和 WX_CONTEXT_KEYS中解析环境变量 取值优先级为 context > process.env
        const tcb_context_keys = contextEnv.TCB_CONTEXT_KEYS || TCB_CONTEXT_KEYS
        const wx_context_keys = contextEnv.WX_CONTEXT_KEYS || WX_CONTEXT_KEYS

        let rawContext = {
            TENCENTCLOUD_RUNENV,
            SCF_NAMESPACE,
            TCB_CONTEXT_KEYS,
            TENCENTCLOUD_SECRETID,
            TENCENTCLOUD_SECRETKEY,
            TENCENTCLOUD_SESSIONTOKEN,
            TRIGGER_SRC,
            WX_TRIGGER_API_TOKEN_V0,
            WX_CLIENTIP,
            WX_CLIENTIPV6,
            WX_CONTEXT_KEYS,
            _SCF_TCB_LOG,
            TCB_CONTEXT_CNFG,
            LOGINTYPE
        }

        // 遍历keys
        if (tcb_context_keys) {
            try {
                const tcbKeysList = tcb_context_keys.split(',')
                for (let item of tcbKeysList) {
                    rawContext[item] = contextEnv[item] || process.env[item]
                }
            } catch (e) { }
        }

        if (wx_context_keys) {
            try {
                const wxKeysList = wx_context_keys.split(',')
                for (let item of wxKeysList) {
                    rawContext[item] = contextEnv[item] || process.env[item]
                }
            } catch (e) { }
        }

        rawContext = { ...rawContext, ...contextEnv }

        let finalContext: any = {}
        for (let key in rawContext) {
            if (rawContext[key] !== undefined) {
                finalContext[key] = rawContext[key]
            }
        }
        return finalContext
    }

    public config: ICloudBaseConfig

    private clsLogger: Log

    private extensionMap: any

    public constructor(config?: ICloudBaseConfig) {
        this.init(config)
    }

    public init(config: ICloudBaseConfig = {}): void {
        let {
            debug,
            secretId,
            secretKey,
            sessionToken,
            env,
            timeout,
            headers = {},
            throwOnCode,
            ...restConfig
        } = config

        if ((secretId && !secretKey) || (!secretId && secretKey)) {
            throw E({
                ...ERROR.INVALID_PARAM,
                message: 'secretId and secretKey must be a pair'
            })
        }

        const newConfig: ICloudBaseConfig = {
            ...restConfig,
            debug: !!debug,
            secretId: secretId,
            secretKey: secretKey,
            sessionToken: sessionToken,
            envName: env,
            headers: { ...headers },
            timeout: timeout || 15000,
            throwOnCode: throwOnCode !== undefined ? throwOnCode : true
        }

        this.config = newConfig
        this.extensionMap = {}
    }

    public registerExtension(ext: any) {
        this.extensionMap[ext.name] = ext
    }

    public async invokeExtension(name, opts) {
        const ext = this.extensionMap[name]
        if (!ext) {
            throw Error(`扩展${name} 必须先注册`)
        }

        console.log(opts)
        return ext.invoke(opts, this)
    }

    public database(dbConfig: any = {}): Db {
        Db.reqClass = DBRequest
        // 兼容方法预处理

        if (Object.prototype.toString.call(dbConfig).slice(8, -1) !== 'Object') {
            throw E({ ...ERROR.INVALID_PARAM, message: 'dbConfig must be an object' })
        }

        if (dbConfig && dbConfig.env) {
            // env变量名转换
            dbConfig.envName = dbConfig.env
            delete dbConfig.env
        }
        return new Db({
            ...this.config,
            ...dbConfig
        })
    }

    /**
     * 调用云函数
     *
     * @param param0
     * @param opts
     */
    public callFunction(callFunctionOptions: ICallFunctionOptions, opts?: ICustomReqOpts): Promise<any> {
        return callFunction(this, callFunctionOptions, opts)
    }

    public auth(): any {
        return auth(this)
    }

    /**
     * openapi调用
     *
     * @param param0
     * @param opts
     */
    public callWxOpenApi(
        wxOpenApiOptions: ICallWxOpenApiOptions,
        opts?: ICustomReqOpts
    ): Promise<any> {
        return callWxOpenApi(this, wxOpenApiOptions, opts)
    }

    /**
     * wxpayapi调用
     *
     * @param param0
     * @param opts
     */
    public callWxPayApi(
        wxOpenApiOptions: ICallWxOpenApiOptions,
        opts?: ICustomReqOpts
    ): Promise<any> {
        return callWxPayApi(this, wxOpenApiOptions, opts)
    }

    /**
     * wxpayapi调用
     *
     * @param param0
     * @param opts
     */
     public wxCallContainerApi(
        wxOpenApiOptions: ICallWxOpenApiOptions,
        opts?: ICustomReqOpts
    ): Promise<any> {
        return wxCallContainerApi(this, wxOpenApiOptions, opts)
    }

    /**
     * 微信云调用
     *
     * @param param0
     * @param opts
     */
    public callCompatibleWxOpenApi(
        wxOpenApiOptions: ICallWxOpenApiOptions,
        opts?: ICustomReqOpts
    ): Promise<any> {
        return callCompatibleWxOpenApi(this, wxOpenApiOptions, opts)
    }

    /**
     * 上传文件
     *
     * @param param0
     * @param opts
     */
    public uploadFile({ cloudPath, fileContent }, opts?: ICustomReqOpts): Promise<IUploadFileRes> {
        return uploadFile(this, { cloudPath, fileContent }, opts)
    }

    /**
     * 删除文件
     *
     * @param param0
     * @param opts
     */
    public deleteFile(
        { fileList },
        opts?: ICustomReqOpts
    ): Promise<ICustomErrRes | IDeleteFileRes> {
        return deleteFile(this, { fileList }, opts)
    }

    /**
     * 获取临时连接
     *
     * @param param0
     * @param opts
     */
    public getTempFileURL(
        { fileList },
        opts?: ICustomReqOpts
    ): Promise<ICustomErrRes | IGetFileUrlRes> {
        return getTempFileURL(this, { fileList }, opts)
    }

    /**
     * 下载文件
     *
     * @param params
     * @param opts
     */
    public downloadFile(
        params: { fileID: string; tempFilePath?: string },
        opts?: ICustomReqOpts
    ): Promise<ICustomErrRes | IDownloadFileRes> {
        return downloadFile(this, params, opts)
    }

    /**
     * 获取上传元数据
     *
     * @param param0
     * @param opts
     */
    public getUploadMetadata({ cloudPath }, opts?: ICustomReqOpts): Promise<any> {
        return getUploadMetadata(this, { cloudPath }, opts)
    }

    public getFileAuthority({ fileList }, opts?: ICustomReqOpts): Promise<any> {
        return getFileAuthority(this, { fileList }, opts)
    }

    /**
     * 获取logger
     *
     */
    public logger(): Log {
        if (!this.clsLogger) {
            this.clsLogger = logger()
        }
        return this.clsLogger
    }

    public analytics(reportData: IReportData): Promise<void> {
        return analytics(this, reportData)
    }

    // shim for tcb extension ci
    public get requestClient() {
        return {
            get: axios,
            post: axios,
            put: axios,
            delete: axios
        }
    }
}
