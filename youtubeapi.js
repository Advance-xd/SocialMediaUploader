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
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly'
  ]
});

// Print the authentication URL and prompt the user to visit it
console.log('Please visit the following URL to authorize the application:');
console.log(authUrl);

let response = null
let access_token = null
let refresh_token = null
let youtube = null

async function refreshAccessToken() {
    const oAuth2Client = new google.auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret, credentials.installed.redirect_uris);
    // Set the refresh token to the client
    oAuth2Client.setCredentials({
        refresh_token: refresh_token,
    });

    try {
        // Refresh the access token
        const { credentials } = await oAuth2Client.refreshAccessToken();
        access_token = credentials.access_token;

        console.log('New access token:', access_token);

        // Optionally, save the new token to a file/database or update your environment variables
    } catch (error) {
        console.error('Error refreshing access token:', error);
    }
}

let authCode = ''; // Replace with the authorization code obtained from the user

async function login() {
    response = await oauth2Client.getToken(authCode);
    access_token = response.tokens.access_token;
    refresh_token  = response.tokens.refresh_token;
    console.log("access_token", access_token)

    console.log("Refresh_token", refresh_token)

    oauth2Client.setCredentials({ access_token, refresh_token });
    console.log("starting login")
    // Create a YouTube Data API client
    youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    //refreshAccessToken();

    upload(0)
    //getUploadedVideos()
  
    
  
}

setInterval(() => {
    refreshAccessToken();
}, 1000*60*30);

async function upload(id) {
    console.log("upload video",id)
    const date = await getDayAfterXDays(await getFormattedDate(), id + 1)
    console.log(date)
    let title 
    if (redditvideos[id].data.media.reddit_video.height > redditvideos[id].data.media.reddit_video.width){
        console.log("shorts")
        title = redditvideos[id].data.title + " u/" + redditvideos[id].data.author + " #shorts"
    } else {
        console.log("normal video")
        title = redditvideos[id].data.title + " u/" + redditvideos[id].data.author

    }
    try {
        youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
              snippet: {
                title: title,
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
            if (err) throw err;
    
            //addDataToList(res.data)
            console.log(`Video uploaded successfully: https://www.youtube.com/watch?v=${res.data.id}`);
    
            if (id != redditvideos.length-1){
                upload(id+1)
        
            }
        });
    } catch (error){
        console.error('Error uploading video: ' + err);
        if (error.code === 401 || error.response.data.error === 'invalid_token') {
            console.log('Access token expired, refreshing token...');
            // Refresh the token and retry the upload
            const newToken = await oauth2Client.refreshAccessToken(); // Refresh the token
            oauth2Client.setCredentials(newToken.credentials); // Set the new token

            console.log('Token refreshed, retrying upload...');
            // Retry upload after refreshing the token
            await upload(id);
        } else {
            console.error('Error uploading video:', error);
        }
    }
    

    

}

async function getUploadedVideos() {
    // Get the authenticated user's channel details
    const channelResponse = await youtube.channels.list({
        part: 'contentDetails',
        mine: true,
      });
  
      // Get the upload playlist ID
      const uploadsPlaylistId =
        channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
  
      // Retrieve the list of uploaded videos, including scheduled ones
      const videoResponse = await youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 50, // You can adjust the number
      });

    fs.writeFileSync("./youtubevideosdata.json", JSON.stringify(videoResponse, null, 4));
  
    console.log('Scheduled/Unlisted/Private Videos:');
    for (const item of videoResponse.data.items) {
        const videoId = item.snippet.resourceId.videoId;
        const videoDetails = await youtube.videos.list({
          part: 'status,snippet',
          id: videoId,
        });
  
        const video = videoDetails.data.items[0];
  
        // Check if the video is scheduled (i.e., private or scheduled to publish)
        if (video.status.privacyStatus === 'private' || video.status.privacyStatus === 'unlisted') {
          console.log(`Title: ${video.snippet.title}`);
          console.log(`Video ID: ${videoId}`);
          console.log(`Privacy Status: ${video.status.privacyStatus}`);
          console.log('---');
        }
    }
}

async function addDataToList(newData) {
    // Read the current content of the file
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
  
      let jsonData;
      
      // Parse JSON if file has content, otherwise create an empty object
      try {
        jsonData = data ? JSON.parse(data) : {};
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        return;
      }
  
      // If "list" does not exist in JSON, create it as an array
      if (!Array.isArray(jsonData)) {
        jsonData = [];
      }
  
      // Add the new data to the "list"
      jsonData.push(newData);
  
      // Write the updated content back to the file
      fs.writeFile(path, JSON.stringify(jsonData, null, 4), (writeErr) => {
        if (writeErr) {
          console.error('Error writing to file:', writeErr);
        } else {
          console.log('Data successfully added to list!');
        }
      });
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

    res.sendFile('youtubeweb.html' , { root : "./"});
    
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

app.get('/data', (req, res) => {
    res.send(redditvideos);
})

server.listen(port, () => {
    console.log(`Server listening on the port:${port}`);
  
})