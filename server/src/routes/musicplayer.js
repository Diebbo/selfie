import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

function createMusicRouter(db){
    const router = express.Router();

    router.get("/currentsong", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        try {
            const song = await db.getCurrentSong(uid);
            res.status(200).json(song);
        } catch (error) {
            console.error("Error getting current song:", error);
            res.status(400).json({ message: error.message });
        }
    });

    router.post("/next", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        // TODO
    }  );

    return router;
}

export default createMusicRouter;