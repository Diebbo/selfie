import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createTimeRouter(db) {
  const router = express.Router();
  router.post('/time', cookieJwtAuth, function(req, res) {
    if (req.user.role !== 'admin') {
      res.send('You are not authorized to change the time');
    }

    if (!req.body.date) {
      res.status(400).send('Time required');
    }

    db.changeDateTime(req.body.date);
    res.send('Time has been changed');
  });
  return router;
}

export default createTimeRouter;
