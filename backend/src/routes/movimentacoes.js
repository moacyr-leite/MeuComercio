import express from 'express';
import {
  getAllMovimentacoes,
  getMovimentacaoById,
  createMovimentacao,
} from '../controllers/movimentacaoController.js';

const router = express.Router();

router.get('/', getAllMovimentacoes);
router.get('/:id', getMovimentacaoById);
router.post('/', createMovimentacao);

export default router;
