import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

let registros = [];
let registrosFiltrados = [];

async function adicionarRegistro() {
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

  const { data, error } = await sql`INSERT INTO Servicos ${sql(novoRegistro)}`;
  if (error) {
    console.error("Erro ao adicionar registro:", error);
    alert("Erro ao adicionar o registro.");
  } else {
    alert("Registro adicionado com sucesso!");
    form.reset();
    form.setAttribute("data-id", "");
    atualizarTabela();
  }
}

async function atualizarTabela() {
  const { data, error } = await sql`SELECT * FROM Servicos`;

  if (error) {
    console.error("Erro ao buscar registros:", error);
    alert("Erro ao buscar registros.");
  } else {
    registros = data;
    registrosFiltrados = data;
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
}

function formatarValorMonetario(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function editarRegistro(id) {
  const { data, error } = await sql`SELECT * FROM Servicos WHERE id = ${id}`;

  if (error) {
    console.error("Erro ao buscar registro para editar:", error);
    alert("Erro ao buscar registro.");
  } else {
    const form = document.getElementById("formServico");
    form.setAttribute("data-id", data.id);
    document.getElementById("solicitante").value = data.solicitante;
    document.getElementById("loja").value = data.loja;
    document.getElementById("servico").value = data.servico;
    document.getElementById("orcamento").value = data.orcamento;
    document.getElementById("InfraSpeak").value = data.infraSpeak;
    document.getElementById("mesServico").value = data.mesServico;
    document.getElementById("anoServico").value = data.anoServico;
    document.getElementById("faturamento").value = data.faturamento;
    document.getElementById("situacao").value = data.situacao;
    document.getElementById("projetoManutencao").value = data.projetoManutencao;
  }
}

async function removerRegistro(id) {
  const { data, error } = await sql`DELETE FROM Servicos WHERE id = ${id}`;

  if (error) {
    console.error("Erro ao remover registro:", error);
    alert("Erro ao remover o registro.");
  } else {
    alert("Registro removido com sucesso!");
    atualizarTabela();
  }
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

window.onload = async () => {
  await atualizarTabela();
};
