var config = require('./config'),
    credentials = require('./config').twitter,
    eventConfig = require('./config').event,
    SlackConfig = require('./config').slack,
    Scheduled = require("scheduled"),
    twitter = require('twitter'),
    hangoutsBot = require("hangouts-bot"),
    Slack = require('slack-node');
    
var twitterStream = new twitter(credentials),
    hashtags = eventConfig.hashtags,
    slack = new Slack(),
    masterUserRegex = new RegExp(config.hangouts.usuarioId),
    masterUser = config.hangouts.usuarioAutorizado,
    bot = new hangoutsBot(config.hangouts.botEmail, config.hangouts.botPassword),
    slackRegex = /^[Ss]lack /;
    
    
// Slack
slack.setWebhook(SlackConfig.webhookUri);

function slackNotify(msg, details) {
    details = details || {};
    slack.webhook({
        channel: details.channel || SlackConfig.channel,
        text: msg || SlackConfig.defaultMessage,
        username: details.username || SlackConfig.username,
        icon_emoji: details.icon || SlackConfig.icon
    }, function(err, response) {
        if (err) {
            bot.sendMessage(masterUser, "[Error] SLACK: " + err);
        }
    });
}

// Google Hangouts
bot.on('online', function() {
    bot.sendMessage(masterUser, "Hola de nuevo, Jefe!");
});

bot.on('message', function(from, message) {
    if (message === "Quien soy?") {
        bot.sendMessage(from, "Yo te conozco como " + from);
    } else if (slackRegex.test(message)) {
        if (masterUserRegex.test(from)) {
            message = message.replace(slackRegex, '');
            slackNotify(message);
        } else {
            bot.sendMessage(from, 'Buen intento.. pero con esas zapatillas no envío mensajes!');
            bot.sendMessage(masterUser, 'Intento de lanzar un mensaje por parte de ' + from + '\n Contenido: ' + message);
        }
    } else {
        bot.sendMessage(from, "No te entiendo... Explicate mejor, Humano!");
    }
});


// Twitter
twitterStream.stream('statuses/filter', {
    track: hashtags.join(',')
}, function(stream) {

    stream.on('data', function(tweet) {
        if (tweet.text !== undefined) {

            var data = {
                username: "Twitter",
                icon: "https://cdn3.iconfinder.com/data/icons/social-icons-5/607/Twitterbird.png"
            };

            slackNotify('https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str, data);
        }
    });

    stream.on('error', function(error, code) {
        bot.sendMessage(masterUser, "[ERROR][Twitter-Stream] Código: " + code + ". Detalle: " + error + ". CC: @ulisesgascon");
    });

});


// Bienvenida
slackNotify("Ya estoy Aquí! Se abren las notificaciones automáticas.\n¡Salvemos el mundo haciendo Software Libre!");


// Temporización via config.js
var messageManager = [];

for (var messages in eventConfig.messagesByPriority){
    setTimer(messages);
}

function setTimer (key) {
    if(eventConfig.timerPriority[key] && eventConfig.messagesByPriority[key]){
        setInterval(function(){
            slackNotify(eventConfig.messagesByPriority[key][Math.floor(Math.random() * eventConfig.messagesByPriority[key].length)]);
        }, eventConfig.timerPriority[key]);  
    }

}

for (var item in eventConfig.messagesScheduled){
    if(item.cron && item.job && item.msg){
        messageManager.push(new Scheduled({
            id: item.job,
            pattern: item.cron,
            task: function(){
                slackNotify(item.msg);
            }
        }).start());
    }
}


// Eventos
process.on('SIGINT', function() {
    slackNotify("Me expulsan del canal! Ya no me quereis como antes... \ncc: @ulisesgascon te portas mal conmigo.");
    bot.sendMessage(masterUser, "Me piro! Ya no me quieres como antes...");
    process.exit();
});

process.on('exit', function() {
    slackNotify("Salgo del canal! Pasarlo bien amigos.... \n¡Paz, amor y Open Source! \ncc: @ulisesgascon");
    bot.sendMessage(masterUser, "Me piro! Vaciones por fín!");
    process.exit();
});

process.on('uncaughtException', function() {
    slackNotify("Salgo del canal! Cierre inesperado... \n¡Paz, amor y Open Source!\ncc: @ulisesgascon");
    bot.sendMessage(masterUser, "Me piro! Cierre inesperado...");
    process.exit();
});