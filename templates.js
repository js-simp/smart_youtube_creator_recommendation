let api_functions = {
    activities : async function findActivities(youtube) {
        const res = await youtube.activities.list({
          part: 'snippet,contentDetails',
          channelId: 'UCSHZKyawb77ixDdsGog4iWA',
          maxResults: 5
        });
        console.log(res.data);
      },
      
      channelInfo : async function getChannelInfo(youtube) {
        const res = await youtube.channels.list({
          part: 'brandingSettings,contentDetails,contentOwnerDetails,id,localizations,snippet,statistics,status,topicDetails',
          channelId: 'UCRBpynZV0b7ww2XMCfC17qg',
        });
        console.log(res.data);
      },
      
      vidCategories : async function getVidCategories(youtube) {
        const res = await youtube.videoCategories.list({
          part: 'snippet',
          regionCode: 'LK',
        });
        // console.log(res.data.items);
        addVidCategories(res.data.items)
      },
}


module.exports = api_functions