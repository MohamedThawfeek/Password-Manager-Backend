const {google} = require('googleapis');

exports.oauth2Client = new google.auth.OAuth2(
    process.env._CLIENT_ID,
    process.env._CLIENT_SECRET,
    "postmessage"
);

