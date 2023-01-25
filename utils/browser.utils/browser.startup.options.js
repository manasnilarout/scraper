'use strict';

import { environmentConstants } from '../env.utils/env.config.js';

export const Options = {
    Defaults: {
        headless: environmentConstants.DEFAULTS.START_MODE === 'dev' ? true : false,
    },
};
