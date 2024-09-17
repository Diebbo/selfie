import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createTimeRouter(db) {
  const router = express.Router();
  
  router.post('/time', cookieJwtAuth, function(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({message: 'You are not authorized to change the time'});
    }

    if (!req.body.date) {
      return res.status(400).json({message: 'Time required'});
    }

    try {
      db.changeDateTime(req.body.date);
      console.log('Time has been changed to', req.body.date);
      res.status(200).json({message: `Time has been changed to ${req.body.date}`});
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createTimeRouter;
