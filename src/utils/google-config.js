const {google} = require('googleapis');

exports.oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "postmessage"
);

