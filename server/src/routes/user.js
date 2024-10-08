import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

export default function createUserRouter(db) {
  const router = express.Router();

  router.get('/id', cookieJwtAuth, async (req, res) => {
    try {
      const dbuser = (await db.userService.getById(req.user._id)).toObject();
      const events = await db.getEvents(req.user._id);
      const friends = await db.friendService.get(req.user._id);

      const user = { ...dbuser, events, friends };

      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({message: error.message});
    }
  });

  return router;
}
