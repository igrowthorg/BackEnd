import express from 'express';
const router = express.Router();
import session from 'express-session';
import { AddChild, AddChildGrowthDetail, CreateParent, GetAllChild, GetChildByID, GetChildGrowthDetailByID, GetGrowthDetailsChart, GetLastChildGrowthDetail, GetParentByID, GetSDMeasurements, GetVaccineTableForChild, MidwifeLogin, MidwifeLogout, UpdateChild, VaccineGetByChild, getAllParents } from '../methods/MidwifeMethod.js';



router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});


router.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

const checkAuth = (req, res, next) => {
    if(req.session.midwife) {
        next();
    }
    else {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }
}


router.options('*', (req, res) => res.sendStatus(200));
router.post('/login', MidwifeLogin);
router.post('/logout', MidwifeLogout);

router.use(checkAuth);

router.post('/parent', CreateParent);
router.get('/parents', getAllParents);
router.get('/parent/:guardian_nic', GetParentByID);


router.post('/child', AddChild);
router.post('/child/growth_detail/:child_id', AddChildGrowthDetail);
router.get('/child/growth_detail/:child_id', GetChildGrowthDetailByID);
router.get('/child/last-growth_detail/:child_id', GetLastChildGrowthDetail);
// FOR TABLE
router.get('/child/sd_measurements', GetSDMeasurements);

router.get('/child/vaccine/:child_id', GetVaccineTableForChild);
router.post('/child/vaccine/:child_id/:vaccine_id', VaccineGetByChild);

// Get growth detail chart data
router.get('/child/growth-detail-chart/:child_id', GetGrowthDetailsChart);

router.get('/child', GetAllChild);
router.get('/child/:id', GetChildByID);
router.put('/child/:child_id', UpdateChild);

export default router;