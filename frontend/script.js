// URL base da API
const API_URL = window.location.origin;

// Função para carregar os registros
async function carregarRegistros() {
  try {
    const response = await fetch(`${API_URL}/servicos`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao carregar registros');
    }
    const registros = await response.json();
    atualizarTabela(registros);
  } catch (error) {
    console.error('Erro ao carregar registros:', error);
    alert('Erro ao carregar registros. Por favor, tente novamente.');
  }
}

// Função para atualizar a tabela
function atualizarTabela(registros) {
  const tbody = document.getElementById('corpoTabela');
  tbody.innerHTML = '';

  registros.forEach(registro => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>${registro.id}</td>
            <td>${registro.solicitante}</td>
            <td>${registro.loja}</td>
            <td>${registro.servico}</td>
            <td>${formatarMoeda(registro.orcamento)}</td>
            <td>${registro.infraSpeak}</td>
            <td>${registro.mesServico}/${registro.anoServico}</td>
            <td>${registro.faturamento}</td>
            <td>${registro.situacao}</td>
            <td>${registro.projetoManutencao}</td>
            <td>
                <button class="editar" onclick="editarRegistro(${registro.id})">Editar</button>
                <button class="remover" onclick="removerRegistro(${registro.id})">Remover</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Função para formatar número como moeda (apenas para exibição na tabela)
function formatarMoeda(valor) {
  return `R$ ${parseFloat(valor).toFixed(2)}`;
}

// Função para converter string para número
function converterParaNumero(valor) {
  return parseFloat(valor) || 0;
}

// Adicionar evento para permitir apenas números e ponto no campo orçamento
document.getElementById('orcamento').addEventListener('input', function (e) {
  let valor = e.target.value;
  // Permite apenas números e ponto
  valor = valor.replace(/[^\d.]/g, '');
  // Garante que só tenha um ponto
  const pontos = valor.match(/\./g);
  if (pontos && pontos.length > 1) {
    valor = valor.substring(0, valor.lastIndexOf('.'));
  }
  e.target.value = valor;
});

// Função para adicionar/editar registro
async function adicionarRegistro() {
  const form = document.getElementById('formServico');
  const id = form.dataset.id;

  const dados = {
    solicitante: document.getElementById('solicitante').value,
    loja: document.getElementById('loja').value,
    servico: document.getElementById('servico').value,
    orcamento: converterParaNumero(document.getElementById('orcamento').value),
    infraSpeak: document.getElementById('InfraSpeak').value,
    mesServico: document.getElementById('mesServico').value,
    anoServico: parseInt(document.getElementById('anoServico').value),
    faturamento: document.getElementById('faturamento').value,
    situacao: document.getElementById('situacao').value,
    projetoManutencao: document.getElementById('projetoManutencao').value
  };

  console.log('Enviando dados:', dados);

  try {
    const response = await fetch(`${API_URL}/servicos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(id ? { ...dados, id } : dados)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao salvar registro');
    }

    const result = await response.json();
    console.log('Resposta do servidor:', result);

    form.reset();
    form.dataset.id = '';
    await carregarRegistros();
    alert('Registro salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar registro:', error);
    alert(error.message || 'Erro ao salvar registro. Por favor, tente novamente.');
  }
}

// Função para editar registro
async function editarRegistro(id) {
  try {
    const response = await fetch(`${API_URL}/servicos/${id}`);
    const registro = await response.json();

    const form = document.getElementById('formServico');
    form.dataset.id = id;

    document.getElementById('solicitante').value = registro.solicitante;
    document.getElementById('loja').value = registro.loja;
    document.getElementById('servico').value = registro.servico;
    document.getElementById('orcamento').value = registro.orcamento;
    document.getElementById('InfraSpeak').value = registro.infraSpeak;
    document.getElementById('mesServico').value = registro.mesServico;
    document.getElementById('anoServico').value = registro.anoServico;
    document.getElementById('faturamento').value = registro.faturamento;
    document.getElementById('situacao').value = registro.situacao;
    document.getElementById('projetoManutencao').value = registro.projetoManutencao;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Erro ao carregar registro:', error);
    alert('Erro ao carregar registro. Por favor, tente novamente.');
  }
}

// Função para remover registro
async function removerRegistro(id) {
  if (!confirm('Tem certeza que deseja remover este registro?')) return;

  try {
    const response = await fetch(`${API_URL}/servicos/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Erro ao remover registro');

    carregarRegistros();
    alert('Registro removido com sucesso!');
  } catch (error) {
    console.error('Erro ao remover registro:', error);
    alert('Erro ao remover registro. Por favor, tente novamente.');
  }
}

// Função para filtrar registros
function filtrarRegistros() {
  const solicitante = document.getElementById('filtroSolicitante').value.toLowerCase();
  const mes = document.getElementById('filtroMes').value;
  const ano = document.getElementById('filtroAno').value;
  const situacao = document.getElementById('filtroSituacao').value;
  const faturamento = document.getElementById('filtroFaturamento').value;

  const linhas = document.querySelectorAll('#corpoTabela tr');

  linhas.forEach(linha => {
    const colunas = linha.querySelectorAll('td');
    const matchSolicitante = colunas[1].textContent.toLowerCase().includes(solicitante);
    const matchMes = !mes || colunas[6].textContent.includes(mes);
    const matchAno = !ano || colunas[6].textContent.includes(ano);
    const matchSituacao = !situacao || colunas[8].textContent === situacao;
    const matchFaturamento = !faturamento || colunas[7].textContent === faturamento;

    linha.style.display = matchSolicitante && matchMes && matchAno && matchSituacao && matchFaturamento ? '' : 'none';
  });
}

// Função para limpar filtros
function limparFiltros() {
  document.getElementById('filtroSolicitante').value = '';
  document.getElementById('filtroMes').value = '';
  document.getElementById('filtroAno').value = '';
  document.getElementById('filtroSituacao').value = '';
  document.getElementById('filtroFaturamento').value = '';

  const linhas = document.querySelectorAll('#corpoTabela tr');
  linhas.forEach(linha => linha.style.display = '');
}

// Função para imprimir registros
function imprimirRegistros() {
  const tabela = document.querySelector('table').cloneNode(true);
  const botoes = tabela.querySelectorAll('button');
  botoes.forEach(botao => botao.remove());

  const data = new Date().toLocaleDateString('pt-BR');
  const hora = new Date().toLocaleTimeString('pt-BR');

  const janela = window.open('', '_blank');
  janela.document.write(`
    <html>
      <head>
        <title>Registros de Serviços</title>
        <style>
          @media print {
            @page {
              size: landscape;
              margin: 1cm;
            }
          }
          body { font-family: Arial, sans-serif; }
          .header { 
            text-align: left;
            margin-bottom: 20px;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
          }
          .data-hora {
            font-size: 12px;
            color: #666;
          }
          table { 
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th { 
            background-color: #f0f0f0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="data-hora">${data}, ${hora}</div>
          <h2>Registros de Serviços</h2>
        </div>
        ${tabela.outerHTML}
      </body>
    </html>
  `);
  janela.document.close();
  janela.print();
}

// Função para exportar registros
function exportarRegistros() {
  const linhas = document.querySelectorAll('#corpoTabela tr');
  let csv = 'ID;Solicitante;Loja;Serviço;Orçamento;InfraSpeak;Mês;Faturamento;Situação;Tipo\n';

  linhas.forEach(linha => {
    if (linha.style.display !== 'none') {
      const colunas = linha.querySelectorAll('td');
      const valores = Array.from(colunas).slice(0, -1).map(col => {
        let valor = col.textContent.trim();
        // Remove o símbolo R$ e formata o número para o Excel
        if (col === colunas[4]) { // Coluna do orçamento
          valor = valor.replace('R$', '').trim();
        }
        // Escapa aspas duplas e envolve o valor em aspas se contiver ponto-e-vírgula
        if (valor.includes(';')) {
          valor = `"${valor.replace(/"/g, '""')}"`;
        }
        return valor;
      });
      csv += valores.join(';') + '\n';
    }
  });

  // Usar BOM para Excel reconhecer caracteres especiais
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'registros_servicos.csv';
  link.click();
}

// Carregar registros quando a página carregar
document.addEventListener('DOMContentLoaded', carregarRegistros);
