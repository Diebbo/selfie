import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

export function createProjectRouter(db) {
  const router = express.Router();

  router.put('/', cookieJwtAuth, async function(req, res) {
    let project = req.body.project;
    if (!project) return res.status(400).json({ message: "Progetto non fornito" });
    let activities = project.activities;
    project = { ...project, activities: [] };

    try {
      var result = await db.createProject(req.user._id, project, activities);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "progetto aggiunto correttamente", result });
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
  // es di URL: /:projectId/activities/?fields=parentId
  router.put('/:projectId/activities', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;
    const projectId = req.params.projectId;
    const parentId = req.query.fields ? req.query.fields : null;

    if (!activity) return res.status(400).json({ message: "Attività non fornita" });

    let result;

    try {
      if (!parentId) {
        result = await db.createActivity(uid, projectId, activity);
      } else {
        result = await db.createSubActivity(uid, projectId, parentId, activity);
      }
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "errore nella creazione dell'attività" });

    res.status(200).json({ message: "attività aggiunta correttamente", result });
  });

  //get attività (da user o da project)
  //CHECKARE SE È UNA SOTTO ATTIVITÀ
  router.get('/:projectId/activities', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const projectId = req.query.projectId;
    let result;

    try {
      result = await db.getActivities(uid, projectId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "Nessun attività creata" });

    return res.status(200).json(result);
  });

  return router;
}
