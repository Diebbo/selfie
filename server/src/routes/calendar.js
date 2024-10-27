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
      console.log(event);
      var result = await db.createEvent(uid, event);

      res.status(200).json({ message: "evento aggiunto correttamente", result });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

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

  router.get('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventid = req.params.id;
    console.log(uid);
    try {
      var result = await db.getEvent(uid, eventid);
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

  router.post('/participate/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    const response = req.body.response === "accept" ? true : false;

    try {
      console.log("prova");
      var result = await (response ? db.participateEvent(uid, eventId) : db.rejectEvent(uid, eventId));

    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "partecipazione/rifiuto all'evento confermata", result });
  });

  // per togliere il partecipante dall'evento faccio una query parametrica dove
  // metto l'id del partecipante
  // /api/events/:id/?fields=[true/false]
  router.patch('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    //user to remove
    const isDodge = req.query.fields === 'true' ? true : false;
    console.log(isDodge);

    if (!isDodge) {
      var event = req.body.event;
      if (!event) return res.status(400).json({ message: "Id dell'evento non fornito" });
    }

    try {
      // toglimi dall'evento || modifica evento
      const result = await (isDodge ? db.dodgeEvent(uid, eventId) : db.modifyEvent(uid, event, eventId));
      console.log(result);

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
