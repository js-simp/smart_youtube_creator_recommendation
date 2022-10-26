const express = require('express');
const session = require('express-session')
const dotenv = require('dotenv')
const cors = require('cors');
const youtube_api = require('@googleapis/youtube');

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;
//allocate environment variables

//Middlware
app.use(express.json());
// app.use(cors({
//     origin : origin,
//     credentials : true,
// }
// ));

// Each API may support multiple versions. With this sample, we're getting
// v3 of the youtube API, and using an API key to authenticate.
const youtube = youtube_api.youtube({
    version: 'v3',
    auth: API_KEY
  });

async function runSample() {
    const res = await youtube.search.list({
      part: 'id,snippet',
      q: 'Node.js on Google Cloud',
    });
    console.log(res.data);
  }

runSample()
//start listening on port
app.listen(PORT, () => {
    console.log(`Listening on port ... ${PORT}`)
})
