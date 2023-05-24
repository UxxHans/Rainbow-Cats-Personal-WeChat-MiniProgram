import request from 'request'

import { kMetadataBaseUrl } from './metadata'

interface Secret {
    id: string
    key: string
    token: string
    expire: number // 过期时间，单位：秒
}

/**
 * 容器托管内的密钥管理器
 */
export default class SecretManager {
    private tmpSecret: Secret | null
    private TMP_SECRET_URL: string
    public constructor() {
        this.TMP_SECRET_URL = `${kMetadataBaseUrl}/meta-data/cam/security-credentials/TCB_QcsRole`
        this.tmpSecret = null
    }

    /* istanbul ignore next */
    public async getTmpSecret(): Promise<Secret> {
        if (this.tmpSecret) {
            const now = new Date().getTime()
            const expire = this.tmpSecret.expire * 1000
            const oneHour = 3600 * 1000
            if (now < expire - oneHour) {
                // 密钥没过期
                return this.tmpSecret
            } else {
                // 密钥过期
                return this.fetchTmpSecret()
            }
        } else {
            return this.fetchTmpSecret()
        }
    }

    /* istanbul ignore next */
    private async fetchTmpSecret(): Promise<Secret> {
        const body: any = await this.get(this.TMP_SECRET_URL)
        const payload = JSON.parse(body)
        this.tmpSecret = {
            id: payload.TmpSecretId,
            key: payload.TmpSecretKey,
            expire: payload.ExpiredTime, // 过期时间，单位：秒
            token: payload.Token
        }
        return this.tmpSecret
    }

    /* istanbul ignore next */
    private get(url) {
        return new Promise((resolve, reject) => {
            request.get(url, (err, res, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(body)
                }
            })
        })
    }
}