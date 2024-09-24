import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createActivityRouter(db) {
  const router = express.Router();
  
  //put attività
  router.put('/', cookieJwtAuth, async function(req, res) {
    const uid = req.user._id;
    const activity = req.body.activity;

    if (!activity) return res.status(400).json({ message: "Attività non fornita" });

    console.log("user: ", uid);
    try {
      var result = await db.createActivity(uid, activity);
      
    } catch (e) { 
      return res.status(400).json({ message: e.message });
    }

    console.log(result);
    if (!result) return res.status(404).json({ message: "errore nella creazione dell'attività" });

    res.status(200).json({ message: "attività aggiunta correttamente" , result });
  });

  //get attività

  //delete attività

  //patch

  return router;
}

export default createActivityRouter;
