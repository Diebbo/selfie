import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createActivityRouter(db) {
  const router = express.Router();
  
  //put attività
  //URL: ?parent=parentId
  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;
    const projectId = null; //user activity 
    const parentId = req.query.parent ? req.query.parent : null;

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
  //URL: /:id/?child={childId}
  router.patch('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activityId = req.params.id;
    const activity = req.body.activity;
    const projectId = null; //user activity
    const childId = req.query.child ? req.query.child : null;
    let result;

    try {
      if(childId === null) {
        console.log("modifyActivity");
        result = await db.modifyActivity(uid, activity, activityId, projectId);
      } else {
        console.log("modifySubActivity", activity);
        result = await db.modifySubActivity(uid, activity, activityId, childId, projectId);
      }
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({message:"Activity modified successfully", result});
  });

  return router;
}

export default createActivityRouter;
