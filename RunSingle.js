const fs = require("fs");
const { google } = require('googleapis');
const express = require('express');
const open = require('opn');
const os = require('os');
const getEmails = require('./Main.js');

const app = express();
const PORT = 3000;
const REDIRECT_URL = 'http://localhost:3000/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']; // Gmail API scope

const canBreak = process.argv[2] !== 'false';

// Load client secrets from a file (you need to create this file with your credentials)
const credentials = require('./credentials.json');

// Create an OAuth2 client
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URL);

const home = os.homedir();
const logpath = home + "/Documents/EmailAutomation/";

if(!fs.existsSync(logpath)){
  fs.mkdirSync(logpath);
}

if (fs.existsSync(logpath + 'tokens.json')){
    const storedTokens = fs.readFileSync(logpath + 'tokens.json');
    oAuth2Client.setCredentials(JSON.parse(storedTokens));
    getEmails(oAuth2Client, canBreak);
} else {
  app.get('/', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    res.redirect(authUrl);
  });
  
  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
  
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      console.log('Refresh token obtained');
      await res.send('Logged in successfully. You can close this window.');
  
      oAuth2Client.setCredentials(tokens);

        fs.writeFileSync(logpath + 'tokens.json', JSON.stringify(tokens)); // Save the tokens

        getEmails(oAuth2Client, canBreak);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      res.status(500).send('Error retrieving access token.');
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
  // Open the authentication page in the default browser
  open(oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'select_account',
  }));
      //});
    //getEmails();
}
