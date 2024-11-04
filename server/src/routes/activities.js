import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createActivityRouter(db) {
  const router = express.Router();

  //put attività
  //URL: /?parent=parentId per la sotto attività
  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;
    const parentId = req.query.parent ? req.query.parent : null;

    if (!activity) return res.status(400).json({ message: "activity was not provided" });
    let result;

    try {
      result = await db.createActivity(uid, activity, parentId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
    res.status(200).json({ message: "Activity has been Added Succesfully", activity: result });
  });

  router.get('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    try {
      var result = await db.getActivities(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "Activities have been fetched successfully", activities: result });
  });

  // es di URL: /:id attività o sotto-attività
  router.delete('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activityId = req.params.id;
    let result;
    try {
      result = await db.deleteActivity(uid, activityId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "Activity has been Deleted Successfully", activity: result });
  });

  //patch attività
  //URL: /:id attività o sotto-attività
  router.patch('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activityId = req.params.id;
    const activity = req.body.activity;

    try {
      var result = await db.modifyActivity(uid, activity, activityId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "Activity has been Modified Successfully", activity: result });
  });

  return router;
}

export default createActivityRouter;
