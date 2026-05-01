const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'iso14000.db');

// Remove o banco antigo para recriar com os novos dados
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Banco de dados antigo removido.');
}

const db = new sqlite3.Database(dbPath);

// Criar tabelas e inserir dados
db.serialize(() => {
    // Tabela de setores
    db.run(`
        CREATE TABLE setores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL
        )
    `);

    // Tabela de itens do checklist
    db.run(`
        CREATE TABLE itens_checklist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setor_id INTEGER,
            descricao TEXT NOT NULL,
            FOREIGN KEY (setor_id) REFERENCES setores (id)
        )
    `);

    // Tabela de inspeções
    db.run(`
        CREATE TABLE inspecoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            conforme INTEGER,
            data_inspecao TEXT DEFAULT CURRENT_DATE,
            observacao TEXT,
            FOREIGN KEY (item_id) REFERENCES itens_checklist (id)
        )
    `);

    // ========== INSERIR SETORES ==========
    const setores = ['Produção', 'Logística', 'Administração', 'Tecnologia'];
    
    setores.forEach((setor, index) => {
        const id = index + 1;
        db.run(`INSERT INTO setores (id, nome) VALUES (?, ?)`, [id, setor]);
    });

    // ========== ITENS PARA PRODUÇÃO (setor_id = 1) ==========
    const itensProducao = [
        'Resíduos perigosos são armazenados corretamente',
        'Emissões atmosféricas estão dentro dos limites legais',
        'Equipamentos de contenção de vazamentos estão disponíveis',
        'Efluentes líquidos são tratados antes do descarte',
        'Matérias-primas são de fontes sustentáveis',
        'Ruídos industriais estão dentro dos limites permitidos',
        'Consumo de energia elétrica é monitorado mensalmente',
        'Funcionários usam EPIs adequados para proteção ambiental'
    ];
    
    itensProducao.forEach(item => {
        db.run(`INSERT INTO itens_checklist (setor_id, descricao) VALUES (1, ?)`, [item]);
    });

    // ========== ITENS PARA LOGÍSTICA (setor_id = 2) ==========
    const itensLogistica = [
        'Veículos possuem manutenção em dia',
        'Consumo de combustível é monitorado',
        'Rotas são otimizadas para redução de emissões',
        'Cargas são otimizadas para reduzir viagens',
        'Pneus são descartados corretamente',
        'Óleo lubrificante usado é armazenado e descartado corretamente',
        'Motoristas são treinados em direção econômica',
        'Veículos atendem às normas de emissão vigentes'
    ];
    
    itensLogistica.forEach(item => {
        db.run(`INSERT INTO itens_checklist (setor_id, descricao) VALUES (2, ?)`, [item]);
    });

    // ========== ITENS PARA ADMINISTRAÇÃO (setor_id = 3) ==========
    const itensAdministracao = [
        'Coleta seletiva implementada',
        'Funcionários treinados em práticas ambientais',
        'Iluminação com lâmpadas de baixo consumo',
        'Ar condicionado com manutenção preventiva',
        'Uso consciente de papel e impressões',
        'Copos descartáveis substituídos por materiais reutilizáveis',
        'Produtos de limpeza são biodegradáveis',
        'Campanhas de conscientização ambiental são realizadas'
    ];
    
    itensAdministracao.forEach(item => {
        db.run(`INSERT INTO itens_checklist (setor_id, descricao) VALUES (3, ?)`, [item]);
    });

    // ========== ITENS PARA TECNOLOGIA (setor_id = 4) ==========
    const itensTecnologia = [
        'Equipamentos eletrônicos possuem certificação de eficiência energética',
        'Lixo eletrônico é descartado em empresas especializadas',
        'Servidores utilizam virtualização para reduzir consumo',
        'Monitores são desligados ao final do expediente',
        'Impressoras estão configuradas para impressão frente e verso',
        'Nuvem computacional é utilizada para reduzir hardware físico',
        'Equipamentos obsoletos são doados ou reciclados',
        'Política de TI Verde é divulgada e seguida pela equipe'
    ];
    
    itensTecnologia.forEach(item => {
        db.run(`INSERT INTO itens_checklist (setor_id, descricao) VALUES (4, ?)`, [item]);
    });

    console.log('✅ Banco de dados criado com sucesso!');
    console.log(`📊 Setores: 4`);
    console.log(`📋 Itens totais: ${itensProducao.length + itensLogistica.length + itensAdministracao.length + itensTecnologia.length}`);
});

module.exports = db;