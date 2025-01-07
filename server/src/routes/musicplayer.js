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

    router.get("/nextsong", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        try {
            const song = await db.getNextSong(uid);
            console.log("song", song);
            res.status(200).json(song);
        } catch (error) {
            console.error("Error getting next song:", error);
            res.status(400).json({ message: error.message });
        }
    });

    router.get("/prevsong", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        try {
            const song = await db.getPrevSong(uid);
            console.log("song", song);
            res.status(200).json(song);
        } catch (error) {
            console.error("Error getting previous song:", error);
            res.status(400).json({ message: error.message });
        }
    });

    router.get("/randomsong", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        try {
            const song = await db.getRandomSong(uid);
            res.status(200).json(song);
        } catch (error) {
            console.error("Error getting random song:", error);
            res.status(400).json({ message: error.message });
        }
    });


    router.post("/addsong", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        const song =  req.body.song;
        console.log("song", song);
        try {
            const result = await db.addSong(uid, song);
            res.status(200).json({ message: "Song added successfully", result });
        } catch (error) {
            console.error("Error adding song:", error);
            res.status(400).json({ message: error.message });
        }
    });

    router.post("/like", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        const songId = req.body.songId;
        try {
            const result = await db.addLike(uid, songId);
            res.status(200).json({ message: "Like added successfully", result });
        } catch (error) {
            console.error("Error adding like:", error);
            res.status(400).json({ message: error.message });
        }
    });

    router.delete("/like", cookieJwtAuth, async (req, res) => {
        const uid = req.user._id;
        const songId = req.body.songId;
        try {
            const result = await db.removeLike(uid, songId);
            res.status(200).json({ message: "Like removed successfully", result });
        } catch (error) {
            console.error("Error removing like:", error);
            res.status(400).json({ message: error.message });
        }
    });

    return router;
}

export default createMusicRouter;
