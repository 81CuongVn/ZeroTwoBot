'use strict';

const utils = require('../../framework/utils');

module.exports = {
  name: 'avatar',
  category: 'general',
  aliases: ['avatar'],
  reqArgs: ['username'],
  unlimitedArgs: false,
  description: (locale) => { return locale['general']['avatar']; },
  executeCommand: async (args) => {
    let locale = args.locale['general']['avatar'];

    let userMention = args.args.shift().replace(/[\\<>@#&!]/g, "");
    let user;
    try {
      user = await args.message.guild.members.fetch(userMention);
    } catch (e) {
      user = args.message.guild.members.cache.find(u => u.user.username === userMention || u.user.tag.replace(/[\\<>@#&!]/g, "") === userMention);
    }

    if (user) {
      await args.message.channel.send(
        utils.getRichEmbed(
          args.client,
          0x0dffe6,
          locale.title,
          locale.success
        ).setImage(user.user.displayAvatarURL())
      );
      return 'Success';
    } else {
      await args.message.channel.send(
        utils.getRichEmbed(
          args.client,
          0xff0000,
          locale.title,
          locale['errors'].noUser
        )
      );
      return 'Failed to find a user';
    }
  }
};