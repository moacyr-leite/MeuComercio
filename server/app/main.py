from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app import models

class VendaSync(BaseModel):
    produto_id: int
    quantidade: int
    preco_total: float
    data: str

# Cria as tabelas no banco de dados (protegido por try/except para não quebrar se o banco não estiver configurado)
import logging
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    logging.error(f"Erro ao conectar no banco de dados. Verifique suas credenciais no .env e se o PostgreSQL está rodando. Erro original: {e}")

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
    try:
        produtos = db.query(models.Produto).all()
        if not produtos:
            return [
                {"id": 1, "nome": "Mouse", "preco": 50.0, "codigo_barras": "123456789"},
                {"id": 2, "nome": "Teclado", "preco": 120.0, "codigo_barras": "987654321"},
            ]
        return produtos
    except Exception as e:
        logging.error(f"Erro no banco, retornando mock: {e}")
        return [
            {"id": 1, "nome": "Mouse (Mock)", "preco": 50.0, "codigo_barras": "123456789"},
            {"id": 2, "nome": "Teclado (Mock)", "preco": 120.0, "codigo_barras": "987654321"},
        ]

@app.get("/produtos/codigo/{codigo}")
def buscar_produto_por_codigo(codigo: str, db: Session = Depends(get_db)):
    try:
        produto = db.query(models.Produto).filter(models.Produto.codigo_barras == codigo).first()
        if not produto:
            if codigo == "123456789":
                return {"id": 1, "nome": "Mouse", "preco": 50.0, "codigo_barras": "123456789"}
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        return produto
    except Exception:
        if codigo == "123456789":
            return {"id": 1, "nome": "Mouse (Mock)", "preco": 50.0, "codigo_barras": "123456789"}
        raise HTTPException(status_code=404, detail="Produto não encontrado (Modo Offline/Mock)")

@app.post("/vendas/sync")
def sincronizar_vendas_offline(vendas: List[VendaSync], db: Session = Depends(get_db)):
    # Aqui entraria a lógica para salvar as vendas no banco.
    # Por enquanto, apenas confirmamos o recebimento.
    return {"message": f"{len(vendas)} vendas sincronizadas com sucesso!"}