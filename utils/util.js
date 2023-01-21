'use strict';

export const delay = t => new Promise(resolve => setTimeout(resolve, t * 1000));
