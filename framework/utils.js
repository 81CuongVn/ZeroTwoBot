'use strict';

const { MessageEmbed } = require('discord.js');

const { homeUrl } = require('../config.json');

const Playlist = require('./playlist');

module.exports = {
  escapeRegExp: function(strToReplace) {
    return strToReplace.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
  replace: function(strToReplace) {
    for(let i = 1; i < arguments.length; i++) {
      let regex = new RegExp(`\\{${i - 1}\\}`, 'g');
      if (typeof arguments[i] === "string")
        arguments[i] = arguments[i].replace('$', '$ ');
      strToReplace = strToReplace.replace(regex, arguments[i]).replace('$ ', '$');
    }

    return strToReplace;
  },
  getPermissionsString: function(permissionArray, rawString) {
    let permStr = "";
    if (!permissionArray || !permissionArray.length)
      return "";
    permissionArray.forEach((permission, index) => {
      permStr += `${(rawString===true) ? ((index>0) ? "+": "") : "`"}${
        permission
          .replace("ADMINISTRATOR", "Administrator")
          .replace("CREATE_INSTANT_INVITE", "Create Instant Invite")
          .replace("KICK_MEMBERS", "Kick Members")
          .replace("BAN_MEMBERS", "Ban Members")
          .replace("MANAGE_CHANNELS", "Manage Channels")
          .replace("MANAGE_GUILD", "Manage Server")
          .replace("ADD_REACTIONS", "Add Reactions")
          .replace("VIEW_AUDIT_LOG", "View Audit Log")
          .replace("VIEW_CHANNEL", "View Channel")
          .replace("SEND_MESSAGES", "Send Messages")
          .replace("SEND_TTS_MESSAGES", "Send Text-to-Speech Messages")
          .replace("MANAGE_MESSAGES", "Manage Messages")
          .replace("EMBED_LINKS", "Embed Links")
          .replace("ATTACH_FILES", "Attach Files")
          .replace("READ_MESSAGE_HISTORY", "Read Message History")
          .replace("MENTION_EVERYONE", "Mention Everyone")
          .replace("USE_EXTERNAL_EMOJIS", "Use External Emojis")
          .replace("CONNECT", "Connect")
          .replace("SPEAK", "Speak")
          .replace("MUTE_MEMBERS", "Mute Members")
          .replace("DEAFEN_MEMBERS", "Deafen Members")
          .replace("MOVE_MEMBERS", "Move Members")
          .replace("USE_VAD", "Use Voice Activation Detection")
          .replace("CHANGE_NICKNAME", "Change Nickname")
          .replace("MANAGE_NICKNAMES", "Manage Other Nicknames")
          .replace("MANAGE_ROLES", "Manage Roles")
          .replace("MANAGE_WEBHOOKS", "Manage Webhooks")
          .replace("MANAGE_EMOJIS", "Manage Emojis")
        }${(rawString===true) ? "" : "` "}`;
    });

    return permStr.trim();
  },
  /**
   * Turns 'map' to a JSON object.
   * @param {Map} map 
   * @returns {Object} JSON object from Map
   */
  mapToJSON: function(map) {
    return JSON.stringify([...map]);
  },
  /**
   * Returns a Map from a given JSON string.
   * @param {string} json String representation of JSON
   * @returns {Map} Map of JSON
   */
  JSONToMap: function(json) {
    return new Map(JSON.parse(json));
  },
  /**
   * Checks if the given value is a number.
   * @param {*} value The value to check against
   * @returns {Boolean} Is number or not
   */
  isInt: function(value) {
    return !isNaN(value);
  },
  /**
   * Gets the usage of a command from the locale given the command
   * @param {string} prefix Command prefix
   * @param {Command} command Name of command
   * @param {Object} commandLayoutLocale Locale JSON object
   * @returns {string} Usage
   */
  getCommandUsage: function(prefix, command, commandLayoutLocale) {
    let argsLayout = "";
    if (command.reqArgs) {
      command.reqArgs.forEach(arg => {
        argsLayout += this.replace(commandLayoutLocale.requiredArgs, arg);
      });
      argsLayout += " ";
    }

    if (command.optArgs) {
      command.optArgs.forEach(arg => {
        argsLayout += this.replace(commandLayoutLocale.optionalArgs, arg);
      });
    }

    let usage = prefix + " ";
    if (command.superCmd) {
      usage += command.superCmd
        .sort()
        .map(alias => {
          return this.replace(commandLayoutLocale.command, alias);
        })
        .join(commandLayoutLocale.divider);
      usage += " ";
    }
    usage += command.aliases
        .sort()
        .map(alias => {
          return this.replace(commandLayoutLocale.command, alias);
        })
        .join(commandLayoutLocale.divider);
    usage += " ";
    return this.replace(commandLayoutLocale.content, usage, argsLayout).trim();
  },
  /**
   * Creates and returns a Discord RichEmbed for sending messages.
   * @param {import('discord.js').Client} client The bot client to retrieve client info
   * @param {import('discord.js').ColorResolvable} color Resolvable colour preferably in hex string
   * @param {(string|null)} title Title to give rich embed
   * @param {string?} description The body of rich embed
   * @returns {import('discord.js').MessageEmbed} The created RichEmbed
   */
  getRichEmbed: function(client, color, title, description) {
    return new MessageEmbed()
      .setColor(color || 0xffffff)
      .setAuthor(title || client.user.username, client.user.displayAvatarURL, homeUrl || "")
      .setDescription(description || "")
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp(Date.now());
  },
  /**
   * Returns the voice channel in list of users or single user and undefined if 
   * not in any voice channels with given user(s).
   * @param {import('discord.js').Client} client The bot client to check
   * @param {(import('discord.js').User[]|import('discord.js').Snowflake)} users Number of users to check
   * @returns {?(Map.<import('discord.js').Snowflake,import('discord.js').VoiceChannel>|import('discord.js').VoiceChannel)} Voice channels in
   */
  getVoiceConnection: function(client, users) {
    if (users.constructor === Array) {
      let channels = new Map();
      users.forEach(uid => {
        let channel = client.channels.filter(channel => channel.type === 'voice' && channel.members.find(member => member.id === uid)).first();
        if (channel)
          channels.set(uid, channel);
      });
  
      return (channels.size > 0) ? channels : undefined;
    } else {
      return client.voice.connections.find(connection => connection.channel.members.find(member => member.id == users)) || undefined;
      // return client.channels.cache.filter(channel => channel.type === 'voice' && channel.members.find(member => member.id === users)).first() || undefined;
    }
  },
  /**
   * Gets the playlist for specified ID if exists, otherwise create one
   * @param {Map<import('discord.js').Snowflake,import('./playlist')>} playlists Map of all the current playlists
   * @param {import('discord.js').Snowflake} guildId ID of the guild to check for
   */
  getPlaylist: function(playlists, guildId) {
    if (!playlists.has(guildId))
      playlists.set(guildId, new Playlist(guildId, 0));
    return playlists.get(guildId);
  }
};