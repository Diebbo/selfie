import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createTimeRouter(db) {
  const router = express.Router();
  router.post('/time', cookieJwtAuth, function(req, res) {
    if (req.user.role !== 'admin') {
      res.status(400).send('You are not authorized to change the time');
    }

    if (!req.body.date) {
      res.status(400).send('Time required');
    }

    db.changeDateTime(req.body.date);
    console.log('Time has been changed to', req.body.date.toString());
    res.status(200).send({message:'Time has been changed to' + req.body.date.toString()});
  });
  return router;
}

export default createTimeRouter;
