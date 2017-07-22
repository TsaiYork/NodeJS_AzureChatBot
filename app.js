var restify = require('./node_modules/restify');
var builder = require('botbuilder');
var configs = require('./configs.js');

const { DISPLAY_NAME, BOT_HANDLE, APP_ID, PASSWORD } = configs.BotProfile;

console.log('DISPLAY_NAME:' + DISPLAY_NAME);
console.log('BOT_HANDLE:' + BOT_HANDLE);

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: APP_ID,
    appPassword: PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("hello");
    var msg = session.message;

    if(msg.attachments && msg.attachments.length > 0){
        var attachment = msg.attachments[0];
        session.sendTyping();
        session.send({
            text: "You sent [" + attachment.contentType + "] file, name: [" + attachment.name + "]",
            attachments: [
                {
                    contentType: attachment.contentType,
                    contentUrl: attachment.contentUrl,
                    name: attachment.name
                }
            ]
        });
    }else{
        session.sendTyping();
        //session.say('This is Yo Yo Bot');
        setTimeout(function() {
            session.send("You said: %s", session.message.text);    
        }, 2000); 
    }
});

bot.on('conversationUpdate', function (message){
    if (message.membersAdded && message.membersAdded.length > 0) {
            //console.log(message.address.bot.name);
        var membersAdded = message.membersAdded
            .map(function (m) {
                var isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
            })
            .join(', ');

        bot.send(new builder.Message()
            .address(message.address)
            .text('Welcome ' + membersAdded));
    }
});