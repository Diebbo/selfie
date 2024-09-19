import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createNoteRouter(db) {
  const router = express.Router();

  router.put('/note', cookieJwtAuth, function(req, res) {
    const uid = req.user.id;
    const note = req.body.note;
    try {
      const res = db.createNote(uid, note);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(200).json({ message: "nota aggiunta correttamente" , res});
  });

  return router;
}

export default createNoteRouter;
