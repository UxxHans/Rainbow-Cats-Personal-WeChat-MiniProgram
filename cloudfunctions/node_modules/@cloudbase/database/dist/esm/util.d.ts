interface DocumentModel {
    _id: string;
}
export declare class Util {
    static formatResDocumentData: (documents: DocumentModel[]) => {}[];
    static whichType: (obj: any) => String;
    static generateDocId: () => string;
}
export {};
