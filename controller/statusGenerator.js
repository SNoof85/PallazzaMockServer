// Imports
const config = require('../config/config.js');
const logger = config.logger;

// Exported function
module.exports = {
    getStatus: function () {
        return assembleStatusString();
    }
};


// Possible states of the stove
const modeEnum = {"off":"off", "start":"start", "heating":"heating"};
const zoneEnum = {"none":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7};
// Current state of the stove
let currentMode = modeEnum.off;
let currentZone = zoneEnum.none;
// Current nonce
let currentNonce;

// Status, if the stove is "Off"
const defaultStatusOff = {"meta":{"sw_version":"V6.02","hw_version":"KS01","bootl_version":"V1.1","wifi_sw_version":"V1.0.1","wifi_bootl_version":"V1.0.1","sn":"0000042","typ":"HSP-6","language":"de","nonce":"mClaM2hQINs64uW3","wlan_features":["l", "hl", "wp"]},"prg":false,"wprg":false,"mode":"off","sp_temp":23,"is_temp":18.94,"ht_char":4,"weekprogram":[{"day":"we","begin":"00:00","end":"24:00","temp":21}],"error":[],"eco_mode":true,"pgi":false,"ignitions":14,"on_time":23,"consumption":28,"maintenance_in":972,"cleaning_in":1686};
const defaultStatusStart = {"meta":{"sw_version":"V6.02","hw_version":"KS01","bootl_version":"V1.1","wifi_sw_version":"V1.0.1","wifi_bootl_version":"V1.0.1","sn":"0000042","typ":"HSP-6","language":"de","nonce":"mClaM2hQINs64uW3","wlan_features":["l", "hl", "wp"]},"prg":false,"wprg":false,"mode":"off","sp_temp":23,"is_temp":18.94,"ht_char":4,"weekprogram":[{"day":"we","begin":"00:00","end":"24:00","temp":21}],"error":[],"eco_mode":true,"pgi":false,"ignitions":14,"on_time":23,"consumption":28,"maintenance_in":972,"cleaning_in":1686};
const defaultStatusHeating = {"meta":{"sw_version":"V6.02","hw_version":"KS01","bootl_version":"V1.1","wifi_sw_version":"V1.0.1","wifi_bootl_version":"V1.0.1","sn":"0000042","typ":"HSP-6","language":"de","nonce":"mClaM2hQINs64uW3","wlan_features":["l", "hl", "wp"]},"prg":false,"wprg":false,"mode":"off","sp_temp":23,"is_temp":18.94,"ht_char":4,"weekprogram":[{"day":"we","begin":"00:00","end":"24:00","temp":21}],"error":[],"eco_mode":true,"pgi":false,"ignitions":14,"on_time":23,"consumption":28,"maintenance_in":972,"cleaning_in":1686};


// Assembles a message for the current state
function assembleStatusString() {
    let status;

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

    // Update internal state
    updateInternalState();

    return status;
}


// Assemble a message for the state "off"
function getStatusOff() {
    let status = defaultStatusOff;

    // Set random nonce
    currentNonce = generateNonce();
    status['meta']['nonce'] = currentNonce;

    return status;
}

// Assemble a message for the state "start"
function getStatusStart() {
    let status = defaultStatusStart;

    // Set random nonce
    currentNonce = generateNonce();
    status['meta']['nonce'] = currentNonce;

    // Set state to start
    status['mode'] = 'start';

    return status;
}

// Assemble a message for the state "heating"
function getStatusHeating() {
    let status = defaultStatusHeating;

    // Set random nonce
    currentNonce = generateNonce();
    status['meta']['nonce'] = currentNonce;

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
            currentMode = modeEnum.start;
            break;
        case modeEnum.start:
            currentMode = modeEnum.heating;
            break;
        case modeEnum.heating:
            currentMode = modeEnum.off;
            break;
        default:
            currentMode = modeEnum.off;
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