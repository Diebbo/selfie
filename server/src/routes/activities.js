import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createActivityRouter(db) {
  const router = express.Router();
  
  //put attività
  //URL: /?parent=parentId
  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;
    const projectId = null; //user activity 
    const parentId = req.query.parent ? req.query.parent : null;

    if (!activity) return res.status(400).json({ message: "Attività non fornita" });
    let result;

    try {
      if(!parentId) {
        console.log("uid: ", uid);
        result = await db.createActivity(uid, projectId, activity);
      } else {
        result = await db.createSubActivity(uid, projectId, parentId, activity);
      }
      console.log("result: ", result);
    } catch (e) { 
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "errore nella creazione dell'attività" });

    res.status(200).json({ message: "Activity Added Succesfully", result });
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
  // es di URL: /:id attività o sotto-attività
  router.delete('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activityId = req.params.id;
    const projectId = null; //user activity
    let result;
    try {
      console.log("deleteActivity: ", activityId);
      result = await db.deleteActivity(uid, activityId, projectId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({message:"Activity deleted successfully", result});
  });

  //patch attività
  //URL: /:id
  router.patch('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activityId = req.params.id;
    const activity = req.body.activity;
    const projectId = null; //user activity

    try {
      let result = await db.modifyActivity(uid, activity, activityId, projectId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({message:"Activity modified successfully", result});
  });

  return router;
}

export default createActivityRouter;
