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
function createOptions(nextPageToken, category) {
  let date = new Date(2022-01-21)
  let options = {
    part: 'snippet',
    location : '7.291418, 80.636696',
    locationRadius: '200km',
    type: 'video',
    publishedAfter	: date.toISOString(),
    videoCategoryId: category,
    pageToken: nextPageToken ,
    maxResults: 50,
  }

  return options
}


async function channelSearch(token = '') {
  
  let nextPageToken = token;
  let channels = {};
  let res = await youtube.search.list(createOptions(nextPageToken, '22'));
  res.data.items.forEach(item => {
   
    // console.log(item.snippet.channelId)
    if(!(item.snippet.channelId in channels)){
      channels[item.snippet.channelId] = item.snippet.channelTitle;
    }
    
  });
  // console.log(res.data);
  let totalResults = res.data.pageInfo.totalResults;
  console.log(totalResults);
  let totalCycles = Math.floor(totalResults/50) < 20? Math.floor(totalResults/50) : 20;
  let remainingResults = totalResults%50;
  //run for loop to exhuast all results
  for (let index = 1; index < totalCycles; index++) {
    nextPageToken = res.data.nextPageToken;
    res = await youtube.search.list(createOptions(nextPageToken, '22'));
    res.data.items.forEach(item => {
      if(!(item.snippet.channelId in channels)){
        channels[item.snippet.channelId] = item.snippet.channelTitle
      }
      // console.log(item.snippet.channelId)
  });
  }
  
  fs.writeFile('check-people-channels.json', JSON.stringify(channels, null, '\t') , function(err) {
    if(err) {
      console.log(err);
    }
    console.log('Complete')
    console.log(nextPageToken);
  })
  
  /*
  1) save the nextpage token
  2) save all the channel Ids to array and remove any repeats
  3) repeat procedure for nextpage results
  */

}

async function appendChannels(pageToken) {
  const channels_json = fs.readFileSync('people-blogs-channels.json', 'utf-8');
  let channels = JSON.parse(channels_json);
  channels['nextPage'] = pageToken;
  fs.writeFile('people-blogs-channels.json', JSON.stringify(channels, null, '\t'), function(err) {
    if(err) {
      console.log(err);
    }
    console.log('Complete')
  })
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
channelSearch('CKYEEAA')
// getVidCategories()
// getTopicIds()
// appendtest('CKYEEAA')
//start listening on port
app.listen(PORT, () => {
    console.log(`Listening on port ... ${PORT}`)
})
