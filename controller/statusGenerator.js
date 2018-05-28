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
const statusEnum = {"OFF":1};
// Current state of the stove
let currentState = statusEnum.OFF;
// Current nonce
let currentNonce;

// Status, if the stove is "Off"
const defaultStatusOff = {"meta":{"sw_version":"V6.02","hw_version":"KS01","bootl_version":"V1.1","wifi_sw_version":"V1.0.1","wifi_bootl_version":"V1.0.1","sn":"0000042","typ":"HSP-6","language":"de","nonce":"mClaM2hQINs64uW3","wlan_features":["l", "hl", "wp"]},"prg":false,"wprg":false,"mode":"off","sp_temp":23,"is_temp":18.94,"ht_char":4,"weekprogram":[{"day":"we","begin":"00:00","end":"24:00","temp":21}],"error":[],"eco_mode":true,"pgi":false,"ignitions":14,"on_time":23,"consumption":28,"maintenance_in":972,"cleaning_in":1686};


// Assembles a message for the current state
function assembleStatusString() {
    let status;

    if (currentState = statusEnum.OFF)
    {
        logger.debug("State is OFF - assembling message");
        status = getStatusOff();
    }

    return status;
}


// Assemble a message for the state "Off"
function getStatusOff() {
    let status = defaultStatusOff;

    // Set random nonce
    currentNonce = generateNonce();
    status['meta']['nonce'] = currentNonce;

    return status;
}


// Generates a new random nonce
function generateNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 16; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}