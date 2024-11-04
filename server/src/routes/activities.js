import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createActivityRouter(db) {
  const router = express.Router();

  //put attività
  //URL: /?parent=parentId per la sotto attività
  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;
    const projectId = null; //user activity 
    const parentId = req.query.parent ? req.query.parent : null;

    if (!activity) return res.status(400).json({ message: "activity was not provided" });
    let result;

    try {
      if (!parentId) {
        console.log("stampona:", uid, activity, parentId);
        result = await db.createActivity(uid, projectId, activity);
        console.log(result);
      } else {
        result = await db.createSubActivity(uid, projectId, parentId, activity);
      }
      console.log("sono qua", result);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "error during creation of activty" });

    res.status(200).json({ message: "Activity has been Added Succesfully", result });
  });

  router.get('/', cookieJwtAuth, async function(req, res) {
    console.log("ohi 2");
    const uid = req.user._id;
    try {
      var result = await db.getActivities(uid, null);
      console.log("queste sono le mie attività", result);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "no activity has been found" });

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
      result = await db.deleteActivity(uid, activityId, projectId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "Activity has been Deleted Successfully", result });
  });

  //patch attività
  //URL: /:id attività o sotto-attività
  router.patch('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activityId = req.params.id;
    const activity = req.body.activity;
    const projectId = null; //user activity

    try {
      var result = await db.modifyActivity(uid, activity, activityId, projectId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "Activity has been Modified Successfully", result });
  });

  return router;
}

export default createActivityRouter;
