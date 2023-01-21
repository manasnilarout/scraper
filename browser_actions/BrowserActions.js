'use strict';

import puppeteer from 'puppeteer';

import { Options } from '../utils/browser.utils/browser.startup.options.js';
import { environmentConstants } from '../utils/env.utils/env.config.js';
import { Logger } from '../utils/logger.js';
import { BROWSER_VIEW_PORT_SIZE, ACTION_TYPES } from '../config/constants.js';
import { delay } from '../utils/util.js';

export const BrowserActions = class {
    _browser;
    _page;
    logger;

    setBrowser = (b) => {
        this._browser = b;
    };

    setPage = (p) => {
        this._page = p;
    };

    constructor() {
        this.logger = new Logger(BrowserActions.name);
    };

    openPage = async (url, searchResultSelector) => {
        const browser = await puppeteer.launch(Options.Defaults);
        const page = await browser.newPage();
        this.setBrowser(browser);
        this.setPage(page);

        this.logger.log(`Opening webpage : ${url}`);
        await this._page.goto(url);
        this.logger.log(`Opened webpage : ${url}`);

        // Set screen size
        await this._page.setViewport(BROWSER_VIEW_PORT_SIZE);

        if (searchResultSelector) {
            try {
                this.logger.log(`Waiting for selector : ${searchResultSelector}`);
                await this._page.waitForSelector(searchResultSelector);
                this.logger.log(`Found selector : ${searchResultSelector}`);
            } catch (e) {
                if (environmentConstants.DEFAULTS.START_MODE === 'prod') {
                    throw e;
                }
                console.log(e);
            }
        }
    };

    executeBrowserJsAction = async (jsScriptStrOrFileName, args, isReadFromFile = false) => {
        if (isReadFromFile) {
            // Read the script from file and execute below
        }
        this.logger.debugLog(`JS -> ${jsScriptStrOrFileName}`);
        const func = new Function(jsScriptStrOrFileName);
        return await this._page.evaluate(func, args);
    };

    optionalWaitForSelector = async (selector, xpath, timeoutInSeconds = 10, crash = false) => {
        try {
            if (selector) {
                await this._page.waitForSelector(selector, {
                    timeout: timeoutInSeconds * 1000 * 1000 || 10000
                });
            } else if (xpath) {
                await this._page.waitForSelector(xpath, {
                    timeout: timeoutInSeconds * 1000
                });
            }
        } catch (e) {
            this.logger.log(`Selector ${selector || xpath} didn't load in ${timeoutInSeconds} seconds.`);
            if (crash) {
                throw e;
            }
        }
    };

    performAction = async (action) => {
        this.logger.debugLog(`Starting action -> ${action.actionName}`);

        switch (action.type) {
            case ACTION_TYPES.JS_SCRIPT: {
                if (action.context === 'browser') {
                    const results = await this.executeBrowserJsAction(
                        action.JS || action.JSFileName,
                        null,
                        !!(action.JS)
                    );
                    console.log(await results);
                    break;
                }
            }

            case ACTION_TYPES.FIND_AND_CLICK: {
                let selector;
                if (action.selector) {
                    await this.optionalWaitForSelector(action.selector, null, action.waitForSeconds, true);
                    selector = action.selector;
                } else if (action.xpth) {
                    await this.optionalWaitForSelector(null, action.xpath, action.waitForSeconds, true);
                    //TODO: Add support for xpath clicks
                }

                await this._page.click(selector);
                break;
            }

            case ACTION_TYPES.DELAY: {
                await delay(action.delayDurationInSeconds || 5);
                break;
            }

            default: {
                this.logger.log(`Umm! What happended here? Is this a valid action? (${action.type})`);
                break;
            }
        }
    };
};
