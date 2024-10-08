import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

export default function createUserRouter(db) {
  const router = express.Router();

  router.get('/:id', cookieJwtAuth, async (req, res) => {
    if (req.user._id !== req.params.id) {
      return res.status(403).json({message: 'You are not authorized to view this user'});
    }

    try {
      const user = await db.userService.getById(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({message: 'User not found'});
    }
  });

  return router;
}
