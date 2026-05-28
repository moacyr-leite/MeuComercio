import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://usuario:senha@localhost:5432/meucomercio")

# Cria a engine do SQLAlchemy para o PostgreSQL
engine = create_engine(DATABASE_URL)

# Cria a classe SessionLocal, que será usada para instanciar as sessões do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para a criação dos modelos
Base = declarative_base()

# Dependência do FastAPI para injetar a sessão do banco de dados nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
