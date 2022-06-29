"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR = {
    INVALID_PARAM: {
        code: 'INVALID_PARAM',
        message: 'invalid param'
    },
    SYS_ERR: {
        code: 'SYS_ERR',
        message: 'system error'
    },
    STORAGE_REQUEST_FAIL: {
        code: 'STORAGE_REQUEST_FAIL',
        message: 'storage request fail'
    },
    STORAGE_FILE_NONEXIST: {
        code: 'STORAGE_FILE_NONEXIST',
        message: 'storage file not exist'
    },
    TCB_CLS_UNOPEN: {
        code: 'TCB_CLS_UNOPEN',
        message: '需要先开通日志检索功能'
    },
    INVALID_CONTEXT: {
        code: 'INVALID_CONTEXT',
        message: '无效的context对象，请使用 云函数入口的context参数'
    }
};
