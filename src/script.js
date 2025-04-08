const supabase = window.supabase.createClient(
  "https://dgtqgycqwtnfovdrndnx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndHFneWNxd3RuZm92ZHJuZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDg2NDMsImV4cCI6MjA1OTM4NDY0M30.QwvJXzh-KOeR7HYy2nQqaUWpl8cOqYEBtWDaBbvs4og"
);

let idContador = 1;
let registros = [];
let registrosFiltrados = [];

function adicionarRegistro() {
  const form = document.getElementById("formServico");
  const id = form.getAttribute("data-id");

  const solicitante = document.getElementById("solicitante").value.trim();
  const loja = document.getElementById("loja").value.trim();
  const servico = document.getElementById("servico").value.trim();
  const orcamentoInput = document.getElementById("orcamento").value;
  const orcamento = parseFloat(orcamentoInput.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  const infraSpeak = document.getElementById("InfraSpeak").value.trim();
  const mesServico = document.getElementById("mesServico").value;
  const anoServico = document.getElementById("anoServico").value.trim();
  const faturamento = document.getElementById("faturamento").value;
  const situacao = document.getElementById("situacao").value;
  const projetoManutencao = document.getElementById("projetoManutencao").value;

  if (!solicitante || !loja || !servico || isNaN(orcamento) || orcamento < 0 || !infraSpeak || !mesServico || !anoServico || isNaN(anoServico) || anoServico < 2000 || anoServico > 2100 || !faturamento || !situacao || !projetoManutencao) {
    alert("Por favor, preencha todos os campos obrigatórios corretamente.");
    return;
  }

  const novoRegistro = {
    id: id ? parseInt(id) : idContador++,
    solicitante,
    loja,
    servico,
    orcamento,
    infraSpeak,
    mesServico,
    anoServico,
    faturamento,
    situacao,
    projetoManutencao
  };

  if (id) {
    const index = registros.findIndex((r) => r.id === parseInt(id));
    registros[index] = novoRegistro;
    alert("Registro atualizado com sucesso!");
  } else {
    registros.push(novoRegistro);
    alert("Registro adicionado com sucesso!");
  }

  form.reset();
  form.setAttribute("data-id", "");
  atualizarTabela(registros);
  filtrarRegistros();
}

function atualizarTabela(filtrados = registros) {
  registrosFiltrados = filtrados;
  const tbody = document.getElementById("corpoTabela");
  tbody.innerHTML = "";

  registrosFiltrados.forEach((registro) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${registro.id}</td>
      <td>${registro.solicitante}</td>
      <td>${registro.loja}</td>
      <td>${registro.servico}</td>
      <td>${formatarValorMonetario(registro.orcamento)}</td>
      <td>${registro.infraSpeak}</td>
      <td>${registro.mesServico}</td>
      <td>${registro.anoServico}</td>
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

function formatarValorMonetario(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function editarRegistro(id) {
  const registro = registros.find((r) => r.id === id);
  if (!registro) return;

  const form = document.getElementById("formServico");
  form.setAttribute("data-id", id);
  document.getElementById("solicitante").value = registro.solicitante;
  document.getElementById("loja").value = registro.loja;
  document.getElementById("servico").value = registro.servico;
  document.getElementById("orcamento").value = formatarValorMonetario(registro.orcamento);
  document.getElementById("InfraSpeak").value = registro.infraSpeak;
  document.getElementById("mesServico").value = registro.mesServico;
  document.getElementById("anoServico").value = registro.anoServico;
  document.getElementById("faturamento").value = registro.faturamento;
  document.getElementById("situacao").value = registro.situacao;
  document.getElementById("projetoManutencao").value = registro.projetoManutencao;
}

function removerRegistro(id) {
  registros = registros.filter((r) => r.id !== id);
  atualizarTabela();
  alert("Registro removido com sucesso!");
}

function filtrarRegistros() {
  const filtroSolicitante = document.getElementById("filtroSolicitante").value.trim().toLowerCase();
  const filtroMes = document.getElementById("filtroMes").value;
  const filtroAno = document.getElementById("filtroAno").value.trim();
  const filtroSituacao = document.getElementById("filtroSituacao").value;
  const filtroFaturamento = document.getElementById("filtroFaturamento").value;
  const filtroInfraSpeak = document.getElementById("filtroInfraSpeak").value.trim();

  const filtrados = registros.filter((registro) => {
    return (
      (filtroSolicitante === "" || registro.solicitante.toLowerCase().includes(filtroSolicitante)) &&
      (filtroMes === "" || registro.mesServico === filtroMes) &&
      (filtroAno === "" || registro.anoServico === filtroAno) &&
      (filtroSituacao === "" || registro.situacao === filtroSituacao) &&
      (filtroFaturamento === "" || registro.faturamento === filtroFaturamento) &&
      (filtroInfraSpeak === "" || registro.infraSpeak === filtroInfraSpeak)
    );
  });

  atualizarTabela(filtrados);
}

function limparFiltros() {
  document.getElementById("filtroSolicitante").value = "";
  document.getElementById("filtroMes").value = "";
  document.getElementById("filtroAno").value = "";
  document.getElementById("filtroSituacao").value = "";
  document.getElementById("filtroFaturamento").value = "";
  document.getElementById("filtroInfraSpeak").value = "";
  atualizarTabela();
}

document.getElementById("orcamento").addEventListener("input", formatarValorMonetario);
