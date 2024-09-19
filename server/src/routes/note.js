import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createNoteRouter(db) {
  const router = express.Router();

  router.put('/', cookieJwtAuth, function(req, res) {
    const uid = req.user._id;
    const note = req.body.note;
    try {
      var result = db.createNote(uid, note);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "nota aggiunta correttamente" , result });
  });

  router.get('/', cookieJwtAuth, function(req, res) {
    const uid = req.user._id;
    try {
      var result = db.getNotes(uid);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (!result || Object.keys(result).length === 0) return res.status(404).json({ message: "Nessuna nota trovata" });

    return res.status(200).json(result);
  });

  return router;
}

export default createNoteRouter;
