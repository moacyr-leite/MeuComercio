import { verifyToken } from '../controllers/authController.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ sucesso: false, erro: 'Token de autenticação ausente' });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ sucesso: false, erro: 'Token inválido ou expirado' });
  }
}
