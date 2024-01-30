const fs = require("fs");
const { google } = require('googleapis');
const getEmails = require('./Main.js');

const canBreak = process.argv[2] !== 'false';

// Load client secrets from a file (you need to create this file with your credentials)
const credentials = require('./credentials.json');

const REDIRECT_URL = 'http://localhost:3000/oauth2callback';

// Create an OAuth2 client
const { client_secret, client_id } = credentials.installed;

const tokenPath = __dirname + "/tokens.json";

async function runAll(){
  const tokenFileExists = await fs.existsSync(tokenPath);
  if (tokenFileExists){
    const tokenFile = await fs.readFileSync(tokenPath);
      const storedTokens = JSON.parse(tokenFile);
      for(const element of storedTokens){
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URL);
        await oAuth2Client.setCredentials(element);
        //const userData = await getUserInfo(oAuth2Client);
        //console.log(userData);
        await getEmails(oAuth2Client, canBreak);
      }
      
  } else {
    console.log("Not logged into any accounts. Use AddAccount.js to log in.");
  }
}

runAll();