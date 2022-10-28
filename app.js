const express = require('express');
const session = require('express-session')
const dotenv = require('dotenv')
const youtube_api = require('@googleapis/youtube');
const fs = require('fs');
const readline = require('readline')
dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;
//allocate environment variables

//Middlware
app.use(express.json());


// Each API may support multiple versions. With this sample, we're getting
// v3 of the youtube API, and using an API key to authenticate.
const youtube = youtube_api.youtube({
    version: 'v3',
    auth: API_KEY
  });

async function runSearch() {
    const res = await youtube.search.list({
      part: 'snippet',
      relatedToVideoId: 'h8KXWJIgqLs',
      type: 'video'
    });
    console.log(res.data);
  }

async function channelSearch() {
  let date = Date(2020-03-25)
  const res = await youtube.search.list({
    part: 'snippet',
    location : '7.291418, 80.636696',
    locationRadius: '200km',
    type: 'video',
    videoCategoryId: '27',
    pageToken: 'CBQQAA',
    topicId:'/m/09s1f',
    maxResults: 20,
  });
  console.log(res.data.items);
}

async function findActivities() {
  const res = await youtube.activities.list({
    part: 'snippet,contentDetails',
    channelId: 'UCSHZKyawb77ixDdsGog4iWA',
    maxResults: 5
  });
  console.log(res.data);
}

async function getChannelInfo() {
  const res = await youtube.channels.list({
    part: 'brandingSettings,contentDetails,contentOwnerDetails,id,localizations,snippet,statistics,status,topicDetails',
    channelId: 'UCRBpynZV0b7ww2XMCfC17qg',
  });
  console.log(res.data);
}

async function getVidCategories() {
  const res = await youtube.videoCategories.list({
    part: 'snippet',
    regionCode: 'LK',
  });
  // console.log(res.data.items);
  addVidCategories(res.data.items)
}
function addVidCategories(data_arr) {
  let categories = {
    snippet_arr : []
  }
  data_arr.forEach(item => {
    let snippet = item.snippet;
    snippet.id = item.id;
    categories.snippet_arr.push(snippet);
  });
  
  fs.writeFile('video-categories.json', JSON.stringify(categories, null, '\t') , function(err) {
    if(err) {
      console.log(err);
    }
    console.log('Complete')
  })
}

async function getTopicIds() {
  const fileStream = fs.createReadStream('topicIDs.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let topicId = {}
  for await (const line of rl) {
    let currect_section = '';
    // Each line in input.txt will be successively available here as `line`.
    // console.log(`Line from file: ${line}`);
    if(line[0] != '/') {
      current_section = line;
      topicId[line] = {};
    }
    else{
      topic_arr = line.split('|')
      topicId[current_section][topic_arr[0]] = topic_arr[1]
    }

  }

  // console.log(topicId)
  fs.writeFile('topic-categories.json', JSON.stringify(topicId, null, '\t') , function(err) {
    if(err) {
      console.log(err);
    }
    console.log('Complete')
  })
}
// runSearch()
// findActivities()
// getChannelInfo()
// channelSearch()
// getVidCategories()
getTopicIds()
//start listening on port
app.listen(PORT, () => {
    console.log(`Listening on port ... ${PORT}`)
})
