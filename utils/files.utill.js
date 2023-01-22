'use strict';

import { access, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';

import { Logger } from './logger.js';

export const FileUtil = class {
    baseFolder;
    mainAction;
    logger;

    constructor(baseFolder) {
        this.baseFolder = baseFolder;
        this.logger = new Logger(FileUtil.name);
    }

    setAction = (a) => {
        this.mainAction = a;
    };

    getDir = (reference) => reference.replace(reference.split('/').pop(), '');

    getOpFolderPath = (folderName) => join(this.getDir(import.meta.url), '..', this.baseFolder, folderName);

    checkExistanceOfFolderFromRoot = async (folderName) => {
        const folderPath = this.getOpFolderPath(folderName);
        this.logger.log(`Checking existance of folder -> ${this.mainAction.code}`);
        try {
            await access(folderPath);
            return true;
        } catch (e) {
            return false;
        }
    };

    checkExistanceOfActionOpDir = () => {
        if (!this.mainAction) {
            throw new Error('Please set action.');
        }

        return this.checkExistanceOfFolderFromRoot(this.mainAction.code);
    };

    checkAndCreateActionOutputFolder = async () => {
        if (await this.checkExistanceOfActionOpDir()) {
            return;
        }

        return mkdir(this.getOpFolderPath(this.mainAction.code));
    };

    writeDataToFile = async (str, fileName) => {
        const filePath = join(this.getOpFolderPath(), fileName);
        await writeFile(filePath, str, { flag: 'a+' });
    };
};
