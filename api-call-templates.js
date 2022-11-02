const fs = require('fs');
const readline = require('readline')

let api_functions = {
    runSearch : async function runSearch(youtube, options) {
        const res = await youtube.search.list(options);
        // console.log(res.data);
        return res
      },

    findActivities : async function findActivities(youtube, channelId) {
        const res = await youtube.activities.list({
          part: 'snippet,contentDetails',
          channelId: channelId,
          maxResults: 1
        });
        // console.log(res.data);
        return res
      },
      
    getChannelInfo : async function getChannelInfo(youtube, channelId) {
      const res = await youtube.channels.list({
        part: 'brandingSettings,contentDetails,id,localizations,snippet,statistics,status,topicDetails',
        id: channelId,
      });
      return res
    },

    getVideoInfo : async function getVideoInfo(youtube, videoId) {
      const res = await youtube.videos.list({
        part: 'contentDetails,liveStreamingDetails,localizations,player,recordingDetails,snippet,statistics,status,topicDetails',
        id : videoId,
        maxResults : 1
      })

      return res
    },
      
      getVidCategories : async function getVidCategories(youtube) {
        const res = await youtube.videoCategories.list({
          part: 'snippet',
          regionCode: 'LK',
        });
        // console.log(res.data.items);
        api_functions.addVidCategories(res.data.items)
      },

      addVidCategories : function addVidCategories(data_arr) {
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
      },

}


module.exports = api_functions