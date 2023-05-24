"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Snapshot {
    constructor(options) {
        const { id, docChanges, docs, msgType, type } = options;
        let cachedDocChanges;
        let cachedDocs;
        Object.defineProperties(this, {
            id: {
                get: () => id,
                enumerable: true
            },
            docChanges: {
                get: () => {
                    if (!cachedDocChanges) {
                        cachedDocChanges = JSON.parse(JSON.stringify(docChanges));
                    }
                    return cachedDocChanges;
                },
                enumerable: true
            },
            docs: {
                get: () => {
                    if (!cachedDocs) {
                        cachedDocs = JSON.parse(JSON.stringify(docs));
                    }
                    return cachedDocs;
                },
                enumerable: true
            },
            msgType: {
                get: () => msgType,
                enumerable: true
            },
            type: {
                get: () => type,
                enumerable: true
            }
        });
    }
}
exports.Snapshot = Snapshot;
