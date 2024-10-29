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
      var result = await db.projectService.createProject(req.user._id, project, activities);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "progetto aggiunto correttamente", project: result });
  });

  router.get('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    try {
      var result = await db.projectService.getProjects(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json(result);
  });

  //patch projects
  router.patch('/:projectId', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const projectId = req.params.projectId;
    const project = req.body.project;

    if (!project) return res.status(400).json({ message: "Progetto non fornito" });

    try {
      var result = await db.projectService.updateProject(uid, projectId, project);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "Errore nell'aggiornamento del progetto" });

    return res.status(200).json({ message: "progetto aggiornato correttamente", project: result });
  });

  //delete projects
  router.delete('/:projectId', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const projectId = req.params.projectId;

    try {
      var result = await db.projectService.delete(uid, projectId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "Errore nell'eliminazione del progetto" });

    return res.status(200).json({ message: "progetto eliminato correttamente" });
  });

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

  //patch attività
  router.post('/:projectId/activities/:activityId/togglecompleted', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const projectId = req.params.projectId;
    const activityId = req.params.activityId;

    try {
      var result = await db.projectService.toggleActivityStatus(uid, projectId, activityId);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result) return res.status(404).json({ message: "Errore nell'aggiornamento dell'attività" });

    return res.status(200).json({ message: "attività aggiornata correttamente", project: result });

  });
  return router;
}
