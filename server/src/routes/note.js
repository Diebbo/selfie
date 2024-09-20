import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createNoteRouter(db) {
  const router = express.Router();

  router.post('/note', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const note = req.body.note;

    try {
      const result = await db.createNote(uid, note);
      res.status(200).json({ message: "nota aggiunta correttamente" , result});
    } catch (e) {
      console.error("Error creating note:", e);
      return res.status(400).json({ message: e.message });
    }
    
  });

  router.get('/noteslist', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;

    try {
      const user = await db.getUserById(uid);
      res.status(200).json(user.notes);
    } catch (e) {
      console.error("Error getting notes:", e);
      return res.status(400).json({ message: e.message });
    }
  });

  return router;
}

export default createNoteRouter;
