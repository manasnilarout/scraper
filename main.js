'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import { BrowserActions } from './browser_actions/BrowserActions.js';
import { Logger, getFileName } from './utils/logger.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const logger = new Logger(getFileName(import.meta.url));

let scrapeConfig;
try {
    scrapeConfig = require('./extractor.config/config.json');
    logger.log(`Found config to scrape data from.\nTitle -> ${scrapeConfig.title}`);
} catch (e) {
    // Print error
    console.error(e);
}

const browserActions = new BrowserActions();

const doSomething = async () => {
    logger.log('Starting scraping action');
    await browserActions.openPage(scrapeConfig.baseUrl, scrapeConfig.homePageWaitForSelector);

    // Check if there is a action series to be performed
    if (scrapeConfig.actionSeries && scrapeConfig.actionSeries.length > 0) {
        for (const action of scrapeConfig.actionSeries) {
            logger.log(`Performing action -> ${action.type}|${action.actionName}`);
            await browserActions.performAction(action);
        }
    }

    process.exit(0);
};

doSomething();