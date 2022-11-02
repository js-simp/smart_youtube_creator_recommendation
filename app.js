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

//-----------------------------Get Activity Information for Micro Creator Channels --------------------
async function activityInfo(channelId) {
  // let channels = readChannelsData(filename);
  // const res = await api_functions.findActivities(youtube, channelId);

  // console.log(res.data.items[0].snippet, res.data.items[0].contentDetails);

  const res = await api_functions.getVideoInfo(youtube, 'bAky8do4Htw');
  console.log(res.data.items[0].snippet, res.data.items[0].statistics, res.data.items[0].contentDetails)

  process.exit()
  
}

//-----------------------------Channel Information--------------------------------

async function channelInfo(filename) {
  let channels = readChannelsData(filename);
  let channel_info = readChannelsData('./lk_micro_creators/micro-creators.json');
  let channels_arr = Object.keys(channels);
  console.log(channels_arr.length)
  for (let index = 0; index < channels_arr.length; index++) {
    const channelId = channels_arr[index];

    if(!(channelId in channel_info)){
      let res = await api_functions.getChannelInfo(youtube, channelId);

      //filter all channels that have less than 100k subscribers
    if(!res.data.items[0].statistics.hiddenSubscriberCount) {
      if(parseInt(res.data.items[0].statistics.subscriberCount) < 100000) {
        channel_info[channelId] = res.data.items;
      }
    }
    else{
      channel_info[channelId] = res.data.items[0];
    }
    }
    
  }

  // items.forEach(item => {
  //   console.log(item.snippet, item.statistics, item.contentDetails)
  // });
  writetoFile('./lk_micro_creators/micro-creators.json', channel_info)
}

//----------------------channel Search--------------------------------------------
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

//-------------------reading and writing json functions ---------------------

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
// activityInfo('UC7oCWkWgXB5OOJAFv9HanyA')
// channelInfo('./channels/people-blogs-channels.json')
channelInfo('./health-topic-channels.json')
// channelSearch('CJYBEAA', './channels/health-topic-channels.json', '/m/0kt51', false)
// api_functions.getVidCategories(youtube)
// api_functions.getTopicIds()
// appendtest('CKYEEAA')
//start listening on port
app.listen(PORT, () => {
    console.log(`Listening on port ... ${PORT}`)
})
