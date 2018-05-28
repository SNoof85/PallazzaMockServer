// Dependencies
const winston = require('winston');
const { format } = require('winston');
const { colorize, combine, timestamp, printf } = format;

// Define your custom format with printf.
const myFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`
});

// Instantiate logger
const logger = winston.createLogger({
    level: 'debug',
    format: combine(
        timestamp(),
        colorize(),
        myFormat
    ),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error'}),
        new winston.transports.File({ filename: 'combined.log'})
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            myFormat
        )
    }));
}

// Configuration
module.exports = {
    port : 4200,
    logger
};

