import express from 'express';
import { getResumo } from '../controllers/relatorioController.js';

const router = express.Router();

router.get('/resumo', getResumo);

export default router;
