import express from 'express';
import {
  getAllProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto,
} from '../controllers/produtoController.js';

const router = express.Router();

router.get('/', getAllProdutos);
router.get('/:id', getProdutoById);
router.post('/', createProduto);
router.put('/:id', updateProduto);
router.delete('/:id', deleteProduto);

export default router;
