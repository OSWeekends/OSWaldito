var config = {
    hangouts: {
      usuarioId: "",
      usuarioAutorizado: "",
      botEmail: "",
      botPassword: ""
    },
    slack: {
      webhookUri: "",
      channel: "",
      defaultMessage: "",
      username: "",
      icon: ""
    },
    twitter : {
      consumer_key: "", 
      consumer_secret: "",
      access_token_key: "",
      access_token_secret: ""
    },
    event: {
        hashtags: [],
        timerPriority: {
            high: 0,
            medium: 0,
            low: 0,
        },
        messagesByPriority: {
            high: [],
            medium: [],
            low: [],
        },
        messagesScheduled: [
            {cron: "", job: "", msg: ""}
        ]
    }
};

module.exports = config;