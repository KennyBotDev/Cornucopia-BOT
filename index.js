// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (process.version.slice(1).split(".")[0] < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

// Load up the discord.js library
const Discord = require("discord.js");
// We also load the rest of the things we need in this file:
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const klaw = require("klaw");
const path = require("path");

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're refering to. Your client.
const client = new Discord.Client();

// client is an instance of Discord.Client
client.on("message", (message) => {
  if(message.content == "server info?"){ // Check if content of message is "!ping"  
  
  const embed = new Discord.RichEmbed()
       .setColor(0x00AE86)
       .setTimestamp()
       .addField(`1) Bot Name:`, `1) ${client.user.username}`)
       .addField(`2) Server name:`, `2) ${message.guild.name}`)
       .addField(`3) Created on:`, `3) ${client.user.createdAt}`)
       .addField(`4) The server was created on:`, `4) ${message.guild.createdAt}`)
       .addField(`5) You join on:`, `5) ${message.member.joinedAt}`)
       .addField(`6) Total members:`, `6) ${message.guild.memberCount}`)
       .addField(`7) Name acronym:`, `7) ${message.guild.nameAcronym}`)

       
    return message.channel.send(embed);
    }
  });

  

  let coins = require("./coins.json");

  let coinAmt = Math.floor(Math.random() * 15) + 1;
  let baseAmt = Math.floor(Math.random() * 15) + 1;
  console.log(`${coinAmt} ; ${baseAmt}`);

  if(coinAmt === baseAmt){
    coins[message.author.id] = {
      coins: coins[message.author.id].coins + coinAmt
    };
  fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
    if (err) console.log(err)
  });
  let coinEmbed = new Discord.RichEmbed()
  .setAuthor(message.author.username)
  .setColor("#0000FF")
  .addField("💸", `${coinAmt} coins added!`);

  message.channel.send(coinEmbed).then(msg => {msg.delete(5000)});
  }

// Here we load the config file that contains our token and our prefix values.
client.config = require("./config.js");
// client.config.token contains the bot's token
// client.config.prefix contains the message prefix

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require("./util/functions")(client);

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

// Now we integrate the use of Evie's awesome Enhanced Map module, which
// essentially saves a collection to disk. This is great for per-server configs,
// and makes things extremely easy for this purpose.
client.settings = new Enmap({ 
  name: "settings",
  autoFetch: true,
  fetchAll: false,
  cloneLevel: 'deep',
  ensureProps: true
});

// Basically just an async shortcut to using a setTimeout. Nothing fancy!
client.wait = promisify(setTimeout);

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.

const init = async () => {

  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  const cmdFiles = await readdir("./commands/");
  client.log("log", `Loading a total of ${cmdFiles.length} commands.`);
  klaw("./commands").on("data", (item) => {
    const cmdFile = path.parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== ".js") return;
    const response = client.loadCommand(`${cmdFile.name}${cmdFile.ext}`);
    if (response) console.log(response);
  });

  const evtFiles = await readdir("./events/");
  client.log("log", `Loading a ${evtFiles.length} events.`);
  klaw("./events").on("data", (item) => {
    const evtFile = path.parse(item.path);
    if (!evtFile.ext || evtFile.ext !== ".js") return;
    const event = require(`./events/${evtFile.name}${evtFile.ext}`);
    client.on(evtFile.name, event.bind(null, client));
  });

  // Generate a cache of client permissions for pretty perms
  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

  // Here we login the client.
  client.login(client.config.token);

// End top-level async/await function.
};

init();
