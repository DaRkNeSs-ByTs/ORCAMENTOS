// URL base da API
const API_URL = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  } else {
    return 'https://orcamentos-ochre.vercel.app/api';
  }
})();

console.log('API URL configurada:', API_URL);

let cacheRegistros = null;
let ultimaAtualizacao = null;
const TEMPO_CACHE = 5 * 60 * 1000; // 5 minutos
let paginaAtual = 1;
const registrosPorPagina = 10;

// Função para carregar os registros
async function carregarRegistros(pagina = 1) {
  const agora = Date.now();

  // Verifica se há cache válido para a página atual
  if (cacheRegistros?.[pagina] && ultimaAtualizacao && (agora - ultimaAtualizacao) < TEMPO_CACHE) {
    console.log('Usando cache de registros da página', pagina);
    atualizarTabela(cacheRegistros[pagina].data);
    atualizarPaginacao(cacheRegistros[pagina].pagination);
    return;
  }

  console.log('Iniciando carregamento de registros...');
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) loadingIndicator.style.display = 'block';

  try {
    const url = `${API_URL}/servicos?page=${pagina}&limit=${registrosPorPagina}`;
    console.log('Fazendo requisição para:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta de erro:', errorText);
      let errorMessage = `Erro HTTP! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Erro ao parsear resposta de erro:', e);
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    console.log('Content-Type recebido:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      console.error('Tipo de conteúdo inesperado:', contentType);
      const responseText = await response.text();
      console.error('Conteúdo da resposta:', responseText);
      throw new Error('Resposta não está em formato JSON');
    }

    const data = await response.json();
    console.log('Dados recebidos:', data);

    if (!data || !Array.isArray(data.data)) {
      console.error('Formato de dados inválido:', data);
      throw new Error('Formato de dados inválido');
    }

    // Atualiza o cache
    cacheRegistros = { ...cacheRegistros, [pagina]: data };
    ultimaAtualizacao = agora;

    atualizarTabela(data.data);
    atualizarPaginacao(data.pagination);
  } catch (error) {
    console.error('Erro ao carregar registros:', error);
    alert(`Erro ao carregar registros: ${error.message}`);
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
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
  console.log('Iniciando adição de registro...');
  const form = document.getElementById('formServico');
  const id = form.dataset.id;

  // Validações dos campos obrigatórios
  const camposObrigatorios = ['solicitante', 'loja', 'servico', 'orcamento', 'mesServico', 'anoServico'];
  for (const campo of camposObrigatorios) {
    const valor = document.getElementById(campo).value;
    if (!valor || valor.trim() === '') {
      alert(`Por favor, preencha o campo ${campo}`);
      return;
    }
  }

  // Validar o ano
  const anoServico = parseInt(document.getElementById('anoServico').value);
  if (!anoServico || anoServico < 2000 || anoServico > 2100) {
    alert('Por favor, preencha um ano válido entre 2000 e 2100');
    return;
  }

  // Validar o orçamento
  const orcamento = converterParaNumero(document.getElementById('orcamento').value);
  if (isNaN(orcamento) || orcamento <= 0) {
    alert('Por favor, insira um valor válido para o orçamento');
    return;
  }

  const dados = {
    solicitante: document.getElementById('solicitante').value.trim(),
    loja: document.getElementById('loja').value.trim(),
    servico: document.getElementById('servico').value.trim(),
    orcamento: orcamento,
    infraSpeak: document.getElementById('InfraSpeak').value.trim(),
    mesServico: document.getElementById('mesServico').value.trim(),
    anoServico: anoServico,
    faturamento: document.getElementById('faturamento').value.trim(),
    situacao: document.getElementById('situacao').value.trim(),
    projetoManutencao: document.getElementById('projetoManutencao').value.trim()
  };

  console.log('Dados a serem enviados:', dados);

  try {
    const response = await fetch(`${API_URL}/servicos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(id ? { ...dados, id } : dados)
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      console.error('Erro na resposta:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Resposta de erro completa:', errorData);

      try {
        const error = contentType?.includes('application/json') ?
          JSON.parse(errorData) :
          { message: `Erro ${response.status}: ${response.statusText}` };
        throw new Error(error.message || 'Erro ao salvar registro');
      } catch (parseError) {
        console.error('Erro ao parsear resposta:', parseError);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    }

    if (!contentType?.includes('application/json')) {
      throw new Error('Resposta do servidor não está em formato JSON');
    }

    const result = await response.json();
    console.log('Resposta do servidor:', result);

    form.reset();
    form.dataset.id = '';
    await carregarRegistros();
    alert('Registro salvo com sucesso!');
  } catch (error) {
    console.error('Erro detalhado:', error);
    alert(`Erro ao salvar registro: ${error.message}`);
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
  if (!confirm('Tem certeza que deseja remover este registro?')) {
    return;
  }

  if (!id || typeof id !== 'number') {
    console.error('ID inválido para remoção:', id);
    alert('ID inválido para remoção do registro.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/servicos/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover registro');
      } else {
        throw new Error(`Erro ao remover registro: ${response.status} ${response.statusText}`);
      }
    }

    await carregarRegistros();
    alert('Registro removido com sucesso!');
  } catch (error) {
    console.error('Erro ao remover registro:', error);
    alert(`Erro ao remover registro: ${error.message}`);
  }
}

// Função para filtrar registros
function filtrarRegistros() {
  try {
    const solicitante = document.getElementById('filtroSolicitante')?.value?.toLowerCase().trim() ?? '';
    const mes = document.getElementById('filtroMes')?.value?.trim() ?? '';
    const ano = document.getElementById('filtroAno')?.value?.trim() ?? '';
    const situacao = document.getElementById('filtroSituacao')?.value?.trim() ?? '';
    const faturamento = document.getElementById('filtroFaturamento')?.value?.trim() ?? '';

    const linhas = document.querySelectorAll('#corpoTabela tr');
    if (!linhas.length) {
      console.warn('Nenhuma linha encontrada para filtrar');
      return;
    }

    linhas.forEach(linha => {
      try {
        const colunas = linha.querySelectorAll('td');
        if (colunas.length < 9) {
          console.warn('Linha com número incorreto de colunas:', linha);
          return;
        }

        const matchSolicitante = !solicitante || (colunas[1]?.textContent?.toLowerCase()?.includes(solicitante) ?? false);
        const matchMes = !mes || (colunas[6]?.textContent?.includes(mes) ?? false);
        const matchAno = !ano || (colunas[6]?.textContent?.includes(ano) ?? false);
        const matchSituacao = !situacao || (colunas[8]?.textContent === situacao);
        const matchFaturamento = !faturamento || (colunas[7]?.textContent === faturamento);

        linha.style.display = matchSolicitante && matchMes && matchAno && matchSituacao && matchFaturamento ? '' : 'none';
      } catch (error) {
        console.error('Erro ao filtrar linha específica:', error);
      }
    });
  } catch (error) {
    console.error('Erro ao aplicar filtros:', error);
    alert('Ocorreu um erro ao aplicar os filtros. Por favor, tente novamente.');
  }
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
  try {
    const linhas = document.querySelectorAll('#corpoTabela tr');
    if (!linhas.length) {
      alert('Não há registros para exportar.');
      return;
    }

    const headers = [
      'ID', 'Solicitante', 'Loja', 'Serviço', 'Orçamento',
      'InfraSpeak', 'Mês', 'Faturamento', 'Situação', 'Tipo'
    ];

    let csv = headers.join(';') + '\n';

    linhas.forEach(linha => {
      if (linha.style.display !== 'none') {
        const colunas = linha.querySelectorAll('td');
        if (colunas.length < headers.length) {
          console.warn('Linha com número incorreto de colunas:', linha);
          return;
        }

        const valores = Array.from(colunas).slice(0, -1).map(col => {
          let valor = col.textContent?.trim() ?? '';

          // Remove o símbolo R$ e formata o número para o Excel
          if (valor.includes('R$')) {
            valor = valor.replace('R$', '').trim();
            // Converte para formato numérico do Excel (usando ponto como separador decimal)
            valor = valor.replace(/\./g, '').replace(',', '.');
          }

          // Escapa aspas duplas e envolve o valor em aspas se contiver caracteres especiais
          if (valor.includes(';') || valor.includes('"') || valor.includes('\n')) {
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
    const dataAtual = new Date().toISOString().slice(0, 10);
    const nomeArquivo = `registros_servicos_${dataAtual}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Erro ao exportar registros:', error);
    alert('Ocorreu um erro ao exportar os registros. Por favor, tente novamente.');
  }
}

function atualizarPaginacao(paginacao) {
  const paginacaoContainer = document.getElementById('paginacao');
  if (!paginacaoContainer) return;

  let html = '';

  // Botão anterior
  html += `<button onclick="mudarPagina(${paginacao.page - 1})" ${paginacao.page === 1 ? 'disabled' : ''}>Anterior</button>`;

  // Números das páginas
  for (let i = 1; i <= paginacao.totalPages; i++) {
    html += `<button onclick="mudarPagina(${i})" ${i === paginacao.page ? 'class="active"' : ''}>${i}</button>`;
  }

  // Botão próximo
  html += `<button onclick="mudarPagina(${paginacao.page + 1})" ${paginacao.page === paginacao.totalPages ? 'disabled' : ''}>Próximo</button>`;

  paginacaoContainer.innerHTML = html;
}

function mudarPagina(novaPagina) {
  if (novaPagina < 1 || novaPagina > paginacao.totalPages) return;
  paginaAtual = novaPagina;
  carregarRegistros(novaPagina);
}

// Carregar registros quando a página carregar
document.addEventListener('DOMContentLoaded', carregarRegistros);
