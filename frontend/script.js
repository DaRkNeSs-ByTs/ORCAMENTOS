// Configuração do Supabase
const supabaseUrl = 'https://dgtqgycqwtnfovdrndnx.supabase.co';  // Substitua com a URL do seu projeto Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndHFneWNxd3RuZm92ZHJuZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDg2NDMsImV4cCI6MjA1OTM4NDY0M30.QwvJXzh-KOeR7HYy2nQqaUWpl8cOqYEBtWDaBbvs4og';  // Substitua com a chave da API do seu projeto Supabase
// Inicializando o Supabase
const supabase = createClient(supabaseUrl, supabaseKey); // Inicializa o cliente Supabase

// Variáveis globais
let idContador = 1;
let registros = [];
let registrosFiltrados = []; // Para armazenar os registros filtrados

// Função para adicionar ou editar um registro
async function adicionarRegistro() {
  const form = document.getElementById("formServico");
  const id = form.getAttribute("data-id");

  // Obter valores do formulário
  const solicitante = document.getElementById("solicitante").value.trim();
  const loja = document.getElementById("loja").value.trim();
  const servico = document.getElementById("servico").value.trim();
  const orcamentoInput = document.getElementById("orcamento").value;
  const orcamento = parseFloat(orcamentoInput.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  const infraSpeak = document.getElementById("InfraSpeak").value.trim();
  const mesServico = document.getElementById("mesServico").value;
  const anoServico = document.getElementById("anoServico").value.trim();  // Campo de ano
  const faturamento = document.getElementById("faturamento").value;
  const situacao = document.getElementById("situacao").value;
  const projetoManutencao = document.getElementById("projetoManutencao").value;

  // Validação
  if (
    !solicitante ||
    !loja ||
    !servico ||
    isNaN(orcamento) ||
    orcamento < 0 ||
    !infraSpeak ||
    !mesServico ||
    !anoServico ||
    isNaN(anoServico) ||
    anoServico < 2000 ||
    anoServico > 2100 ||
    !faturamento ||
    !situacao ||
    !projetoManutencao
  ) {
    alert(
      "Por favor, preencha todos os campos obrigatórios corretamente, incluindo o Ano."
    );
    return;
  }

  const novoRegistro = {
    solicitante,
    loja,
    servico,
    orcamento,
    infraSpeak,
    mesServico,
    anoServico,  // Incluindo o anoServico
    faturamento,
    situacao,
    projetoManutencao,
  };

  try {
    let response;
    if (id) {
      // Atualizar um registro existente
      response = await supabase
        .from('servicos')
        .update(novoRegistro)
        .eq('id', id);

      if (response.error) throw response.error;

      alert("Registro atualizado com sucesso!");
    } else {
      // Adicionar um novo registro
      response = await supabase
        .from('servicos')
        .insert([novoRegistro]);

      if (response.error) throw response.error;

      alert("Registro adicionado com sucesso!");
    }

    form.reset();
    form.setAttribute("data-id", "");
    atualizarTabela();
    filtrarRegistros();

  } catch (err) {
    console.error("Erro ao salvar o serviço:", err.message || err);
    alert(`Erro ao salvar o serviço: ${err.message || err}`);
  }
}

// Função para atualizar a tabela principal
async function atualizarTabela(filtrados = registros) {
  registrosFiltrados = filtrados;
  const tbody = document.getElementById("corpoTabela");
  tbody.innerHTML = "";

  try {
    // Pegar os dados do Supabase
    const { data, error } = await supabase
      .from('servicos')
      .select('*');

    if (error) throw error;

    // Atualizar a tabela com os dados
    data.forEach((registro) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${registro.id}</td>
        <td>${registro.solicitante}</td>
        <td>${registro.loja}</td>
        <td>${registro.servico}</td>
        <td>${formatarValorMonetario(registro.orcamento)}</td>
        <td>${registro.infraSpeak}</td>
        <td>${registro.mesServico} de ${registro.anoServico}</td>
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
  } catch (err) {
    console.error("Erro ao carregar os serviços:", err);
    alert("Erro ao carregar os serviços.");
  }
}

// Função para formatar valores monetários
function formatarValorMonetario(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Função para filtrar registros
function filtrarRegistros() {
  const filtroSolicitante = document
    .getElementById("filtroSolicitante")
    .value.trim()
    .toLowerCase();
  const filtroMes = document.getElementById("filtroMes").value;
  const filtroAno = document.getElementById("filtroAno").value.trim();
  const filtroSituacao = document.getElementById("filtroSituacao").value;
  const filtroFaturamento = document.getElementById("filtroFaturamento").value;

  const filtrados = registros.filter((registro) => {
    return (
      (filtroSolicitante === "" ||
        registro.solicitante.toLowerCase().includes(filtroSolicitante)) &&
      (filtroMes === "" || registro.mesServico === filtroMes) &&
      (filtroAno === "" || registro.anoServico === filtroAno) &&
      (filtroSituacao === "" || registro.situacao === filtroSituacao) &&
      (filtroFaturamento === "" || registro.faturamento === filtroFaturamento)
    );
  });

  atualizarTabela(filtrados);
}

// Função para limpar filtros
function limparFiltros() {
  document.getElementById("filtroSolicitante").value = "";
  document.getElementById("filtroMes").value = "";
  document.getElementById("filtroAno").value = "";
  document.getElementById("filtroSituacao").value = "";
  document.getElementById("filtroFaturamento").value = "";
  atualizarTabela();
}

// Função para editar um registro
async function editarRegistro(id) {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const form = document.getElementById("formServico");
    form.setAttribute("data-id", data.id);
    document.getElementById("solicitante").value = data.solicitante;
    document.getElementById("loja").value = data.loja;
    document.getElementById("servico").value = data.servico;
    document.getElementById("orcamento").value = formatarValorMonetario(data.orcamento);
    document.getElementById("InfraSpeak").value = data.infraSpeak;
    document.getElementById("mesServico").value = data.mesServico;
    document.getElementById("anoServico").value = data.anoServico;
    document.getElementById("faturamento").value = data.faturamento;
    document.getElementById("situacao").value = data.situacao;
    document.getElementById("projetoManutencao").value = data.projetoManutencao;
  } catch (err) {
    console.error("Erro ao carregar o registro para edição:", err);
    alert("Erro ao carregar o registro para edição.");
  }
}

// Função para remover um registro
async function removerRegistro(id) {
  if (confirm("Tem certeza que deseja remover este registro?")) {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert("Registro removido com sucesso!");
      atualizarTabela();
    } catch (err) {
      console.error("Erro ao remover o registro:", err);
      alert("Erro ao remover o registro.");
    }
  }
}
