const chalk = require("chalk");
const log = console.log;
const fs = require('fs-extra')

const LOGGER_SEVERITIES = {
    normal: chalk.white, // "default"
    info: chalk.blue, // info
    success: chalk.green, // success
    warn: chalk.yellow, // warning
    error: chalk.red // error
};
const LOGGER_SYMBOLS = {
    OK: '\u2713', // checkmark
    WARN: '\u2757', // heavy exclamation mark
    FAIL: '\u2717' // cross
};

/**
 * Logging helper, standardizes how we log messages to users.
 * The context argument can be used to convey some meaning about the context of the message - example:
 * `log('World', 2, 'Hello');`
 * prints "[Hello] ✓ World"
 *
 * @param {string} message - Message to be printed
 * @param {number} severity - Severity level of the message (0-4)
 * @param {string} [context] - The context of the message, ie "watch"
 */
exports.log = (message, severity = 0, context) => {
    const ctx = [
        context ? `[${context}]` : ''
    ];
    switch (severity) {
        case 1: {
            log(LOGGER_SEVERITIES.info(`${ctx} ${message}`));
            break;
        }
        case 2: {
            log(LOGGER_SEVERITIES.success(`${ctx} ${LOGGER_SYMBOLS.OK} ${message}`));
            break;
        }
        case 3: {
            log(LOGGER_SEVERITIES.warn(`${ctx} ${LOGGER_SYMBOLS.WARN} ${message}`));
            break;
        }
        case 4: {
            log(LOGGER_SEVERITIES.error(`${ctx} ${LOGGER_SYMBOLS.FAIL} ${message}`));
            break;
        }
        case 0:
        default: {
            log(`${ctx} ${message}`);
        }
    }
};