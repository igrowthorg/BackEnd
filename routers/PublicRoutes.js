import express from 'express';
import { GetAllAreas, GetAreaByID } from '../methods/PublicMethod.js';
const router = express.Router();


router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });

router.options('*', (req, res) => {
    res.sendStatus(200);
});
router.get('/areas', GetAllAreas);
router.get('/area/:id', GetAreaByID);

export default router;