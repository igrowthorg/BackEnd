import express from 'express';
const router = express.Router();
import session from 'express-session';
import { ParentLogin, ParentLogout, CheckParentAuth } from '../methods/ParentMethod.js';

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
      if(req.session.parent) {
          next();
      }
      else {
          return res.status(401).json({
              message: 'Unauthorized'
          })
      }
  }

router.options('*', (req, res) => res.sendStatus(200));
router.post('/login', ParentLogin);
router.post('/logout', ParentLogout);
router.get('/check-auth', CheckParentAuth);

router.use(checkAuth);

export default router;