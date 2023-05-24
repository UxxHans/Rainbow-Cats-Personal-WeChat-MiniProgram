/// <reference types="node" />
import { HexBase64Latin1Encoding } from 'crypto';
export declare function formateDate(timestamp: number): string;
export declare function second(): number;
export declare function stringify(v: any): string;
export declare function sha256hash(string: string, encoding?: HexBase64Latin1Encoding): string;
export declare function sha256hmac(string: string, secret?: string | Buffer, encoding?: HexBase64Latin1Encoding): string | Buffer;
export declare function isNodeEnv(): boolean;
