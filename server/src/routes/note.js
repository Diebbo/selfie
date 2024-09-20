import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createNoteRouter(db) {
  const router = express.Router();

  router.put('/', cookieJwtAuth, async function(req, res) {
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

  router.get('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    try {
      var result = await db.getNotes(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result || result.length == 0) return res.status(404).json({ message: "Nessuna nota trovata" });

    return res.status(200).json(result);
  });

  return router;
}

export default createNoteRouter;
