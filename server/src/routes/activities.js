import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createActivityRouter(db) {
  const router = express.Router();
  
  //put attività
  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;

    if (!activity) return res.status(400).json({ message: "Attività non fornita" });

    try {
      var result = await db.createActivity(uid, activity);
      
    } catch (e) { 
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "errore nella creazione dell'attività" });

    res.status(200).json({ message: "attività aggiunta correttamente" , result });
  });

  //get attività (da user o da project)
  // es di URL: /activities/?fields=projectID
  //CHECKARE SE È UNA SOTTO ATTIVITÀ
  router.get('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const projectId = req.query.fields

    try {
      var result = await db.getActivities(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "Nessun attività trovata" });

    return res.status(200).json(result);
  });

  //delete attività (da user o da project)
  // es di URL: /activities/id?fields=project
  router.delete('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activityId = req.params.id;
    const projectId = req.query.fields;

    try {
      await db.deleteActivity(uid, activityId, projectId) ;
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json("Activity deleted successfully");
  });

  //patch attività
  

  return router;
}

export default createActivityRouter;
