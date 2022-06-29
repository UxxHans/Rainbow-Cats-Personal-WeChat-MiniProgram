export interface IKeyValue {
    [key: string]: any
}

export interface ICredentialsInfo {
    private_key_id: string
    private_key: string
    env_id?: string
}

export interface ICloudBaseConfig extends IKeyValue {
    debug?: boolean
    timeout?: number
    isHttp?: boolean
    secretId?: string
    secretKey?: string
    envName?: string | Symbol
    region?: string
    env?: string | Symbol
    sessionToken?: string
    serviceUrl?: string
    headers?: any
    proxy?: string
    version?: string
    credentials?: ICredentialsInfo
    throwOnCode?: boolean // 错误回包(带code) throw
    keepalive?: boolean // 是否开启keep alive
    /**
     * 获取跨帐号调用信息
     */
    getCrossAccountInfo?: () => Promise<ICrossAccountInfo>
}

export interface IRequestInfo {
    // 初始化配置
    config: ICloudBaseConfig
    // 请求方法 get post
    method: string
    // 业务逻辑自定义请求头
    headers: any
    // 业务逻辑自定义参数
    params: ICustomParam
    // 自定义api url
    customApiUrl?: string
    // 不参与签名项
    unSignedParams?: any
    // 是否为formData (wx.openApi formData:true)
    isFormData?: boolean
    // 用户自定义配置项
    opts?: any
}

export interface ICommonParam {
    action: string
    envName?: string | Symbol
    timestamp?: number
    eventId?: string
    wxCloudApiToken?: string
    tcb_sessionToken?: string
    authorization?: string
    sessionToken?: string
    sdk_version?: string
}

export interface ICustomParam extends ICommonParam {
    [propName: string]: any
}

export interface IRetryOptions {
    retries?: number
    factor?: number
    minTimeout?: number
    maxTimeout?: number
    randomize?: boolean

    timeouts?: number[]

    timeoutOps?: {
        timeout: number
        cb: Function
    }
}

interface ICrossAccountInfo {
    /**
     * 帐号凭证
     */
    credential: {
        secretId: string
        secretKey: string
        token: string
    }
    /**
     * 认证信息加密
     */
    authorization: {
        mpToken?: string // base64 buffer
    }
}

export interface ICustomReqOpts {
    timeout?: number
    // 重试选项，优先级高于全局配置
    retryOptions?: IRetryOptions
    /**
     * 获取跨帐号调用信息
     */
    getCrossAccountInfo?: () => Promise<ICrossAccountInfo>
}

export interface IUserInfoQuery {
    platform?: string
    platformId?: string
    uid?: string
}

export interface IErrorInfo {
    code?: string
    message?: string
    requestId?: string
}

export interface ICustomErrRes {
    [propName: string]: any
}

export interface IUploadFileRes {
    fileID: string
}

export interface IDeleteFileRes {
    fileList: Array<any>
    requestId: string
}

export interface IGetFileUrlRes {
    fileList: Array<any>
    requestId: string
}

export interface IDownloadFileRes {
    fileContent: Buffer
    message: string
}

export interface IReqOpts {
    proxy?: string
    qs?: any
    json?: boolean
    body?: any
    formData?: any
    encoding?: any
    keepalive?: boolean
    url: string
    method?: string
    timeout?: number
    headers?: any
}

export interface IReqHooks {
    handleData?: (res: any, err: any, response: any, body: any) => any
}

export interface IContextParam {
    memory_limit_in_mb: number
    time_limit_in_ms: number
    request_id?: string
    environ?: any
    environment?: any
    function_version: string
    function_name: string
    namespace: string
}

export interface ICallFunctionOptions {
    name: string
    data: any
    qualifier?: string
    // async?: boolean
}

export interface ICallWxOpenApiOptions {
    apiName: string
    apiOptions?: any
    cgiName?: string
    requestData: any
}

export interface ISCFContext {
    memoryLimitInMb: number
    timeLimitIns: number
    requestId: string
    functionVersion: string
    namespace: string
    functionName: string
    environ?: IEnvironmentInfo
    environment?: IEnvironmentInfo
}

export interface IEnvironmentInfo {
    WX_CLIENTIP?: string
    WX_CLIENTIPV6?: string
    WX_APPID?: string
    WX_OPENID?: string
    WX_API_TOKEN?: string
    WX_CONTEXT_KEYS?: string[]
    TCB_ENV: string
    TCB_SEQID: string
    TRIGGER_SRC: string
    TCB_SESSIONTOKEN?: string
    TCB_SOURCE?: string
    TCB_CONTEXT_KEYS: string[]
    TENCENTCLOUD_SECRETID: string
    TENCENTCLOUD_SECRETKEY: string
    TENCENTCLOUD_SESSIONTOKEN: string
    SCF_NAMESPACE: string
}

// 最完整的环境变量类型汇总
export interface ICompleteCloudbaseContext {
    _SCF_TCB_LOG?: string
    SCF_NAMESPACE: string
    TRIGGER_SRC: string
    TENCENTCLOUD_RUNENV: string
    TENCENTCLOUD_SECRETID: string
    TENCENTCLOUD_SECRETKEY: string
    TENCENTCLOUD_SESSIONTOKEN: string
    WX_CONTEXT_KEYS: string[]
    WX_TRIGGER_API_TOKEN_V0?: string
    WX_CLIENTIP?: string
    WX_CLIENTIPV6?: string
    LOGINTYPE?: string
    WX_APPID?: string
    WX_OPENID?: string
    WX_UNIONID?: string
    WX_API_TOKEN?: string
    WX_CLOUDBASE_ACCESSTOKEN?: string
    TCB_CONTEXT_KEYS: string[]
    TCB_ENV: string
    TCB_SEQID: string
    TCB_UUID?: string
    TCB_ISANONYMOUS_USER?: string
    TCB_SESSIONTOKEN?: string
    TCB_CUSTOM_USER_ID?: string
    TCB_SOURCE_IP?: string
    TCB_SOURCE?: string
    TCB_ROUTE_KEY?: string
    TCB_HTTP_CONTEXT?: string
    TCB_CONTEXT_CNFG?: string
    TCB_TRACELOG?: string
    QQ_OPENID?: string
    QQ_APPID?: string
}

// 上报数据结构
export interface IAnalyticsDataItem {
    analytics_scene: string, // 上报场景  如电商 mall，游戏 game
    analytics_data: { // 场景模板内容，以电商模板举例
        openid: string, // 必填  用户openid
        wechat_mini_program_appid: string, // 必填小程序appid
        action_time: number, // 必填  行为发生时，客户端的时间点，单位s
        action_type: string, // 必填 行为类型 如 访问 visit_store，分享 share，加入购物车 add_to_cart等
        click_id?: string, // 非必填  广告平台会在URL增加click_id
        action_param?: { // 非必填
            value?: number, // 非必填 行为所带的参数，转化行为价值（例如金额）
            leads_type?: string // 非必填 行为来源，目前支持PHONE（电话直呼），RESERVE（表单预约）
        },
        product_param?: { // 非必填
            product_yun_type?: string, // 非必填  商品 goods ，优惠券 coupon, 搜索词 search_term
            product_yun_id?: string, // 非必填 商品id
            product_yun_category?: string, // 非必填 商品类目 自定义
            product_yun_keywords?: string, // 非必填 商品关键词
            product_yun_price?: number, // 非必填 商品原价
            product_yun_value?: number, // 非必填 商品成交价
            product_yun_name?: string, // 非必填 商品名
            product_yun_id_ad?: string, // 非必填 广告商品库中商品id
            product_yun_category_ad?: string // 非必填 广告商品库中商品类目
        }
    }
}

// report 接口传参结构
export interface IReportData {
    report_type: string, // 上报场景  如电商 mall，游戏 game
    report_data: {
        action_time?: number, // 非必填  行为发生时，客户端的时间点，单位s
        action_type: string, // 必填 行为类型 如 访问 visit_store，分享 share，加入购物车 add_to_cart等
        click_id?: string, // 非必填  广告平台会在URL增加click_id
        action_param?: { // 非必填
            value?: number, // 非必填 行为所带的参数，转化行为价值（例如金额）
            leads_type?: string // 非必填 行为来源，目前支持PHONE（电话直呼），RESERVE（表单预约）
        },
        product_param?: { // 非必填
            product_yun_type?: string, // 非必填  商品 goods ，优惠券 coupon, 搜索词 search_term
            product_yun_id?: string, // 非必填 商品id
            product_yun_category?: string, // 非必填 商品类目 自定义
            product_yun_keywords?: string, // 非必填 商品关键词
            product_yun_price?: number, // 非必填 商品原价
            product_yun_value?: number, // 非必填 商品成交价
            product_yun_name?: string, // 非必填 商品名
            product_yun_id_ad?: string, // 非必填 广告商品库中商品id
            product_yun_category_ad?: string // 非必填 广告商品库中商品类目
        }
    }
}