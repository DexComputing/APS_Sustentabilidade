// Configuração da API
const API_URL = 'http://localhost:3000';

// Quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, iniciando...');
    carregarSetores();
    carregarRelatorioNC();
    carregarConformidades();
    carregarEstatisticas();
});

// Função para carregar os setores
async function carregarSetores() {
    console.log('Tentando carregar setores da API...');
    
    try {
        const resposta = await fetch(`${API_URL}/api/setores`);
        console.log('Resposta recebida:', resposta.status);
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        const setores = await resposta.json();
        console.log('Setores carregados:', setores);
        
        const select = document.getElementById('setor-select');
        if (!select) {
            console.error('Elemento setor-select não encontrado!');
            return;
        }
        
        select.innerHTML = '<option value="">Selecione um setor</option>';
        
        setores.forEach(setor => {
            const option = document.createElement('option');
            option.value = setor.id;
            option.textContent = setor.nome;
            select.appendChild(option);
        });
        
    } catch (erro) {
        console.error('Erro detalhado ao carregar setores:', erro);
        const select = document.getElementById('setor-select');
        if (select) {
            select.innerHTML = '<option value="">Erro ao carregar setores - Verifique se o backend está rodando</option>';
        }
        alert(`Erro ao conectar com o backend: ${erro.message}\n\nCertifique-se que:\n1. O backend está rodando (node server.js)\n2. A porta 3000 está disponível`);
    }
}

// Função para carregar checklist
async function carregarChecklist() {
    const setorId = document.getElementById('setor-select').value;
    
    if (!setorId) {
        document.getElementById('checklist-items').innerHTML = '<p>Selecione um setor para visualizar o checklist.</p>';
        return;
    }
    
    try {
        const resposta = await fetch(`${API_URL}/api/itens/${setorId}`);
        const itens = await resposta.json();
        
        const container = document.getElementById('checklist-items');
        
        if (itens.length === 0) {
            container.innerHTML = '<p>Nenhum item cadastrado para este setor.</p>';
            return;
        }
        
        container.innerHTML = '';
        
        itens.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.innerHTML = `
                <div class="item-descricao">
                    <strong>${item.descricao}</strong>
                    <textarea id="obs-${item.id}" class="observacao-input" placeholder="Observação (opcional)" rows="2"></textarea>
                </div>
                <div class="item-acoes">
                    <button class="btn-conforme" onclick="registrarInspecao(${item.id}, 1)">✅ Conforme</button>
                    <button class="btn-nao-conforme" onclick="registrarInspecao(${item.id}, 0)">❌ Não Conforme</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (erro) {
        console.error('Erro ao carregar checklist:', erro);
        document.getElementById('checklist-items').innerHTML = '<p>Erro ao carregar itens.</p>';
    }
}

// Função para registrar inspeção
async function registrarInspecao(itemId, conforme) {
    const observacao = document.getElementById(`obs-${itemId}`)?.value || '';
    
    try {
        const resposta = await fetch(`${API_URL}/api/inspecao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item_id: itemId,
                conforme: conforme,
                observacao: observacao
            })
        });
        
        if (resposta.ok) {
            alert(`Inspeção registrada! Status: ${conforme === 1 ? 'CONFORME' : 'NÃO CONFORME'}`);
            carregarChecklist();
            carregarRelatorioNC();
            carregarConformidades();
            carregarEstatisticas();
        }
    } catch (erro) {
        console.error('Erro ao registrar:', erro);
        alert('Erro ao registrar inspeção');
    }
}

// Função para carregar relatório de não conformidades
async function carregarRelatorioNC() {
    try {
        const resposta = await fetch(`${API_URL}/api/relatorio/nc`);
        const itens = await resposta.json();
        
        const container = document.getElementById('relatorio-nc');
        
        if (itens.length === 0) {
            container.innerHTML = '<div class="relatorio-item">✅ Nenhuma não conformidade registrada!</div>';
            return;
        }
        
        container.innerHTML = '';
        itens.forEach(item => {
            const div = document.createElement('div');
            div.className = 'relatorio-item';
            div.innerHTML = `
                <strong>Setor:</strong> ${item.setor}<br>
                <strong>Item:</strong> ${item.item}<br>
                <strong>Data:</strong> ${new Date(item.data_inspecao).toLocaleDateString('pt-BR')}
            `;
            container.appendChild(div);
        });
    } catch (erro) {
        console.error('Erro:', erro);
    }
}

// Função para carregar itens em conformidade
async function carregarConformidades() {
    try {
        const resposta = await fetch(`${API_URL}/api/relatorio/conformes`);
        const itens = await resposta.json();
        
        const container = document.getElementById('conformidades-list');
        
        if (itens.length === 0) {
            container.innerHTML = '<div class="relatorio-item">⚠️ Nenhum item em conformidade registrado ainda.</div>';
            return;
        }
        
        container.innerHTML = '';
        itens.forEach(item => {
            const div = document.createElement('div');
            div.className = 'relatorio-item';
            div.style.borderLeftColor = '#27ae60';
            div.innerHTML = `
                <strong>Setor:</strong> ${item.setor}<br>
                <strong>Item:</strong> ${item.item}<br>
                <strong>Data:</strong> ${new Date(item.data_inspecao).toLocaleDateString('pt-BR')}
            `;
            container.appendChild(div);
        });
    } catch (erro) {
        console.error('Erro:', erro);
    }
}

// Função para carregar estatísticas
async function carregarEstatisticas() {
    try {
        const resposta = await fetch(`${API_URL}/api/relatorio/estatisticas`);
        const stats = await resposta.json();
        
        const container = document.getElementById('estatisticas');
        
        container.innerHTML = '';
        stats.forEach(stat => {
            const total = (stat.conformes || 0) + (stat.nao_conformes || 0);
            const percentual = total > 0 ? ((stat.conformes || 0) / total * 100).toFixed(1) : 0;
            
            const div = document.createElement('div');
            div.className = 'estatistica-item';
            div.innerHTML = `
                <div class="estatistica-nome">${stat.setor}</div>
                <div class="estatistica-numeros">
                    <span class="conforme-count">✅ ${stat.conformes || 0} conformes</span> | 
                    <span class="nao-conforme-count">❌ ${stat.nao_conformes || 0} não conformes</span>
                    <span style="margin-left: 10px;">📊 ${percentual}% conformidade</span>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (erro) {
        console.error('Erro:', erro);
    }
}

// Função para trocar abas
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'relatorio') carregarRelatorioNC();
    else if (tabName === 'conformidades') carregarConformidades();
    else if (tabName === 'estatisticas') carregarEstatisticas();
}