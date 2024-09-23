import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createNoteRouter(db) {
  const router = express.Router();

  // Crea una nuova nota o modifica una esistente
  router.post('/post', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const note = req.body.note;

    try {
      const result = await db.postNote(uid, note);
      if (note._id) return res.status(200).json({ message: "nota modificata correttamente" , result});
      else res.status(200).json({ message: "nota aggiunta correttamente" , result});
    } catch (e) {
      console.error("Error creating note:", e);
      return res.status(400).json({ message: e.message });
    }
  });

  // Ritorna tutte le note: con il parametro fields nell'URL si possono specificare i campi
  // Es: /note/list?fields=title,date
  router.get('/list', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const fields = req.query.fields ? req.query.fields.split(',') : null;
    try {
      const result = await db.getNotes(uid, fields);
      if (!result || result.length == 0) return res.status(404).json({ message: "Nessuna nota trovata" });
      return res.status(200).json(result);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  // Ritorna la nota con l'id specificato
  router.get('/:id', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const noteId = req.params.id;
  
    try {
      const note = await db.getNoteById(uid, noteId);
      if (!note) return res.status(404).json({ message: "Nota non trovata" });
      return res.status(200).json(note);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  // Rimuove la nota con l'id specificato
  router.delete("/:id", cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const noteId = req.params.id;
  
    try {
      const result = await db.removeNoteById(uid, noteId);
      if (!result) return res.status(404).json({ message: "Nota non trovata" });
      return res.status(200).json({ message: "Nota rimossa correttamente" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  return router;
}

export default createNoteRouter;
