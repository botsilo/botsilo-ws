/**
 * Main application client
 */

 // our bot variable
var bot;

// hold encryption, decryption keys
var decMap = {};
var encMap = {};

function onConnect() {
  app.online = true;
  app.println(`Connected as ${app.id}! ${moment().format("H:mm:ss")}`, false, BLUE);
  app.prompt = ">>> ";
  app.focus();
  document.onkeydown = checkKey;
}

function onDisconnect() {
  app.online = false;
  app.id = "";
  app.prompt = "id: ";
  app.lines = [];
  app.focus();
}

function onMessage(from, payload) {

  if (typeof payload === 'string' || payload instanceof String) {

    if (from in decMap) {
      decrypt(decMap[from], payload).then(plaintext => {
        app.println(plaintext, from, false, true);
      }).catch(err => {
        app.println(`(${err.message})`, from, RED, true);
      });
      return;
    } else {
      app.println(payload, from, false, true);
    }
    return;
  }

  if ('error' in payload) {
    app.println(payload['error'], false, RED);
  } else if ('info' in payload) {
    var id = payload['info']['id'];
    var fr = payload['info']['friends'];

    app.println(`ID: ${payload['info']['id']}`, false, CYAN);
    if (fr.length) {
      app.println(`Friends: ${payload['info']['friends']}`, false, CYAN);
    } else {
      app.println(`Friends: (none)`, false, CYAN);
    }

  } else if ('message' in payload) {
    if (from == 'server') app.println(payload['message'], false, GREEN);
    else app.println(payload['message']);

  } else if ('png' in payload) {
    var data = payload['png'];
    app.lines.push({from: from, image: payload['png'], time: moment().format("H:mm:ss")});

  } else {
    console.log('what');
  }

  app.scrollDown();
}

var app = new Vue({
  el: '#app',
  data: {
    host: 'localhost',
    port: 3883,
    id: '',
    sk: '',
    online: false,
    theme: 'default',
    prompt: "id: ",
    command: "",
    lines: [],
    history: [],
    historyIndex: -1,
    bgColor: BLACK,
    color: WHITE,
    timeColor: BLUEGREY,
  },
  methods: {
    reset: () => {
      app.online = false;
      app.id = "";
      app.command = "";
      app.history = [];
      app.lines = [];
      app.prompt = "id: ";
    },
    scrollDown: () => {
        setTimeout(() => {
          window.scrollTo(0,document.body.scrollHeight);
        }, 1); //small timeout
    },
    focus: () => {
      setTimeout(() => { document.getElementById('input').focus(); }, 10);
    },
    enterUsername: (e) => {
      e.preventDefault();
      app.id = app.command;
      app.command = "";
      app.prompt = "sk: ";
      setTimeout(()=> {app.focus();});
    },
    enterPassword: (e) => {
      e.preventDefault();
      var sk = app.command;
      app.command = "";
      app.prompt = "";
      bot = new Bot(app.host, app.port, app.id.trim(), sk.trim(), onConnect, onDisconnect, onMessage);
      bot.start();
    },
    enterCommand: (e) => {
      e.preventDefault();

      var command = app.command;

      app.history.push(app.command);
      app.historyIndex = app.history.length;

      app.println(app.prompt + app.command);
      app.command = ""; // clear

      if (!command) return;
      var command_split = command.split(" ");

      console.log(`command: ${command}`);

      switch(command_split[0].toLowerCase()) {
        case "h":
        case "help":
          app.println('Commands: (s)end, (a)dd, (r)emove, (i)nfo, (ch)ange, (k)ill, (q)uit', false, YELLOW);
          break;
        case "cl":
        case "clear":
          app.lines = []; break;
        case "q":
        case "quit":
          bot.stop();
          app.reset();
          app.focus();
          break;
        case "s":
        case "send":
          if (command_split.length < 3) {
            return app.println('missing fields', false, RED);
          }
          send(command_split[1], command_split.splice(2).join(' '));
          break;
        case "a":
        case "add":
          if (command_split.length < 2) {
            return app.println('missing fields', false, RED);
          }
          bot.add(command_split[1]);
          break;
        case "c":
        case "create":
          if (command_split.length < 3) {
            return app.println('missing fields', false, RED);
          }
          bot.create(command_split[1], command_split[2]);
          break;
        case "i":
        case "info":
          bot.info();
          break;
        case "r":
        case "remove":
          if (command_split.length < 2) {
            return app.println('missing fields', false, RED);
          }
          bot.remove(command_split[1]);
          break;

        case "enc":
        case "encrypt":
          if (command_split.length < 3) {
            return app.println('missing fields', false, RED);
          }
          encMap[command_split[1]] = command_split[2];
          break;
        case "dec":
        case "decrypt":
          if (command_split.length < 3) {
            return app.println('missing fields', false, RED);
          }
          decMap[command_split[1]] = command_split[2];
          break;
        case "k":
        case "kill":
          if (command_split.length < 2) {
            return app.println('missing fields', false, RED);
          }
          bot.kill(command_split[1]);
          break;
        case "ch":
        case "change":
          if (command_split.length < 3) {
            return app.println('missing fields', false, RED);
          }
          bot.change(command_split[1], command_split[2]);
          break;
        // command not found
        default:
          app.println('-botsilo: ' + command_split[0] + ": command not found", false, RED);
      }
    },
    println: (text, from, color, displayTime) => {
        var line = {text: text, from: from, color: color};
        if (displayTime) line.time = moment().format("H:mm:ss");
        app.lines.push(line);
        //app.scrollDown();
    },
    setColors: (bg, c) => {
      if (bg) {
        app.bgColor = bg;
        document.body.style.backgroundColor = bg;
      }
      if (c) {
        app.color = c;
        document.body.style.color = c;
        document.getElementById('input').style.color = c;
      }
    }
  }
});


// override default host and port with query parameters
var host = getParameterByName('host');
var port = getParameterByName('port');
if (host) app.host = host;
if (port) app.port = parseInt(port);


function send(id, text) {
  if (id in encMap) {
    encrypt(encMap[id], text).then(ciphertext => {
      bot.send(id, ciphertext);
    }).catch(err => {
      app.println(err.message, false, RED);
    });
  } else {
    bot.send(id, text);
  }
}

function checkKey(e) {
  if (!app.online) return;
    switch (e.keyCode) {
      case 38:
        // up
        if (app.historyIndex > 0) {
          app.historyIndex -= 1;
          app.command = app.history[app.historyIndex];
        }
        break;
      case 40:
        // down
        if (app.historyIndex < app.history.length) {
          app.historyIndex += 1;
          app.command = app.history[app.historyIndex];
        }
        break;
    }
};
