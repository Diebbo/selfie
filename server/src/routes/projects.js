import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

export function createProjectRouter(db) {
  const router = express.Router();

  router.put('/', cookieJwtAuth, async function(req, res) {
    const project = {...req.body.project, creator: req.user._id, creationDate: new Date()};

    try {
      var result = await db.createProject(project);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "progetto aggiunto correttamente" , result });
  });

  router.get('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    try {
      var result = await db.getProjects(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result || result.length == 0) return res.status(404).json({ message: "Nessun progetto trovato" });

    return res.status(200).json(result);
  });

  //patch projects
  
  //delete projects

  //add activity inside project
  // es di URL: /projectId/activities/parentId
  router.put('/:projectId/activities/:parentId', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const projectId = req.params.projectId;
    const parentId = req.params.parentId;
    const activity = req.body.activity;

    if (!activity) return res.status(400).json({ message: "Attività non fornita" });

    try {
      var result = await db.createActivity(uid, projectId, parentId, activity);
    } catch (e) { 
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "errore nella creazione dell'attività" });

    res.status(200).json({ message: "attività aggiunta correttamente" , result });
  });

  return router;
}
