import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

export function createFriendRouter(db) {
  const router = express.Router();

  router.get('/', cookieJwtAuth, async (req, res) => {
    try{
      const friends = await db.friendService.get(req.user._id);
      res.json(friends);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.put('/:friend', cookieJwtAuth, async (req, res) => {
    const id = req.user._id;
    const friend = req.params.friend;
    try {
      const newFriends = await db.friendService.add(id, friend);
      res.json(newFriends);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete('/:id', cookieJwtAuth, async (req, res) => {
    const id = req.user._id;
    const friendId = req.params.id;
    try {
      const result = await db.friendService.delete(id, friendId);
      res.json({ message: 'Friend deleted', result });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
