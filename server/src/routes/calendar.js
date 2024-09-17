import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

//creo calendario 
function createCalendarRouter(db) {
  const router = express.Router();

  router.post('/add', cookieJwtAuth, function(req, res) {
    const event = req.body.event;
    try {
      const res = db.createEvent(event);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "evento aggiunto correttamente" , event: event});
  });

  return router;
}

export default createCalendarRouter;
