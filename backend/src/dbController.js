/**
 * Controlador de banco de dados
 * Gerencia operações CRUD e inicialização do banco
 */

import { readFileSync, writeFileSync } from 'fs';
import { initializeDatabase, getDatabasePath, SCHEMA } from '../database';

let database = null;

/**
 * Inicializa o banco de dados
 */
async function initialize() {
  try {
    initializeDatabase();
    loadDatabase();
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    return false;
  }
}

/**
 * Carrega o banco de dados em memória
 */
function loadDatabase() {
  const dbPath = getDatabasePath();
  try {
    const content = readFileSync(dbPath, 'utf8');
    database = JSON.parse(content);
    return true;
  } catch (error) {
    console.error('Erro ao carregar banco de dados:', error.message);
    return false;
  }
}

/**
 * Salva o banco de dados no arquivo
 */
function saveDatabase() {
  const dbPath = getDatabasePath();
  try {
    writeFileSync(dbPath, JSON.stringify(database, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar banco de dados:', error.message);
    return false;
  }
}

/**
 * Obtém o banco de dados
 */
function getDatabase() {
  if (!database) {
    loadDatabase();
  }
  return database;
}

/**
 * Obtém todos os registros de uma tabela
 */
function getAll(tableName) {
  if (!database[tableName]) {
    throw new Error(`Tabela "${tableName}" não existe`);
  }
  return database[tableName];
}

/**
 * Obtém um registro por ID
 */
function getById(tableName, id) {
  if (!database[tableName]) {
    throw new Error(`Tabela "${tableName}" não existe`);
  }
  return database[tableName].find((item) => item.id === id);
}

/**
 * Insere um novo registro
 */
function insert(tableName, data) {
  if (!database[tableName]) {
    throw new Error(`Tabela "${tableName}" não existe`);
  }

  // Gerar ID único
  const maxId = database[tableName].reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, 0);

  const newRecord = {
    id: maxId + 1,
    ...data,
    criado_em: new Date().toISOString(),
  };

  database[tableName].push(newRecord);
  saveDatabase();

  return newRecord;
}

/**
 * Atualiza um registro
 */
function update(tableName, id, data) {
  if (!database[tableName]) {
    throw new Error(`Tabela "${tableName}" não existe`);
  }

  const index = database[tableName].findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Registro com ID ${id} não encontrado em "${tableName}"`);
  }

  database[tableName][index] = {
    ...database[tableName][index],
    ...data,
    id, // não permitir alterar ID
    atualizado_em: new Date().toISOString(),
  };

  saveDatabase();
  return database[tableName][index];
}

/**
 * Deleta um registro
 */
function delete_(tableName, id) {
  if (!database[tableName]) {
    throw new Error(`Tabela "${tableName}" não existe`);
  }

  const index = database[tableName].findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Registro com ID ${id} não encontrado em "${tableName}"`);
  }

  const deleted = database[tableName].splice(index, 1);
  saveDatabase();
  return deleted[0];
}

export default {
  initialize,
  getDatabase,
  getAll,
  getById,
  insert,
  update,
  delete: delete_,
};
