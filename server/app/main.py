from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app import models

# Cria as tabelas no banco de dados
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuração de CORS para permitir que o frontend (Vite/React) faça requisições para o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Portas padrão do Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API FastAPI rodando"}

@app.get("/produtos")
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(models.Produto).all()
    # Se o banco estiver vazio, retorna os dados mockados temporariamente
    if not produtos:
        return [
            {"id": 1, "nome": "Mouse", "preco": 50},
            {"id": 2, "nome": "Teclado", "preco": 120},
        ]
    return produtos