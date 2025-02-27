import express from "express";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";
import ical from 'node-ical';

//creo calendario
function createCalendarRouter(db, sendNotification) {
  const router = express.Router();

  router.put("/", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const event = req.body.event;
    if (!event) return res.status(400).json({ message: "Evento non fornito" });

    try {
      var result = await db.createEvent(uid, event);
      const notifications = result.notifications;
      const addedEvent = result.addedEvent;
      if (notifications) {
        for (let i = 0; i < notifications.length; i++) {
          sendNotification(notifications[i].user, notifications[i].payload);
        }
      }

      res
        .status(200)
        .json({ message: "evento aggiunto correttamente", result: addedEvent });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  router.get("/", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    try {
      var result = await db.getEvents(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result)
      return res.status(404).json({ message: "Nessun evento trovato" });

    return res.status(200).json(result);
  });

  router.get("/:id", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventid = req.params.id;
    try {
      var result = await db.getEvent(uid, eventid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result)
      return res.status(404).json({ message: "Nessun evento trovato" });

    return res.status(200).json(result);
  });

  router.get("/owner/:id", cookieJwtAuth, async (req, res) => {
    try {
      const uid = await db.userService.fromIdtoUsername(req.params.id);
      return res.status(200).json(uid);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.delete("/:id", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    try {
      await db.deleteEvent(uid, eventId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res
      .status(200)
      .json({ message: "evento eliminato correttamente", eventId });
  });

  router.post("/participate/:id", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    const response = req.body.response === "accept" ? true : false;

    try {
      var result = await (response
        ? db.participateEvent(uid, eventId)
        : db.rejectEvent(uid, eventId));
    } catch (e) {
      console.error(`error while ${response} an event:`, e);
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({
      message: "partecipazione/rifiuto all'evento confermata",
      result,
    });
  });

  // /api/events/:id/?fields=[true/false]
  router.patch("/:id", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const eventId = req.params.id;
    //user to remove
    const isDodge = req.query.fields === "true" ? true : false;

    if (!isDodge) {
      var event = req.body.event;
      if (!event)
        return res.status(400).json({ message: "Id dell'evento non fornito" });
    }

    try {
      const result = await (isDodge
        ? db.dodgeEvent(uid, eventId)
        : db.modifyEvent(uid, event, eventId));
      const notifications = result.notifications;
      if (notifications) {
        for (let i = 0; i < notifications.length; i++) {
          sendNotification(notifications[i].user, notifications[i].payload);
        }
      }

      if (!result || Object.keys(result).length === 0) {
        return res.status(404).json({ message: "evento vuoto" });
      }
      res
        .status(200)
        .json({ message: "evento modificato correttamente", result });
    } catch (e) {
      return res.status(500).json({ message: "Server error, " + e.message });
    }
  });

  // ritorna gli username, forse implementerò un query param per gli ids
  router.get("/:id/participants", cookieJwtAuth, async function(req, res) {
    try {
      const eventid = req.params.id;
      const usernames = await db.getParticipantsUsernames(eventid);
      const uids = await db.userService.fromUsernamesToIds(usernames);
      res.status(200).json({ usernames: usernames, uids: uids });
    } catch (e) {
      return res.status(500).json({ message: "Server error, " + e.message });
    }
  });

  // se metto /resourse non funziona, sta cosa non ha senso
  router.get("/resource/all", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    try {
      const result = await db.getResource(uid);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ message: "Server error, " + e.message });
    }
  });

  router.put("/resource", cookieJwtAuth, async function(req, res) {
    try {
      const newResource = req.body.resource;
      await db.addResource(newResource, req.user._id);
      return res.status(201).json({ message: "Resource added succesfully" });
    } catch (e) {
      return res.status(500).json({ message: "Server error, " + e.message });
    }
  });

  router.patch("/resource/:id", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const id = req.params.id;
    const endDate = req.body.endDate;
    const startDate = req.body.startDate;
    const oldBookId = req.query.oldBookId ?? null;
    try {
      if (oldBookId) {
        const result = await db.unBookResource(uid, oldBookId);
        if (!result) return res.status(400).json({ message: "Error unbooking the resource" });
      }
      const result = await db.bookResource(uid, id, startDate, endDate);
      if (result) {
        return res.status(200).json(result);
      }
      else {
        return res.status(400).json({ message: "Resource not available" });
      }
    } catch (e) {
      return res.status(400).json({ message: "Server error, " + e.message });
    }
  });

  // route per rimuovere il book di una risorsa 
  router.delete("/resource/:id", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const bookId = req.body.bookId;

    try {
      const result = await db.unBookResource(uid, bookId);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ message: "Server Error" + e })
    }

  });

  // route per cancellare totalmente una risorsa se admin
  router.delete("/admin/resource", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const resourceName = req.body.name;

    try {
      const result = await db.deleteResource(uid, resourceName);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ message: "Server Error" + e })
    }
  });


  router.post('/import', cookieJwtAuth, async function(req, res) {
    try {
      const { url, icalData } = req.body;

      if (!url && !icalData) {
        return res.status(400).json({ message: "No URL or iCal data provided" });
      }

      let events;
      try {
        if (url) {
          events = await ical.fromURL(url);
        } else {
          events = ical.sync.parseICS(icalData);
        }
      } catch (error) {
        return res.status(400).json({ message: "Invalid iCal format" });
      }

      // Passa l'userId dall'auth middleware
      const importedTitles = await db.importEvents(events, req.user._id);
      return res.status(200).json({ message: "Events have been imported successfully", importedTitles: importedTitles });
    } catch (error) {
      console.error('Import error:', error);
      return res.status(500).json({ message: "Server error: " + error.message });
    }
  });

  return router;
}

export default createCalendarRouter;
