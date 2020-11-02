//Credits:
//Modified version of eslachance's "The Perfect Lil' Bot" https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3
//Modified version of Federico Grandi's cron solution to time checking in https://stackoverflow.com/a/53822507
//Everything else by Makin
// Load up the discord.js library
const Discord = require("discord.js");
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const cron = require('cron');
const http = require('http');
const https = require('https');
const TurndownService = require('turndown');
const storage = require('node-persist');

// Persistent storage for grand total
storage.initSync();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// The channel IDs in the alexanderwales Discord that aren't #bot-ez
const BANNED_CHANNEL_IDS = ['4376950374014648540', 
                            '437696073293758484',
                           '437696154424311830',
                           '437698440428912670',
                           '446115886349156352',
                           '674015083365662750',
                           '449360598594093066',
                           '511684577505574923',
                           '516008671206047776',
                           '739790983876575323'];

function downloadHTML() {
    // This function downloads the entire story every day so you can search it
    console.log('Attempting to download html');
    var download = function(url, dest, cb) {
      var file = fs.createWriteStream(dest);
      var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          console.log('HTML downloaded successfully');
          file.close(cb); 
        });
      }).on('error', function(err) { // Handle errors
        console.log('Error downloading HTML file: ' + err.message);
        fs.unlink(dest); 
        if (cb) cb(err.message);
      });
    };
    
    download("http://download.archiveofourown.org/downloads/11478249/Worth%20the%20Candle.html", "files/wtc.html");
}

let downloadTask = new cron.CronJob('13 00 00 * * *', downloadHTML); 


var grep = function(what, where, callback){
	var exec = require('child_process').exec;
	exec('\grep "' + what.replace(/"/g,"\\\"") + '" ' + where + ' -hiw -m 5', function(err, stdin, stdout){ 
		var list = {}
		var results = stdin.split('\n').slice(0,10);
	    callback(results)
	});
}

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

//starting turndown to turn HTML output into markdown for Discord
const turndownService = new TurndownService({
    headingstyle: 'atx',
    hr: '',
    emDelimiter: '*',
    fence: ''
});


const client = new Discord.Client();
const config = require("./config.json");
client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  //downloadHTML();    
  downloadTask.start();
  client.user.setActivity(`exposition fairy`);
    //set avatar (only needs to be done once)
  /*  client.user.setAvatar('./avatar.png')
  .then(user => console.log(`Avatar set!`))
  .catch(console.error);*/
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`exposition fairy`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`exposition fairy`);
});


client.on("message", async message => {
  if(BANNED_CHANNEL_IDS.includes(message.channel.id)) return;
  if(message.author.bot) return;

  if(message.content.indexOf(config.prefix) !== 0) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  function listProgress(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
      //test spreadsheet:
      //spreadsheetId: '1XIN9kXAQRKqwrlyDRXk4L56AwZoYaIR_0hjoJJ7Ab-g',
      spreadsheetId: '1PaLrwVYgxp_SYHtkred7ybpSJPHL88lf4zB0zMKmk1E',
    range: 'A2:I',
  }, (err, res) => {
    if (err){
        message.channel.send('Error contacting the Discord API: ' +  err);
        return console.log('The API returned an error: ' + err);
    }
    const rows = res.data.values;
    if (rows.length) {
      var batches = rows.map(function(value,index) { return value[1]; });
      for (var i = batches.length-1; i > 0; i--) {
          if(batches[i]) break;
      }
      var chapters = rows.map(function(value,index) { return value[0]; });
      for (var j = chapters.length-1; j > 0; j--) {
          if(chapters[j]) break;
      }
        
      var metadata = rows.map(function(value,index) { return value[5]; });
      for (var k = metadata.length-1; k > 0; k--) {
          if(metadata[k] && metadata [k] > 0) break;
      }
    
      var wordsPer = metadata[k];      
      var totalWords = metadata[k-1];
      var daysSince = metadata[k-2];
        
      if(message.member){
        var totaldata = rows.map(function(value,index) { return value[8]; });
        var grandTotal = totaldata[k];  
        var numbersUp = false;
        if(storage.getItemSync('grandtotal') < grandTotal){
          numbersUp = true;
          console.log("Numbers went up! New grand total: " + grandTotal)
        }
        // We store the grand total in case numbers actually went down
        storage.setItemSync('grandtotal', grandTotal); 
      }
      
      //Format fucked for some reason, only if AW puts something in the date field where he shouldn't   
      if((j-i) < 0){
          message.channel.send("Error fetching chapters from the spreadsheet (Wrong format?).");
      }
      //Special case: batch ready and upcoming, or already out with no progress
      else if((j-i) == 0){ 
          for (var l = i-1; l > 0; l--) {
            if(batches[l]) break;
          }
          var newdate = i;
          i = l; //amazing variable names, I know
          var chapterList = "";
        
            rows.slice(i+1,j+1).map((row) => {
            if(row[3]){
                chapterList += `Chapter ${row[0]}: ${row[2]} words (` + row[3] + ')\n';
            }
            else chapterList += `Chapter ${row[0]}: ${row[2]} words` + '\n';
            });
            
        
          const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#E5D2A0')
            .setTitle('Finished batch information')
            .setDescription("Available for the Early Birds Patreon tier **" + batches[newdate] + "**.\nNon-patrons will get the chapters one day later.")
            .setURL('https://docs.google.com/spreadsheets/d/1PaLrwVYgxp_SYHtkred7ybpSJPHL88lf4zB0zMKmk1E')
            .setAuthor('Worth the Candle', 'https://i.imgur.com/qyPZoAw.png', 'https://www.royalroad.com/fiction/25137/worth-the-candle')
            .addFields(
                { name: 'Chapter list', value: chapterList },
                { name: 'Batch stats', value: totalWords + ' words, ' + wordsPer + '/day', inline: true },
            )
          message.channel.send(exampleEmbed);
      }
      //End of special case, I hate myself for this hackery
      else {
        var chapterList = "";
        rows.slice(i+1,j+1).map((row) => {
            if (row[2] == undefined) row[2] = 0;
          if(row[3]){
              chapterList += `Chapter ${row[0]}: ${row[2]} words (` + row[3] + ')\n';
          }
          else chapterList += `Chapter ${row[0]}: ${row[2]} words` + '\n';
        });
            
        
        const progressEmbed = new Discord.MessageEmbed()
          .setColor('#E5D2A0')
          .setTitle('Upcoming chapter progress')
          .setURL('https://docs.google.com/spreadsheets/d/1PaLrwVYgxp_SYHtkred7ybpSJPHL88lf4zB0zMKmk1E')
          .setAuthor('Worth the Candle', 'https://i.imgur.com/qyPZoAw.png', 'https://www.royalroad.com/fiction/25137/worth-the-candle')
          .addFields(
              { name: 'Chapter list', value: chapterList },
              { name: 'Last batch', value: batches[i] + ' (' + daysSince +  ' days ago)', inline: true },
              { name: 'Upcoming batch stats', value: totalWords + ' words, ' + wordsPer + '/day', inline: true },
          );
          if (command === "pogress" || command === "pog"){
              progressEmbed.setTitle('Upcoming chapter pogress').setAuthor('Worth the Candle', 'https://i.imgur.com/Sikw7S2.png', 'https://www.royalroad.com/fiction/25137/worth-the-candle');
          }
          if (command === "regress"){
            progressEmbed.fields = [];
            progressEmbed.addFields(
              { name: 'Chapter list', value: 'Chapter 1: 0 words' },
              { name: 'Last batch', value: 'January 1st (' + 9999 +  ' days ago)', inline: true },
              { name: 'Upcoming batch stats', value: 0 + ' words, ' + 0 + '/day', inline: true },
              );
            progressEmbed.setTitle('Upcoming chapter \"progress\"');
          }
        
        message.channel.send(progressEmbed).then(sent => { // React if numbers went up
          if (numbersUp) {
              sent.react("758041474335113397");
          };
        });;
      }
      
    } else {
      console.log('No data found.');
      message.channel.send('Error contacting the server.');
    }
  });
  }
    
  if(command === "help") {
      if(message.member){
        console.log(message.member.user.tag + "(" + message.member.user + ") used command +help.");
    }
      else console.log("Someone used command +help.");
      
    const helpEmbed = new Discord.MessageEmbed()
        .setColor('#000000')
        .setAuthor('Help message', 'https://i.imgur.com/4Y8xKdY.png')
        .setDescription('RavenBot is designed to cater to the needs of the Alexander Wales server and provide information about his creations. '
                       + "All commands can be sent via Direct Message if you don't want to spam the chat. "
                       + 'If you need help regarding its use or have any feature suggestions, contact **Makin#0413**.\n\n' 
                       + '**Command List:**')
        .addFields(
            { name: '+help', value: 'Displays this message.' },
            { name: '+ping', value: 'Pings the bot to check its online status.' },
            { name: '+progress/+p', value: 'Shows the current progress of the next Worth the Candle batch of chapters. Please use in #bot-ez.' },
            { name: '+podcast', value: 'Adds the role Rationally Writing to the user, in order to be reminded of new AW podcast releases. Use again to remove.' },
            { name: '+testsearch <search term>', value: '(Direct Message only) Searches the entire text of Worth the Candle. Currently buggy and unreliable.' },
        )
      message.channel.send(helpEmbed);
  }
    
  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    if(message.member){
        console.log(message.member.user.tag + "(" + message.member.user + ") used command +ping.");
    }
      else console.log("Someone used command +ping.");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }
  
  /*removed after the great ravening of 2020
  if(command === "say") {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
    message.channel.send(sayMessage);
  }*/
    
  if(command === "progress" || command === "p" || command === "pogress" || command === "pog" || command === "regress") {
        if(message.member){
            console.log(message.member.user.tag + "(" + message.member.user + ") used command +" + command + " in channel " + message.channel.id + ".");
        } else console.log("Someone used command +" + command + " in channel " + message.channel.id + ".");
        fs.readFile('credentials.json', (err, content) => {
          if (err) return console.log('Error loading client secret file:', err);
          // Authorize a client with credentials, then call the Google Sheets API.
          authorize(JSON.parse(content), listProgress);
        }) 
  }
    
  if (command === "egress") {
      message.channel.send({
            files: [
                "./egress.jpg"
            ]
        });
  }

  if (command === "congress") {
      message.channel.send({
            files: [
                "./congress.jpg"
            ]
        });
  }
    
  if (command === "cypress") {
      message.channel.send({
            files: [
                "./cypress.png"
            ]
        });
  }
    
  if (command === "frogress") {
      message.channel.send({
            files: [
                "./frogress.png"
            ]
        });
  }

  if (command === "dogress") {
    message.channel.send({
          files: [
              "./dogress.png"
          ]
      });
  }
    
  if (command === "transgress") {
      message.channel.send({
            files: [
                "./transgress.jpg"
            ]
        });
  }
    
  if (command === "logress") {
      if(message.member){
            message.channel.send(message.member.user.tag + "(" + message.member.user + ") used command +" + command + " in channel "+message.channel.name + " (" + message.channel.id + ").");
        } else message.channel.send("You used command +" + command + " in a private message or something spooky like that (" + message.channel.id + ").");
  }
    
  if(command === "podcast") {
      if(message.member){
        if (!message.member.roles.cache.some(role => role.name === 'Rationally Writing')) {
            console.log(message.member.user.tag + "(" + message.member.user + ") used command +podcast without the role");
            const role = message.guild.roles.cache.find(role => role.name === 'Rationally Writing');
            message.member.roles.add(role);
            message.channel.send("Rationally Writing role added successfully. Listen to the podcast at <http://daystareld.com/podcasts/rationally-writing/>");
        }
        else{
            const role = message.guild.roles.cache.find(role => role.name === 'Rationally Writing');
            console.log(message.member.user.tag + "(" + message.member.user + ") used command +podcast with the role");
            message.member.roles.remove(role);
            message.channel.send("Rationally Writing role removed successfully.");
        }
      }
      else{
        message.channel.send("You need more Degrees of Reasonableness in order to use this command in a Direct Message.");
      }
  }
    
  if(command === "testsearch") {
      const searchContent = args.join(" ");
      if(message.member){
        console.log(message.member.user.tag + "(" + message.member.user + ") used command +search and searched '" + searchContent + "'.");
      }
      else {
      console.log("Someone used command +search and searched '" + searchContent + "'.");
      grep(searchContent, "files/wtc.html", function (list){
        if (list.length > 0){
            searchResults = "";
            var i=0;
            list.map((row) => {
            if(row.length > 0){
                i++;
                var start = 0;
                var end = 150;
                var pattern = new RegExp(searchContent, 'gi');
                var match = row.match(pattern);
                if(row.indexOf(match[0]) > end){
                    var start = row.indexOf(match[0]) - 75;
                    var end = row.indexOf(match[0]) + 75;
                }
                if(end > row.length) end = row.length;
                if(end-start < 150) start = end-150;
                if(start < 0) start = 0;
                // HACKERMAN AHEAD
                searchResults+= '**Result ' + i + ':** ...'+ `${turndownService.turndown(row).replace('* * *','').trim().slice(start,end).replace('_','').replace(/\n/g, " ").split("**").join("").replace(pattern, '**' + '$&' + '**')}` + '...' + '\n';
            }
            });
            
            if(searchResults.length > 1500){
                message.channel.send("Error displaying search results (result too big to display).");
                console.log(searchResults);
            }
            else if(searchResults != "") 
                message.channel.send(searchResults);
            else message.channel.send("No matches found.");
        }
        else message.channel.send("No matches found.");
      });
      }
  }
});

client.login(config.token);