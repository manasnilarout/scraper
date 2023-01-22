'use strict';

import { fileURLToPath } from 'url';

export const getFileName = (metaUrl) => {
    const __filename = fileURLToPath(metaUrl);

    return __filename.split('/scraper/')[1];
};


export const Logger = class {
    fileName;

    constructor(fileName) {
        this.fileName = fileName;
    }

    log = (log) => {
        console.log(`${this.fileName}|${new Date().toJSON()}| ${log}`);
    }

    debugLog = (log) => {
        console.log(`DEBUG|${this.fileName}|${new Date().toJSON()}| ${log}`);
    }
};