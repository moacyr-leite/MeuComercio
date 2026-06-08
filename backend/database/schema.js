

export const SCHEMA = {
    usuarios: {
        name: 'usuarios',
        fields: {
            id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
            nome: { type: 'TEXT', required: true },
            email: { type: 'TEXT' },
            criado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
            atualizado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
        },
    },

    clientes: {
        name: 'clientes',
        fields: {
            id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
            nome: { type: 'TEXT', required: true },
            telefone: { type: 'TEXT' },
            email: { type: 'TEXT' },
            observacao: { type: 'TEXT' },
            criado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
            atualizado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
        },
    },

    processos: {
        name: 'processos',
        fields: {
            id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
            cliente_id: { type: 'INTEGER', required: true, foreignKey: 'clientes(id)' },
            titulo: { type: 'TEXT', required: true },
            descricao: { type: 'TEXT' },
            status: { type: 'TEXT', default: 'pendente' },
            prioridade: { type: 'TEXT', default: 'media' },
            data_inicio: { type: 'TEXT' },
            data_fim: { type: 'TEXT' },
            observacoes: { type: 'TEXT' },
            criado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
            atualizado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
        },
    },

    produtos: {
        name: 'produtos',
        fields: {
            id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
            codigo_barra: { type: 'TEXT', unique: true },
            nome: { type: 'TEXT', required: true },
            descricao: { type: 'TEXT' },
            preco_compra: { type: 'REAL', required: true },
            preco_venda: { type: 'REAL', required: true },
            estoque: { type: 'INTEGER', default: 0 },
            criado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
            data_ultimo_comprado: { type: 'TEXT' },
            atualizado_em: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
        },
    },
};
