import { config } from '@packages/config';
import { Bot, Context } from 'grammy';
// import { escapers } from '@telegraf/entity';
import { I18n, I18nFlavor, TranslationVariables } from '@grammyjs/i18n';
import { newChatGroupFlow, newChatGroupProcessedFlow } from '@packages/flow';

type BotContext = Context & I18nFlavor;

const token = config.tgBot.token;
if (!token) throw new Error('Telegram bot token config is not defined');

const ownerStr = config.tgBot.owner;
if (!ownerStr) throw new Error('Telegram bot owner config is not defined');
const owner = parseInt(ownerStr);
if (isNaN(owner)) throw new Error('Failed to parse Telegram bot owner config');

const connection = config.redis;
if (!connection) throw new Error('Redis connection is not configured');

const bot = new Bot<BotContext>(token);

const locale = 'ru';
const i18n = new I18n<BotContext>({
  defaultLocale: locale, // see below for more information
  directory: 'locales', // Load all translation files from locales/.
});
bot.use(i18n);

bot.command('start', ctx => ctx.reply(ctx.t('start_command_reply')));

bot.on(':new_chat_members:me', async ctx => {
  if (ctx.message?.from.id !== owner && ctx.message?.chat.type !== 'private') {
    await ctx.reply(
      `Sorry, @${ctx.message?.from.username} you do not have privilegies to add me into group chats`
    );
    await ctx.leaveChat();
  } else {
    await ctx.reply('Hi there!');
    await newChatGroupFlow.queue.add(ctx.message.chat.id.toString(), {
      id: ctx.message.chat.id,
    });
  }
});

newChatGroupProcessedFlow.run(async job => {
  await bot.api.sendMessage(job.data.id, t('bot_inititated'));
});

bot.start().catch(e => {
  console.error(e);
});

// function escape(text: string): string {
//   return escapers.MarkdownV2(text);
// }

function t(key: string, variables?: TranslationVariables<string> | undefined) {
  if (variables)
    for (const key of Object.keys(variables)) {
      const val = variables[key];
      if (val) variables[key] = String(val);
    }
  return i18n.t(locale, key, variables);
}
