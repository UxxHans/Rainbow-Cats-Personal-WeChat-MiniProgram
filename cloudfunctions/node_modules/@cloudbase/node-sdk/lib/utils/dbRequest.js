"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpRequest_1 = __importDefault(require("./httpRequest"));
/**
 * 数据库模块的通用请求方法
 *
 * @author haroldhu
 * @internal
 */
class DBRequest {
    /**
     * 初始化
     *
     * @internal
     * @param config
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * 发送请求
     *
     * @param dbParams   - 数据库请求参数
     * @param opts  - 可选配置项
     */
    async send(api, data, opts) {
        const params = Object.assign({}, data, { action: api });
        return httpRequest_1.default({
            config: this.config,
            params,
            method: 'post',
            opts,
            headers: {
                'content-type': 'application/json'
            }
        });
    }
}
exports.DBRequest = DBRequest;
