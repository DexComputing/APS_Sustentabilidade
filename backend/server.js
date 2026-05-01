const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ========== ENDPOINTS DO WEB SERVICE ==========

// 1. Listar todos os setores
app.get('/api/setores', (req, res) => {
  db.all(`SELECT * FROM setores`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 2. Listar itens do checklist por setor
app.get('/api/itens/:setor_id', (req, res) => {
  const setor_id = req.params.setor_id;
  
  db.all(`
    SELECT i.*, 
           (SELECT conforme FROM inspecoes 
            WHERE item_id = i.id 
            ORDER BY data_inspecao DESC LIMIT 1) as ultimo_status,
           (SELECT data_inspecao FROM inspecoes 
            WHERE item_id = i.id 
            ORDER BY data_inspecao DESC LIMIT 1) as ultima_inspecao
    FROM itens_checklist i
    WHERE i.setor_id = ?
  `, [setor_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 3. Registrar uma inspeção (conforme/não conforme)
app.post('/api/inspecao', (req, res) => {
  const { item_id, conforme, observacao } = req.body;
  
  if (!item_id || conforme === undefined) {
    res.status(400).json({ error: 'item_id e conforme são obrigatórios' });
    return;
  }
  
  db.run(`
    INSERT INTO inspecoes (item_id, conforme, observacao, data_inspecao)
    VALUES (?, ?, ?, datetime('now'))
  `, [item_id, conforme, observacao || ''], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      id: this.lastID, 
      message: 'Inspeção registrada com sucesso' 
    });
  });
});

// 4. Relatório de não conformidades (últimas inspeções com status = 0)
app.get('/api/relatorio/nc', (req, res) => {
  db.all(`
    SELECT i.descricao as item, 
           s.nome as setor,
           ins.data_inspecao,
           ins.observacao
    FROM inspecoes ins
    JOIN itens_checklist i ON ins.item_id = i.id
    JOIN setores s ON i.setor_id = s.id
    WHERE ins.conforme = 0
    ORDER BY ins.data_inspecao DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 5. Estatísticas de conformidade por setor
app.get('/api/relatorio/estatisticas', (req, res) => {
  db.all(`
    SELECT s.nome as setor,
           COUNT(CASE WHEN ins.conforme = 1 THEN 1 END) as conformes,
           COUNT(CASE WHEN ins.conforme = 0 THEN 1 END) as nao_conformes
    FROM setores s
    LEFT JOIN itens_checklist i ON s.id = i.setor_id
    LEFT JOIN inspecoes ins ON i.id = ins.item_id
    GROUP BY s.id
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Web Service rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET  /api/setores`);
  console.log(`   GET  /api/itens/:setor_id`);
  console.log(`   POST /api/inspecao`);
  console.log(`   GET  /api/relatorio/nc`);
  console.log(`   GET  /api/relatorio/estatisticas`);
});

// 6. Relatório de itens em conformidade (últimas inspeções com status = 1)
app.get('/api/relatorio/conformes', (req, res) => {
  db.all(`
    SELECT i.descricao as item, 
           s.nome as setor,
           ins.data_inspecao,
           ins.observacao
    FROM inspecoes ins
    JOIN itens_checklist i ON ins.item_id = i.id
    JOIN setores s ON i.setor_id = s.id
    WHERE ins.conforme = 1
    ORDER BY s.nome, ins.data_inspecao DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});