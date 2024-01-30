const fs = require("fs");
const { google } = require('googleapis');
const express = require('express');
const open = require('opn');

const app = express();
const PORT = 3000;
const REDIRECT_URL = 'http://localhost:3000/oauth2callback';
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile', // Add this line for People API
];
// Load client secrets from a file (you need to create this file with your credentials)
const credentials = require('./credentials.json');

// Create an OAuth2 client
const { client_secret, client_id } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URL);

let storedTokens;

if (fs.existsSync(__dirname + '/tokens.json')){
  storedTokens = JSON.parse(fs.readFileSync(__dirname + '/tokens.json'));
} else {
  storedTokens = [];
}

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

    storedTokens.push(tokens);

    await fs.writeFileSync(__dirname + '/tokens.json', JSON.stringify(storedTokens));

    process.exit();
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

/*const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/gmail.readonly', // Add necessary scopes
    response_type: 'code',
    prompt: 'consent',
  });
  
  console.log('Authorize this app by visiting this URL:', authUrl);
  //exec('start ' + authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    const { token } = await oAuth2Client.getToken(code);
    //oAuth2Client.getToken(code, (err, tokens) => {
        //if (err) return console.error('Error retrieving access token:', err);
        storedTokens.push(token);

        fs.writeFileSync(logpath + 'tokens.json', JSON.stringify(storedTokens)); // Save the tokens
      //});
    //getEmails();
  });*/