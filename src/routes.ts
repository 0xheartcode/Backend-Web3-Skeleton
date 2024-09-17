import express from 'express';
import * as basicHandler from './handlers/basicHandler';
import { authenticateToken } from './middleware/auth';

const router = express.Router();
//
// BASIC AUTH
const basicRouter = express.Router();
basicRouter.get('/getPing', basicHandler.ping);  // Unrestricted Token Security 
basicRouter.get('/getSafePing', authenticateToken, basicHandler.safePing);
basicRouter.post('/setBearerToken', basicHandler.setNewBearerToken);    // Unrestricted Token Security 
basicRouter.get('/getCurrentToken', authenticateToken, basicHandler.getCurrentToken);  
basicRouter.post('/changeBearerToken', authenticateToken, basicHandler.changeBearerToken);  

router.use('/basic', basicRouter);

export default router;
