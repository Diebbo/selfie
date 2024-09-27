import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createActivityRouter(db) {
  const router = express.Router();
  
  //put attività
  //URL: ?fields=parentId
  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;
    const projectId = null; //user activity 
    const parentId = req.query.fields ? req.query.fields : null;
    console.log("activity1: ", activity);

    if (!activity) return res.status(400).json({ message: "Attività non fornita" });
    let result;

    try {
      if(!parentId) {
        result = await db.createActivity(uid, projectId, activity);
      } else {
        result = await db.createSubActivity(uid, projectId, parentId, activity);
      }
      console.log("result: ", result);
    } catch (e) { 
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "errore nella creazione dell'attività" });

    res.status(200).json({ message: "attività aggiunta correttamente" , result });
  });

  router.get('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;

    try {
      var result = await db.getActivities(uid, null);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "Nessun attività creata" });

    return res.status(200).json(result);
  });

  //delete attività (da user o da project)
  // es di URL: :id/?fields=subActivityId
  router.delete('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const parentId = req.params.id;
    const projectId = null; //user activity
    const subActivityId = req.query.child;
    let result;
    try {
      if(subActivityId === null) {
        console.log("deleteActivity");
        await db.deleteActivity(uid, parentId, projectId);
      } else {
        console.log("deleteSubActivity", subActivityId);
        result = await db.deleteSubActivity(uid, parentId, projectId, subActivityId);  
      }
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({message:"Activity deleted successfully", result});
  });

  //patch attività

  return router;
}

export default createActivityRouter;
