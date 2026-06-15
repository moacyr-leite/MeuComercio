import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbController from '../dbController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'meucomercio-dev-secret';
const JWT_EXPIRES_IN = '7d';

function handleError(res, error, status = 500) {
  res.status(status).json({ sucesso: false, erro: error.message || String(error) });
}

export async function seedDefaultUser() {
  const usuarios = dbController.getAll('usuarios');
  if (usuarios.length > 0) {
    return;
  }

  const senhaHash = await bcrypt.hash('admin123', 10);
  dbController.insert('usuarios', {
    nome: 'Administrador',
    email: 'admin@meucomercio.local',
    senhaHash,
  });
}

export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ sucesso: false, erro: 'Email e senha são obrigatórios' });
    }

    const usuarios = dbController.getAll('usuarios');
    const usuario = usuarios.find((item) => item.email === String(email).trim().toLowerCase());

    if (!usuario) {
      return res.status(401).json({ sucesso: false, erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(String(senha), usuario.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { sub: usuario.id, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({
      sucesso: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getMe(req, res) {
  try {
    const usuario = dbController.getById('usuarios', req.user.sub);

    if (!usuario) {
      return res.status(401).json({ sucesso: false, erro: 'Usuário não encontrado' });
    }

    res.json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}
