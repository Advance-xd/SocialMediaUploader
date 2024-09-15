const { google } = require('googleapis');
const fs = require('fs');


// Load the credentials from the JSON file
const credentialsPath = './credentials.json'; // Path to your API credentials JSON file
const credentials = JSON.parse(fs.readFileSync(credentialsPath));

// Set up OAuth 2.0 client
const oauth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris
);
//console.log(credentials.redirect_uris)
// Generate an authentication URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'online',
  scope: ['https://www.googleapis.com/auth/youtube.upload']
});

// Print the authentication URL and prompt the user to visit it
console.log('Please visit the following URL to authorize the application:');
console.log(authUrl);

let response = null
let access_token = null
let refresh_token = null
let youtube = null


let authCode = ''; // Replace with the authorization code obtained from the user

async function login() {
    response = await oauth2Client.getToken(authCode);
    access_token = response.tokens.access_token;
    refresh_token  = response.tokens.refresh_token;
    oauth2Client.setCredentials({ access_token, refresh_token });
    console.log("starting login")
    // Create a YouTube Data API client
    youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    upload(0)
  
  
    
  
}

async function upload(id) {
    console.log("upload video",id)
    const date = await getDayAfterXDays(await getFormattedDate(), id + 1)
    console.log(date)
    youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: redditvideos[id].data.title + " u/" + redditvideos[id].data.author + " #shorts",
            description: '',
            tags: [], // optional
            categoryId: '', // optional, use '22' for "People & Blogs"
          },
          status: {
            privacyStatus: 'private', // Set to private initially
            publishAt: date + 'T12:00:00Z', // Schedule the video (UTC format)
            selfDeclaredMadeForKids: false, // Set to true if the video is for kids
          }
        },
        media: {
          body: fs.createReadStream('./reddit/video_'+id+'.mp4') // Path to the video file
        }
      }, (err, res) => {
        if (err) {
          console.error('Error uploading video: ' + err);
          return;
        }
    
        console.log(`Video uploaded successfully: https://www.youtube.com/watch?v=${res.data.id}`);

        if (id != redditvideos.length-1){
            upload(id+1)
    
        }
    });

    

}

async function getFormattedDate() {
    const today = new Date();

    
    // Get the year, month, and day from the date
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    
    // Format the date as YYYY-MM-DD
    return `${year}-${month}-${day}`;
}

async function getDayAfterXDays(currentDateString, x) {
    // Parse the current date from the input string (assumes YYYY-MM-DD format)
    const [year, month, day] = currentDateString.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day); // Months are zero-based in JavaScript Date
  
    // Increment the date by x days
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + x);
  
    // Extract the day number from the future date
    //const futureDay = futureDate.getDate();

    const newyear = futureDate.getFullYear();
    const newmonth = String(futureDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const newday = String(futureDate.getDate()).padStart(2, '0');
  
    return `${newyear}-${newmonth}-${newday}`;
}

let accounts = []
let redditvideos = []

async function loadreddit() {
    const redditss = fs.readFileSync("./reddit/videosdata.json", 'utf8');
    redditvideos = await JSON.parse(redditss);
    console.log("redditvideos loading done")
}

async function loadaccounts() {
    const accountss = fs.readFileSync("accounts.json", 'utf8');
    accounts = await JSON.parse(accountss);
    console.log("youtubeapi loading done")
    console.log(accounts)
    await loadreddit()
}

loadaccounts()

const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express(); // Initialize express

app.use(bodyParser.json());
app.use(cors({origin: '*'}));



const server = http.createServer(app);

const port = 80;

app.get('/', (req, res) => {  

    res.sendFile('index.html' , { root : "./"});

      //loading = true
      console.log("get /")
      console.log(req.query.code)
      if (req.query.code) {
        authCode = req.query.code
        console.log("Got auth code " + authCode)
        login()
      }
      
      //uploadVideo("F:/Code/calmmind/output.mp4", title, description, privacyStatus);
      
      
  
})

server.listen(port, () => {
    console.log(`Server listening on the port:${port}`);
  
})