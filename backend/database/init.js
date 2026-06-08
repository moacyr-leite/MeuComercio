/**
 * Inicializador do banco de dados
 * Verifica se os arquivos necessários existem e cria a estrutura se necessário
 */

const fs = require('fs');
const path = require('path');
const { SCHEMA } = require('./schema');

const DB_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DB_DIR, 'database.json');

/**
 * Verifica se o diretório de dados existe, se não, cria
 */
function ensureDataDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`✓ Diretório de dados criado: ${DB_DIR}`);
    return true;
  }
  return false;
}

/**
 * Cria a estrutura inicial do banco de dados em JSON
 */
function createDatabaseStructure() {
  const database = {};

  Object.keys(SCHEMA).forEach((tableName) => {
    database[tableName] = [];
  });

  return database;
}

/**
 * Verifica e valida a estrutura do banco de dados
 */
function validateDatabase(data) {
  const errors = [];

  // Verificar se todas as tabelas do schema existem
  Object.keys(SCHEMA).forEach((tableName) => {
    if (!data[tableName]) {
      errors.push(`Tabela "${tableName}" não encontrada`);
    }
  });

  // Verificar se não há tabelas extras
  Object.keys(data).forEach((tableName) => {
    if (!SCHEMA[tableName]) {
      errors.push(`Tabela extra "${tableName}" encontrada`);
    }
  });

  return errors;
}

/**
 * Inicializa o banco de dados
 */
function initializeDatabase() {
  console.log('\n📦 Iniciando verificação do banco de dados...\n');

  // 1. Garantir que o diretório existe
  const dirCreated = ensureDataDirectory();

  // 2. Verificar se arquivo do banco existe
  if (fs.existsSync(DB_FILE)) {
    console.log(`✓ Arquivo de banco de dados encontrado: ${DB_FILE}`);

    try {
      const fileContent = fs.readFileSync(DB_FILE, 'utf8');
      const database = JSON.parse(fileContent);

      // 3. Validar estrutura
      const errors = validateDatabase(database);

      if (errors.length === 0) {
        console.log('✓ Estrutura do banco de dados está correta\n');
        return true;
      } else {
        console.error('❌ Erros encontrados na estrutura:');
        errors.forEach((err) => console.error(`  - ${err}`));
        console.log('\n⚠️  Recriando banco de dados com estrutura correta...\n');

        // Recriar banco com estrutura correta
        const newDatabase = createDatabaseStructure();
        fs.writeFileSync(DB_FILE, JSON.stringify(newDatabase, null, 2));
        console.log('✓ Banco de dados recriado com sucesso\n');
        return true;
      }
    } catch (error) {
      console.error(`❌ Erro ao ler banco de dados: ${error.message}`);
      console.log('⚠️  Recriando banco de dados...\n');

      const newDatabase = createDatabaseStructure();
      fs.writeFileSync(DB_FILE, JSON.stringify(newDatabase, null, 2));
      console.log('✓ Banco de dados criado com sucesso\n');
      return true;
    }
  } else {
    // 4. Se não existir, criar novo banco
    console.log('⚠️  Arquivo de banco de dados não encontrado');
    console.log('📝 Criando estrutura inicial...\n');

    const newDatabase = createDatabaseStructure();
    fs.writeFileSync(DB_FILE, JSON.stringify(newDatabase, null, 2));

    console.log(`✓ Banco de dados criado: ${DB_FILE}`);
    console.log('✓ Estrutura inicializada com sucesso\n');
    return true;
  }
}

/**
 * Obtém o caminho do arquivo do banco de dados
 */
function getDatabasePath() {
  return DB_FILE;
}

module.exports = {
  initializeDatabase,
  getDatabasePath,
  SCHEMA,
};
