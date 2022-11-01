const express = require('express');
const session = require('express-session')
const dotenv = require('dotenv')
const youtube_api = require('@googleapis/youtube');
const fs = require('fs');
const api_functions = require('./api-call-templates.js');
const { createBrotliCompress } = require('zlib');
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


function createOptions(nextPageToken, category_topic, isCategory) {
  let date = new Date(2022-01-21)
  let options = {
    part: 'snippet',
    location : '7.291418, 80.636696',
    locationRadius: '200km',
    type: 'video',
    publishedAfter	: date.toISOString(),
    pageToken: nextPageToken ,
    maxResults: 50,
  }

  if(isCategory){
    options.videoCategoryId = category_topic
  }
  else{
    options.topicId = category_topic
  }

  return options
}
async function channelInfo(channelId) {
  let res = await api_functions.getChannelInfo(youtube, channelId);
  let channel_info = {}
  let items=res.data.items;
  channel_info[channelId] = res.data.items;
  // items.forEach(item => {
  //   console.log(item.snippet, item.statistics, item.contentDetails)
  // });
  writetoFile('micro-creators.json', channel_info)
}

async function channelSearch(token = '', filename, category_topic, isCategory) {
  
  let nextPageToken = token;
  let channels = readChannelsData(filename);
  //collect the total results available, and the first set of results in one call
  // let res = await youtube.search.list(createOptions(nextPageToken, '22'));
  let res = await api_functions.runSearch(youtube, createOptions(nextPageToken, category_topic, isCategory))
  res.data.items.forEach(item => {
   
    // console.log(item.snippet.channelId)
    if(!(item.snippet.channelId in channels)){
      channels[item.snippet.channelId] = item.snippet.channelTitle;
    }
    
  });
  // console.log(res.data);
  let totalResults = res.data.pageInfo.totalResults;
  console.log(totalResults);
  let totalCycles = Math.floor(totalResults/50) < 75? Math.floor(totalResults/50) : 75;
  let remainingResults = totalResults%50;
  //run for loop to exhuast all results
  for (let index = 1; index < totalCycles; index++) {
    nextPageToken = res.data.nextPageToken;
    // res = await youtube.search.list(createOptions(nextPageToken, '22'));
    res = await api_functions.runSearch(youtube, createOptions(nextPageToken, category_topic, isCategory))
    res.data.items.forEach(item => {
      if(!(item.snippet.channelId in channels)){
        channels[item.snippet.channelId] = item.snippet.channelTitle
      }
      // console.log(item.snippet.channelId)
  });
  }

  writetoFile(filename, channels)
  console.log(nextPageToken);
}

function readChannelsData(filename) {
  const channels_json = fs.readFileSync(filename, 'utf-8');
  // console.log(channels_json.length)
  //check if file is empty
  if(channels_json.length === 0) {
    return {}
  }
  else{
    let channels = JSON.parse(channels_json);
    return channels
  }
  
}
function writetoFile(filename, data) {
  fs.writeFile(filename, JSON.stringify(data, null, '\t') , function(err) {
    if(err) {
      console.log(err);
    }
    console.log('Complete')
  })
}

// api_functions.findActivities(youtube)

channelInfo('UC9N1nzWyei0munVtz6zRt5w')
// channelSearch('CMgBEAA', './channels/entertainment-channels.json', '24', true)
// api_functions.getVidCategories(youtube)
// api_functions.getTopicIds()
// appendtest('CKYEEAA')
//start listening on port
app.listen(PORT, () => {
    console.log(`Listening on port ... ${PORT}`)
})
