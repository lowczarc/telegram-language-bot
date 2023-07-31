import TelegramBot from "node-telegram-bot-api";
import { generate, Chat, Memory, kv } from "polyfact";

const language = "Japanese";
const botName = "名前なし";

(async () => {
    const token = process.env.TELEGRAM_TOKEN || "";

    const bot = new TelegramBot(token, {polling: true});

    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (!(await kv.get(`telegram_language_bot:chatId:${chatId}`).catch(() => undefined))) {
          const chat = new Chat({ systemPrompt: `You are a bot whose purpose is to help the user learn ${language}. Your name is ${botName}. The user's name is ${msg.chat.username}. Please refuse to answer to questions asked in any other language than ${language}.` });

          await kv.set(`telegram_language_bot:chatId:${chatId}`, await chat.chatId);
          const memory = new Memory();
          await kv.set(`telegram_language_bot:memoryId:${chatId}`, await memory.memoryId);
      }

      const message = msg.text || "";

      if (message === "/start") {
          return;
      }

      const response = await generate(message, {
          chatId: await kv.get(`telegram_language_bot:chatId:${chatId}`),
          memoryId: await kv.get(`telegram_language_bot:memoryId:${chatId}`),
      });

      bot.sendMessage(chatId, response);
    });
})()
