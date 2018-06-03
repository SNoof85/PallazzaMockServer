// Imports
const config = require('../config/config.js');
const md5 = require('md5');
const logger = config.logger;
const pin = "0042";
const HPIN = calculateHPIN(pin);

// Exported function
module.exports = {
    getStatus: function () {
        return assembleStatusString();
    },
    setState: function (secret, body) {
        if (!validateSecret(secret))
        {
            newNonceRequired = true;
            return false;
        }
        else
        {
            let command = JSON.parse(body);

            if (command['sp_temp'] !== undefined)
            {
                logger.debug("Applying new temperature");
                sp_temp = command['sp_temp'];
                newNonceRequired = true;
            }
            else if (command['prg'] !== undefined)
            {
                logger.debug("Applying new program");
                prg = command['prg'];
                newNonceRequired = true;
            }
        }
    }
};


// Possible states of the stove
const modeEnum = {"off":"off", "start":"start", "heating":"heating"};
const zoneEnum = {"none":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7};
// Current state of the stove
let currentMode = modeEnum.off;
let currentZone = zoneEnum.none;
let sp_temp = 23;
let is_temp = 19;
let temp_step = 0.5;
let prg = false;
// Current nonce
let currentNonce;
let newNonceRequired = true;

// Status, if the stove is "Off"
const defaultStatusOff = {"meta":{"sw_version":"V6.02","hw_version":"KS01","bootl_version":"V1.1","wifi_sw_version":"V1.0.1","wifi_bootl_version":"V1.0.1","sn":"0000042","typ":"HSP-6","language":"de","nonce":"mClaM2hQINs64uW3","wlan_features":["l", "hl", "wp"]},"prg":false,"wprg":false,"mode":"off","sp_temp":42,"is_temp":18.94,"ht_char":4,"weekprogram":[{"day":"we","begin":"00:00","end":"24:00","temp":21}],"error":[],"eco_mode":true,"pgi":false,"ignitions":14,"on_time":23,"consumption":28,"maintenance_in":972,"cleaning_in":1686};
const defaultStatusStart = {"meta":{"sw_version":"V6.02","hw_version":"KS01","bootl_version":"V1.1","wifi_sw_version":"V1.0.1","wifi_bootl_version":"V1.0.1","sn":"0000042","typ":"HSP-6","language":"de","nonce":"mClaM2hQINs64uW3","wlan_features":["l", "hl", "wp"]},"prg":false,"wprg":false,"mode":"off","sp_temp":42,"is_temp":18.94,"ht_char":4,"weekprogram":[{"day":"we","begin":"00:00","end":"24:00","temp":21}],"error":[],"eco_mode":true,"pgi":false,"ignitions":14,"on_time":23,"consumption":28,"maintenance_in":972,"cleaning_in":1686};
const defaultStatusHeating = {"meta":{"sw_version":"V6.02","hw_version":"KS01","bootl_version":"V1.1","wifi_sw_version":"V1.0.1","wifi_bootl_version":"V1.0.1","sn":"0000042","typ":"HSP-6","language":"de","nonce":"mClaM2hQINs64uW3","wlan_features":["l", "hl", "wp"]},"prg":false,"wprg":false,"mode":"off","sp_temp":42,"is_temp":18.94,"ht_char":4,"weekprogram":[{"day":"we","begin":"00:00","end":"24:00","temp":21}],"error":[],"eco_mode":true,"pgi":false,"ignitions":14,"on_time":23,"consumption":28,"maintenance_in":972,"cleaning_in":1686};


// Assembles a message for the current state
function assembleStatusString() {
    let status;

    // Update internal state
    updateInternalState();

    // Get status message for current mode and zone
    switch (currentMode)
    {
        case modeEnum.off:
            logger.debug("State is OFF - assembling message");
            status = getStatusOff();
            break;
        case modeEnum.start:
            logger.debug("State is START - assembling message");
            status = getStatusStart();
            break;
        case modeEnum.heating:
            logger.debug("State is HEATING - assembling message");
            status = getStatusHeating();
            break;
        default:
            logger.debug("State is OFF - assembling message");
            status = getStatusOff();
    }

    // Global corrections
    // Do we need a new nonce?
    if (newNonceRequired)
    {
        currentNonce = generateNonce();
        newNonceRequired = false;
    }

    // Set nonce
    status['meta']['nonce'] = currentNonce;
    // Set current temperature
    status['is_temp'] = is_temp;
    // Set desired temperature
    status['sp_temp'] = sp_temp;
    // Set prg
    status['prg'] = prg;

    return status;
}


// Assemble a message for the state "off"
function getStatusOff()
{
    return defaultStatusOff;
}

// Assemble a message for the state "start"
function getStatusStart()
{
    let status = defaultStatusStart;

    // Set state to start
    status['mode'] = 'start';

    return status;
}

// Assemble a message for the state "heating"
function getStatusHeating()
{
    let status = defaultStatusHeating;

    // Set state to start
    status['mode'] = 'heating';

    return status;
}

// Update state (mode and zone)
// Currently: the state is simply incremented at each call: OFF -> START -> HEATING -> OFF ...
function updateInternalState()
{
    switch (currentMode)
    {
        case modeEnum.off:
            if (prg === true && is_temp <= (sp_temp - 4))
            {
                currentMode = modeEnum.start;
            }
            else if (prg === false && is_temp >= (sp_temp - 8))
            {
                is_temp -= temp_step;
            }
            break;
        case modeEnum.start:
            currentMode = modeEnum.heating;
            break;
        case modeEnum.heating:
            if (is_temp < sp_temp)
            {
                is_temp += temp_step;
            }
            else
            {
                currentMode = modeEnum.off;
                prg = false;
            }
            break;
        default:
            currentMode = modeEnum.off;
    }

    if (prg === false)
    {
        currentMode = modeEnum.off;
        prg = false;
    }

    logger.debug('Updated internal state: mode is ' + currentMode + ', zone is ' + currentZone);
}

// Generates a new random nonce
function generateNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 16; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// Validate pin
function validateSecret(secret)
{
    if (calculateHSPIN(currentNonce, HPIN) !== secret)
    {
        logger.debug("Provided secret was incorrect!");
        return false;
    }

    logger.debug("Provided secret was correct!");
    return true;
}

// HSPIN = MD5(NONCE + HPIN)
function calculateHSPIN(NONCE, HPIN)
{
    let result = md5(NONCE + HPIN);
    logger.debug('HSPIN: ' + HPIN);

    return result;
}

// HPIN = MD5(PIN)
function calculateHPIN(PIN)
{
    let result = md5(PIN);
    logger.debug('HPIN: ' + result);

    return result;
}