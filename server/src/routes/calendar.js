import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

//creo calendario 
function createCalendarRouter(db) {
  const router = express.Router();

  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const event = req.body.event;
    if (!event) return res.status(400).json({ message: "Evento non fornito" });

    try {
      var result = await db.createEvent(uid, event);

      res.status(200).json({ message: "evento aggiunto correttamente", result });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  // TODO: fare un get per :eventId
  router.get('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    console.log(uid);
    try {
      var result = await db.getEvents(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "Nessun evento trovato" });

    //console.log(result);
    return res.status(200).json(result);
  });

  router.delete('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    try {
      await db.deleteEvent(uid, eventId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "evento eliminato correttamente", eventId });
  });

  router.post('/partecipate/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    try {
      var result = await db.partecipateEvent(uid, eventId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "partecipazione all'evento confermata", result });
  });

  router.patch('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    const event = req.body.event;
    if (!event) return res.status(400).json({ message: "Id dell'evento non fornito" });

    try {
      const result = await db.modifyEvent(uid, event, eventId);

      if (!result || Object.keys(result).length === 0) {
        return res.status(404).json({ message: "evento vuoto" });
      }
      res.status(200).json({ message: "evento modificato correttamente", result });
    } catch (e) {
      return res.status(500).json({ message: "Server error, " + e.message });
    }

  });

  return router;
}


export default createCalendarRouter;
