import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

export default function createChatRouter(db) {
  let router = express.Router();

  // get all messages
  router.get('/messages',cookieJwtAuth, async (req, res) => {
    const id = req.user._id;
    try {
      const messages = await db.messages.getUserMessages(id);
      res.status(200).json(messages);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // get all messages between two users
  router.get('/messages/:id',cookieJwtAuth, async (req, res) => {
    const sender = req.user._id;
    const receiver = req.params.id;
    try {
      const messages = await db.messages.getChat(sender, receiver);
      res.status(200).json(messages);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // send a message
  router.post('/messages/:id', cookieJwtAuth, async (req, res) => {
    const sender = req.user._id;
    const receiver = req.params.id;
    const message = req.body.message;
    try {
      const newMessage = await db.messages.sendMessage(sender, receiver, message);
      res.status(200).json(newMessage);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // get all users that the current user has chatted with and the last message
  router.get('/',cookieJwtAuth, async (req, res) => {
    const id = req.user._id;
    try {
      const chats = await db.messages.getChats(id);
      res.status(200).json(chats);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
