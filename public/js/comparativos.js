document.addEventListener("DOMContentLoaded", async () => {
  inicializarSelect2();
});

function inicializarSelect2() {
  if (!$.fn.select2) {
    console.error("Select2 não foi carregado corretamente.");
    return;
  }

  $("#safrasSelect").select2({
    placeholder: "Selecione uma ou mais safras",
    allowClear: true,
  });
}

document.getElementById("gruposSelect").addEventListener("change", function () {
  const grupoId = this.value;

  if (grupoId) {
    document.getElementById("periodosContainer").innerHTML = "";
    $("#safrasSelect").val(null).trigger("change");
  }
});

$("#safrasSelect").on("change", function () {
  const safraIds = $(this).val() || [];

  document.querySelectorAll(".safra-dropdown").forEach((div) => {
    const safraId = div.getAttribute("data-safra-id");
    if (!safraIds.includes(String(safraId))) {
      div.remove();
    }
  });

  carregarComparativo();

  safraIds.forEach((safraId) => {
    if (!document.querySelector(`[data-safra-id="${safraId}"]`)) {
      carregarPeriodos(safraId);
    }
  });
});

async function carregarPeriodos(safraId) {
  document.getElementById("periodos").classList.remove("d-none");
  try {
    const response = await fetch(`/buscar/periodosSafra/${safraId}`);
    if (!response.ok) throw new Error("Erro ao buscar períodos.");
    const periodos = await response.json();
    adicionarDropdownDePeriodos(safraId, periodos);
  } catch (error) {
    console.error("Erro ao carregar períodos:", error);
  }
}

function adicionarDropdownDePeriodos(safraId, periodos) {
  const container = document.getElementById("periodosContainer");

  if (periodos.length === 0) return;
  const safraAno = periodos[0].safra.ano;
  periodos.sort((a, b) => a.id - b.id);
  //const totalPeriodos = periodos.length;
  periodos.forEach((periodo, index) => {
    periodo.NumeroCorrigido = index + 1;
  });

  const safraDiv = document.createElement("div");
  safraDiv.classList.add(
    "safra-dropdown",
    "form-group",
    "col-sm-12",
    "col-md-6",
    "col-lg-3"
  );
  safraDiv.setAttribute("data-safra-id", safraId);

  const titulo = document.createElement("label");
  titulo.textContent = `Safra de ${safraAno}`;
  titulo.setAttribute("for", `periodo_safra_${safraId}`);
  safraDiv.appendChild(titulo);

  const select = document.createElement("select");
  select.setAttribute("name", `periodo_safra_${safraId}`);

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Selecione um período";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  periodos.forEach((periodo) => {
    const option = document.createElement("option");
    option.value = periodo.id;
    option.textContent = `${periodo.NumeroCorrigido} - ${new Date(
      periodo.dataInicio
    ).toLocaleDateString("pt-BR")} até ${new Date(
      periodo.dataFim
    ).toLocaleDateString("pt-BR")}`;
    select.appendChild(option);
  });

  safraDiv.appendChild(select);
  container.appendChild(safraDiv);
}

document
  .getElementById("periodosContainer")
  .addEventListener("change", function (event) {
    if (event.target.tagName === "SELECT") {
      carregarComparativo();
    }
  });

async function carregarComparativo() {
  const grupoId = document.getElementById("gruposSelect").value;
  if (!grupoId) return;

  const tabelaContainer = document.getElementById("tabelaComparativoContainer");
  if (!tabelaContainer) {
    console.error(
      "Erro: Elemento 'tabelaComparativoContainer' não encontrado."
    );
    return;
  }

  const periodosSelecionados = Array.from(
    document.querySelectorAll(".safra-dropdown select")
  )
    .map((select) => select.value)
    .filter((value) => value !== "");

  if (periodosSelecionados.length === 0) {
    tabelaContainer.innerHTML = "<p>Nenhum dado encontrado.</p>";
    return;
  }

  document.getElementById("tabela").classList.remove("d-none");

  try {
    const url = `/comparativos/dados?grupoId=${grupoId}&periodos=${periodosSelecionados.join(
      ","
    )}`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Erro na requisição: ${response.statusText}`);

    const dadosComparativo = await response.json();

    tabelaContainer.innerHTML = "";

    atualizarTabela(dadosComparativo);
  } catch (error) {
    console.error("Erro ao carregar comparativo:", error);
  }
}

function formatarNumero(valor) {
  if (valor === null || valor === undefined || valor === "-") return "-";

  // Se for um número, formata com duas casas decimais
  if (typeof valor === "number" || !isNaN(valor)) {
    return parseFloat(valor).toFixed(2).replace(".", ",");
  }

  // Verifica se é uma string de data válida (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ssZ)
  const data = new Date(valor);
  if (!isNaN(data.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(valor)) {
    return data.toLocaleDateString("pt-BR"); // Formato DD/MM/AAAA
  }

  // Se não for número nem data, retorna o próprio valor
  return valor;
}

// function atualizarTabela(dados) {
//   const tabelaContainer = document.getElementById("tabelaComparativoContainer");

//   if (!tabelaContainer) {
//     console.error(
//       "Erro: Elemento 'tabelaComparativoContainer' não encontrado."
//     );
//     return;
//   }

//   if (dados.length === 0) {
//     tabelaContainer.innerHTML = "<p>Nenhum dado encontrado.</p>";
//     return;
//   }

//   const nomeGrupo = dados[0].grupoDescricao.toUpperCase();

//   let tableHTML = `
//         <table class="comparativo-table">
//             <thead>
//                 <tr class="grupo-nome">
//                     <th colspan="99">${nomeGrupo}</th>
//                 </tr>
//                 <tr>
//                     <th>Indicador</th>
//                     <th>Medidas</th>`;

//   const anos = [...new Set(dados.map((d) => d.ano))];
//   anos.forEach((ano) => {
//     tableHTML += `<th>${ano}</th>`;
//   });

//   tableHTML += `</tr></thead><tbody>`;

//   const indicadores = [
//     { nome: "Início de Safra", chave: "inicioSafra", unidade: "dd/mm/aaaa" },
//     { nome: "Moagem Estimada", chave: "moagemEstimada", unidade: "t" },
//     { nome: "Moagem Reestimada", chave: "moagemReestimada", unidade: "t" },
//     { nome: "Moagem Realizada", chave: "moagemRealizada", unidade: "t" },
//     { nome: "Realizado", chave: "realizado", unidade: "%" },
//     {
//       nome: "Realizado Cana Própria",
//       chave: "realizadoCanaPropria",
//       unidade: "%",
//     },
//     {
//       nome: "Realizado Cana Fornecedor",
//       chave: "realizadoCanaFornecedor",
//       unidade: "%",
//     },
//     { nome: "ATR Dia", chave: "atrDia", unidade: "kg/t" },
//     { nome: "ATR Acumulado", chave: "atrAcumulado", unidade: "kg/t" },
//     { nome: "TCH Estimado", chave: "tchEstimado", unidade: "t/ha" },
//     { nome: "TCH Realizado", chave: "tchRealizado", unidade: "t/ha" },
//     { nome: "Idade Média", chave: "idadeMedia", unidade: "Anos" },
//     { nome: "Chuva Mês", chave: "chuvaMes", unidade: "mm" },
//     { nome: "Chuva Acumulada", chave: "chuvaAcumulada", unidade: "mm" },
//     {
//       nome: "Índice Infestação Final",
//       chave: "indiceInfestacaoFinal",
//       unidade: "%",
//     },
//     { nome: "Impureza Mineral", chave: "impurezaMineral", unidade: "kg/t" },
//     { nome: "Impureza Vegetal", chave: "impurezaVegetal", unidade: "kg/t" },
//     { nome: "Pureza", chave: "pureza", unidade: "kg/t" },
//   ];

//   indicadores.forEach((indicador) => {
//     tableHTML += `<tr><th>${indicador.nome}</th><td>${indicador.unidade}</td>`;

//     anos.forEach((ano) => {
//       const dadoAno = dados.find((d) => d.ano == ano);
//       const valor = dadoAno ? dadoAno[indicador.chave] || "-" : "-";
//       tableHTML += `<td>${formatarNumero(valor)}</td>`;
//     });

//     tableHTML += `</tr>`;
//   });

//   tableHTML += `</tbody></table>`;
//   tabelaContainer.innerHTML = tableHTML;
// }

function atualizarTabela(dados) {
  const tabelaContainer = document.getElementById("tabelaComparativoContainer");

  if (!tabelaContainer) {
    console.error(
      "Erro: Elemento 'tabelaComparativoContainer' não encontrado."
    );
    return;
  }

  if (dados.length === 0) {
    tabelaContainer.innerHTML = "<p>Nenhum dado encontrado.</p>";
    return;
  }

  const nomeGrupo = dados[0].grupoDescricao.toUpperCase();

  // Agrupar os dados por empresa
  const empresas = {};
  dados.forEach((d) => {
    if (!empresas[d.nomeEmpresa]) {
      empresas[d.nomeEmpresa] = [];
    }
    empresas[d.nomeEmpresa].push(d);
  });

  let tableHTML = `
        <h2 class="grupo-nome">${nomeGrupo}</h2>
        <table class="comparativo-table">
            <thead>
                <tr>
                    <th rowspan="2">Indicador</th>
                    <th rowspan="2">Medidas</th>`;

  // Criar cabeçalho das empresas
  Object.keys(empresas).forEach((empresa) => {
    tableHTML += `<th colspan="${empresas[empresa].length}">${empresa}</th>`;
  });

  tableHTML += `</tr><tr>`;

  // Criar linha com os anos dentro das colunas das empresas
  Object.values(empresas).forEach((dadosEmpresa) => {
    dadosEmpresa
      .sort((a, b) => a.ano - b.ano) // Ordenar anos dentro de cada empresa
      .forEach((d) => {
        tableHTML += `<th>${d.ano}</th>`;
      });
  });

  tableHTML += `</tr></thead><tbody>`;

  // Lista de indicadores
  const indicadores = [
    { nome: "Início de Safra", chave: "inicioSafra", unidade: "dd/mm/aaaa" },
    { nome: "Moagem Estimada", chave: "moagemEstimada", unidade: "t" },
    { nome: "Moagem Reestimada", chave: "moagemReestimada", unidade: "t" },
    { nome: "Moagem Realizada", chave: "moagemRealizada", unidade: "t" },
    { nome: "Realizado", chave: "realizado", unidade: "%" },
    { nome: "Cana Própria", chave: "realizadoCanaPropria", unidade: "%" },
    { nome: "Cana Fornecedor", chave: "realizadoCanaFornecedor", unidade: "%" },
    { nome: "ATR Dia", chave: "atrDia", unidade: "kg/t" },
    { nome: "ATR Acumulado", chave: "atrAcumulado", unidade: "kg/t" },
    { nome: "TCH Estimado", chave: "tchEstimado", unidade: "t/ha" },
    { nome: "TCH Realizado", chave: "tchRealizado", unidade: "t/ha" },
    { nome: "Idade Média", chave: "idadeMedia", unidade: "Anos" },
    { nome: "Chuva Mês", chave: "chuvaMes", unidade: "mm" },
    { nome: "Chuva Acumulada", chave: "chuvaAcumulada", unidade: "mm" },
    {
      nome: "Índice Infestação Final",
      chave: "indiceInfestacaoFinal",
      unidade: "%",
    },
    { nome: "Impureza Mineral", chave: "impurezaMineral", unidade: "kg/t" },
    { nome: "Impureza Vegetal", chave: "impurezaVegetal", unidade: "kg/t" },
    { nome: "Pureza", chave: "pureza", unidade: "kg/t" },
    { nome: "Data Informação", chave: "dataInformacao", unidade: "dd/mm/aaaa" },
  ];

  // Criar linhas dos indicadores
  indicadores.forEach((indicador) => {
    tableHTML += `<tr><th>${indicador.nome}</th><td>${indicador.unidade}</td>`;

    Object.values(empresas).forEach((dadosEmpresa) => {
      dadosEmpresa
        .sort((a, b) => a.ano - b.ano)
        .forEach((d) => {
          const valor = d[indicador.chave] || "-";
          tableHTML += `<td>${formatarNumero(valor)}</td>`;
        });
    });

    tableHTML += `</tr>`;
  });

  tableHTML += `</tbody></table>`;
  tabelaContainer.innerHTML = tableHTML;
}
