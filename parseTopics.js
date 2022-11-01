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