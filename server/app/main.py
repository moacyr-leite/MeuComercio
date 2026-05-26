from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "API FastAPI rodando"}

@app.get("/produtos")
def listar_produtos():
    return [
        {"id": 1, "nome": "Mouse", "preco": 50},
        {"id": 2, "nome": "Teclado", "preco": 120},
    ]