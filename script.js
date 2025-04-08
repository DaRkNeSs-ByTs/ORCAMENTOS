// Variáveis globais
let idContador = 1;
let registros = [];
let registrosFiltrados = []; // Para armazenar os registros filtrados

// Função para adicionar ou editar um registro
function adicionarRegistro() {
  const form = document.getElementById("formServico");
  const id = form.getAttribute("data-id");

  // Obter valores do formulário
  const solicitante = document.getElementById("solicitante").value.trim();
  const loja = document.getElementById("loja").value.trim();
  const servico = document.getElementById("servico").value.trim();
  const orcamentoInput = document.getElementById("orcamento").value;
  const orcamento = parseFloat(
    orcamentoInput.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
  );
  const infraSpeak = document.getElementById("InfraSpeak").value.trim();
  const mesServico = document.getElementById("mesServico").value;
  const anoServico = document.getElementById("anoServico").value.trim();
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
    projetoManutencao,
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

// Função para atualizar a tabela principal
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
      <td>${registro.mesServico} de ${registro.anoServico}</td>
      <td>${registro.faturamento}</td>
      <td>${registro.situacao}</td>
      <td>${registro.projetoManutencao}</td>
      <td>
        <button class="editar" onclick="editarRegistro(${
          registro.id
        })">Editar</button>
        <button class="remover" onclick="removerRegistro(${
          registro.id
        })">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Função para formatar valores monetários
function formatarValorMonetario(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Função para formatar o campo de orçamento
function formatarMoeda(event) {
  let valor = event.target.value.replace(/\D/g, "");
  if (!valor) {
    event.target.value = "R$ 0,00";
    return;
  }
  const numero = parseFloat(valor) / 100;
  event.target.value = numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Função para editar um registro
function editarRegistro(id) {
  const registro = registros.find((r) => r.id === id);
  if (!registro) return;

  const form = document.getElementById("formServico");
  form.setAttribute("data-id", id);
  document.getElementById("solicitante").value = registro.solicitante;
  document.getElementById("loja").value = registro.loja;
  document.getElementById("servico").value = registro.servico;
  document.getElementById("orcamento").value = formatarValorMonetario(
    registro.orcamento
  );
  document.getElementById("InfraSpeak").value = registro.infraSpeak;
  document.getElementById("mesServico").value = registro.mesServico;
  document.getElementById("anoServico").value = registro.anoServico;
  document.getElementById("faturamento").value = registro.faturamento;
  document.getElementById("situacao").value = registro.situacao;
  document.getElementById("projetoManutencao").value =
    registro.projetoManutencao;
}

// Função para remover um registro
function removerRegistro(id) {
  registros = registros.filter((r) => r.id !== id);
  atualizarTabela();
  alert("Registro removido com sucesso!");
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

// Função para gerar a tabela no formato da imagem
function gerarTabelaImpressao() {
  const manutencao = registrosFiltrados.filter(
    (r) => r.projetoManutencao === "MANUTENCAO"
  );
  const projeto = registrosFiltrados.filter(
    (r) => r.projetoManutencao === "PROJETO"
  );

  let html = `
    <h2>Relatório de Serviços</h2>
    <h3>Serviço (Manutenção)</h3>
    <table class="tabela-impressao">
      <thead>
        <tr>
          <th>Mês</th>
          <th>Loja</th>
          <th>Serviço (Manutenção)</th>
          <th>Valor (R$)</th>
          <th>InfraSpeak</th>
        </tr>
      </thead>
      <tbody>
  `;

  manutencao.forEach((registro) => {
    html += `
      <tr>
        <td>${registro.mesServico} de ${registro.anoServico}</td>
        <td>${registro.loja}</td>
        <td>${registro.servico}</td>
        <td>${formatarValorMonetario(registro.orcamento)}</td>
        <td>${registro.infraSpeak}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <h3>Serviço (Projeto)</h3>
    <table class="tabela-impressao">
      <thead>
        <tr>
          <th>Mês</th>
          <th>Loja</th>
          <th>Serviço (Projeto)</th>
          <th>Valor (R$)</th>
          <th>InfraSpeak</th>
        </tr>
      </thead>
      <tbody>
  `;

  projeto.forEach((registro) => {
    html += `
      <tr>
        <td>${registro.mesServico} de ${registro.anoServico}</td>
        <td>${registro.loja}</td>
        <td>${registro.servico}</td>
        <td>${formatarValorMonetario(registro.orcamento)}</td>
        <td>${registro.infraSpeak}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

// Função para imprimir os registros filtrados
function imprimirRegistros() {
  if (registrosFiltrados.length === 0) {
    alert(
      "Nenhum registro para imprimir. Adicione ou filtre registros primeiro."
    );
    return;
  }

  const tabelaImpressao = document.getElementById("tabelaImpressao");
  tabelaImpressao.innerHTML = gerarTabelaImpressao();

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Relatório de Serviços</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2, h3 { text-align: center; }
          .tabela-impressao { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .tabela-impressao th, .tabela-impressao td { border: 1px solid #000; padding: 8px; text-align: left; }
          .tabela-impressao th { background-color: #ffff00; font-weight: bold; }
        </style>
      </head>
      <body>
        ${tabelaImpressao.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// Função para exportar os registros filtrados como HTML
function exportarRegistros() {
  if (registrosFiltrados.length === 0) {
    alert(
      "Nenhum registro para exportar. Adicione ou filtre registros primeiro."
    );
    return;
  }

  const tabelaImpressao = document.getElementById("tabelaImpressao");
  tabelaImpressao.innerHTML = gerarTabelaImpressao();

  const htmlContent = `
    <html>
      <head>
        <title>Relatório de Serviços</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2, h3 { text-align: center; }
          .tabela-impressao { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .tabela-impressao th, .tabela-impressao td { border: 1px solid #000; padding: 8px; text-align: left; }
          .tabela-impressao th { background-color: #ffff00; font-weight: bold; }
        </style>
      </head>
      <body>
        ${tabelaImpressao.innerHTML}
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio-servicos.html";
  a.click();
  window.URL.revokeObjectURL(url);
}

// Adicionar evento ao campo de orçamento
document.getElementById("orcamento").addEventListener("input", formatarMoeda);
