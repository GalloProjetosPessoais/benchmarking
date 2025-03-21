document.addEventListener("DOMContentLoaded", () => {
  // Filtro de periodos por safra
  document
    .querySelector("#safraId")
    .addEventListener("change", async (event) => {
      const safraId = event.target.value;
      try {
        const response = await fetch(`/buscar/periodosSafra/${safraId}`);
        if (!response.ok) throw new Error("Erro ao buscar períodos.");

        const periodos = await response.json();

        const periodoSelect = document.getElementById("periodoId");
        periodoSelect.innerHTML = "";
        periodoSelect.innerHTML =
          '<option value="" disabled selected>Selecione um Período</option>';
        periodos.forEach((periodo) => {
          const dataInicio = new Date(periodo.dataInicio).toLocaleDateString(
            "pt-BR"
          );
          const dataFim = new Date(periodo.dataFim).toLocaleDateString("pt-BR");
          const option = document.createElement("option");
          option.value = periodo.id;
          option.textContent = `${dataInicio} - ${dataFim}`;
          periodoSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Erro ao buscar periodos:", error);
        alert("Erro ao carregar períodos. Tente novamente.");
      }
    });

  document.getElementById("periodoId").addEventListener("change", (event) => {
    const periodoId = event.target.value;
    if (!periodoId) {
      return limparSelect(empresasSelect, "Selecione um período primeiro");
    }
    carregarEmpresas(periodoId);
    carregarGraficos(periodoId);
  });
});

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ao buscar dados de ${url}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function carregarEmpresas(periodoId) {
  const empresas = await fetchData(`/buscar/empresaGrupo`);
  if (empresas) {
    atualizarEmpresasSelect(empresas);
  } else {
    limparSelect(empresasSelect, "Erro ao carregar empresas");
  }
}

$(function () {
  inicializarSelect2();
  const tabela = inicializarTabela();

  $("#periodosId").on("change", function () {
    const periodoId = $(this).val();
    if (periodoId) {
      //carregarEmpresasNaTabela(periodoId, tabela);
      carregarGraficos(periodoId);
    } else {
      tabela.clear().draw();
    }
  });

  $("#empresasSelect").on("change", aplicarFiltroEmpresas);
  carregarEmpresas();
});

async function carregarEmpresasNaTabela(periodoId, tabela) {
  const empresas = await fetchData(`${BACKEND_URL}/empresas/${periodoId}`);
  if (empresas) {
    tabela.clear().rows.add(empresas).draw();
  } else {
    tabela.clear().draw();
  }
}

function calcularTAH(tchRealizado, atrAcumulado) {
  // (TCH * ATR ) / 1000
  return (tchRealizado * atrAcumulado) / 1000;
}

function calcularIDEA(tchRealizado, atrAcumulado, idadeMedia) {
  // TCH REA + (ATR AC X 0,67) + (Idade Média X 10)
  return tchRealizado + atrAcumulado * 0.67 + idadeMedia * 10;
}

async function carregarGraficos(periodoId) {
  const empresasSelecionadas = $("#empresasSelect").val();

  let url = `/relatorios/dados?periodoId=${periodoId}`;

  const dados = await fetchData(url);
  if (dados == null) {
    document.getElementById("graficos").classList.add("d-none");
    document.getElementById("nada").classList.remove("d-none");
    return;
  }

  document.getElementById("nada").classList.add("d-none");
  document.querySelector("#graficos").classList.remove("d-none");
  // Filtra apenas as empresas que estão na lista selecionada (se houver seleção)
  const dadosFiltrados = empresasSelecionadas?.length
    ? dados.dados.filter((d) =>
        empresasSelecionadas.includes(String(d.empresaId))
      )
    : dados.dados;

  // Valores dos gráficos
  const empresas = dadosFiltrados.map((d) => d.nomeEmpresa);

  const atrDia = dadosFiltrados.map((d) => parseFloat(d.atrDia));
  const atrAcumulado = dadosFiltrados.map((d) => parseFloat(d.atrAcumulado));

  const tah = dadosFiltrados.map((d) =>
    calcularTAH(d.tchRealizado, d.atrAcumulado)
  );
  const indiceInfestacaoFinal = dadosFiltrados.map((d) =>
    parseFloat(d.indiceInfestacaoFinal)
  );
  const chuvaAcumulada = dadosFiltrados.map((d) =>
    parseFloat(d.chuvaAcumulada)
  );
  const idea = dadosFiltrados.map((d) =>
    calcularIDEA(d.tchRealizado, d.atrAcumulado, d.idadeMedia)
  );
  const impurezaMineral = dadosFiltrados.map((d) =>
    parseFloat(d.impurezaMineral)
  );
  const impurezaVegetal = dadosFiltrados.map((d) =>
    parseFloat(d.impurezaVegetal)
  );
  const pureza = dadosFiltrados.map((d) => parseFloat(d.pureza));

  // Médias dos gráficos
  const mediaAtrAcumulado = parseFloat(dados.mediaAtrAcumulado);
  const mediaTAH =
    tah.length > 0 ? tah.reduce((acc, val) => acc + val, 0) / tah.length : 0;
  const mediaIndiceInfestacao = parseFloat(dados.mediaIndiceInfestacao);
  const mediaChuvaAcumulada = parseFloat(dados.mediaChuvaAcumulada);
  const mediaIdea =
    idea.length > 0 ? idea.reduce((acc, val) => acc + val, 0) / idea.length : 0;
  const mediaMineral = parseFloat(dados.mediaImpurezaMineral);
  const mediaVegetal = parseFloat(dados.mediaImpurezaVegetal);
  const mediaPureza = parseFloat(dados.mediaPureza);

  atualizarGrafico(
    "graficoATR",
    ["ATR Dia", "ATR Acumulado"],
    [atrDia, atrAcumulado],
    ["green", "darkgreen"],
    empresas,
    mediaAtrAcumulado,
    "ATR Médio",
    "ATR, kg/t",
    1
  );

  atualizarGrafico(
    "graficoTAH",
    ["TAH"],
    [tah],
    ["green"],
    empresas,
    mediaTAH,
    "Média TAH",
    "t/ha",
    1
  );
  atualizarGrafico(
    "graficoIndiceInfestacao",
    ["Índice de Infestação Final"],
    [indiceInfestacaoFinal],
    ["green"],
    empresas,
    mediaIndiceInfestacao,
    "Média do Índice de Infestação Final",
    "Brocas, %",
    2
  );
  atualizarGrafico(
    "graficoChuvaAcumulada",
    ["Chuva Acumulada"],
    [chuvaAcumulada],
    ["green"],
    empresas,
    mediaChuvaAcumulada,
    "Média de Chuva Acumulada",
    "Precipitação, mm",
    0
  );
  atualizarGrafico(
    "graficoIDEA",
    ["IDEA"],
    [idea],
    ["green"],
    empresas,
    mediaIdea,
    "Média IDEA",
    "",
    0
  );
  atualizarGrafico(
    "graficoImpurezasMineral",
    ["Impureza Mineral"],
    [impurezaMineral],
    ["green"],
    empresas,
    mediaMineral,
    "Média de Impureza Mineral",
    "Impureza Mineral (kg/t)",
    2
  );
  atualizarGrafico(
    "graficoImpurezasVegetal",
    ["Impureza Vegetal"],
    [impurezaVegetal],
    ["green"],
    empresas,
    mediaVegetal,
    "Média da Impureza Vegetal",
    "Impureza Vegetal (kg/t)",
    2
  );
  atualizarGrafico(
    "graficoPureza",
    ["Pureza"],
    [pureza],
    ["green"],
    empresas,
    mediaPureza,
    "Média de Pureza",
    "Pureza (kg/t)",
    2
  );
  // } else {
  //   atualizarGrafico(
  //     "graficoTAH",
  //     ["TAH"],
  //     [],
  //     ["green"],
  //     [],
  //     0,
  //     "Média TAH",
  //     "t/ha"
  //   );
  //   atualizarGrafico(
  //     "graficoChuvaAcumulada",
  //     ["Chuva Acumulada"],
  //     [],
  //     ["green"],
  //     [],
  //     0,
  //     "Média de Chuva Acumulada",
  //     "Precipitação, mm"
  //   );
  //   atualizarGrafico("graficoIDEA", "IDEA", "", [], [], 0);
  //   atualizarGrafico(
  //     "graficoImpurezasMineral",
  //     ["Impureza Mineral"],
  //     [],
  //     ["green"],
  //     [],
  //     0,
  //     "Média de Impureza Mineral",
  //     "Impureza Mineral (kg/t)"
  //   );
  //   atualizarGrafico(
  //     "graficoImpurezasVegetal",
  //     ["Impureza Vegetal"],
  //     [],
  //     ["green"],
  //     [],
  //     0,
  //     "Média de Impureza Vegetal",
  //     "Impureza Vegetal (kg/t)"
  //   );
  //   atualizarGrafico(
  //     "graficoPureza",
  //     ["Pureza"],
  //     [],
  //     ["green"],
  //     [],
  //     0,
  //     "Média de Pureza",
  //     "Pureza (kg/t)"
  //   );
  // }
}

$("#empresasSelect").on("change", function () {
  const periodoId = $("#periodoId").val();
  if (periodoId) {
    carregarGraficos(periodoId);
  }
});

let chartInstances = {};

function atualizarGrafico(
  canvasId,
  dataLabels,
  dataValues,
  dataColors,
  labels,
  mediaValue,
  mediaLabel,
  legend,
  decimalPoints = 0
) {
  let mediaId = `media-${canvasId}`;
  let mediaElement = document.getElementById(mediaId);
  if (mediaElement) {
    mediaElement.remove();
  }

  let canvasElement = document.getElementById(canvasId);
  let mediaContainer = document.createElement("div");
  mediaContainer.id = mediaId;
  mediaContainer.style.textAlign = "center";
  mediaContainer.style.fontSize = "14px";
  mediaContainer.style.fontWeight = "bold";
  mediaContainer.style.marginBottom = "5px";
  mediaContainer.textContent = `${mediaLabel}: ${mediaValue.toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: decimalPoints,
      maximumFractionDigits: decimalPoints,
    }
  )}`;

  canvasElement.parentNode.insertBefore(mediaContainer, canvasElement);

  // **Destrói gráfico antigo antes de criar um novo**
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const ctx = canvasElement.getContext("2d");
  Chart.register(ChartDataLabels);

  let datasets = [];

  // **Adiciona os conjuntos de dados dinâmicos**
  dataLabels.forEach((label, index) => {
    datasets.push({
      label: label,
      data: dataValues[index],
      backgroundColor: dataColors[index],
      datalabels: {
        anchor: "start",
        align: "end",
        color: "#c3cfc3",
        font: {
          weight: "bold",
          size: 12,
        },
        rotation: 270,
        formatter: (value) =>
          value.toLocaleString("pt-BR", {
            minimumFractionDigits: decimalPoints,
            maximumFractionDigits: decimalPoints,
          }),
      },
    });
  });

  // **Linha da média única**
  datasets.push({
    label: mediaLabel,
    data: Array(dataValues[0].length).fill(mediaValue),
    type: "line",
    borderColor: "red",
    borderWidth: 2,
    borderDash: [5, 5],
    fill: false,
    pointStyle: "circle",
    pointRadius: 4,
    pointBackgroundColor: "red",
    datalabels: { display: false },
  });

  chartInstances[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        datalabels: {
          display: true,
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: 90,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: Math.max(...dataValues.flat()) * 1.2,
          title: {
            display: true,
            text: legend,
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
}

function inicializarTabela() {
  return $("#dados").DataTable({
    data: [],
    pageLength: 50,
    lengthMenu: [10, 25, 50, 100],
    responsive: true,
    autoWidth: false,
    dom: '<"top"lf>rt<"bottom"ip>',
    language: { url: "/lib/brasil.json" },
    columns: [
      { data: "EmpresaNome", title: "Empresa", className: "text-center" },
      { data: "EmpresaId", title: "ID", visible: false, searchable: true },
    ],
  });
}

function atualizarSelect(selectElement, items, valueKey, textFunction) {
  selectElement.innerHTML = "";
  if (items.length) {
    selectElement.disabled = false;
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[valueKey];
      option.textContent = textFunction(item);
      selectElement.appendChild(option);
    });
  } else {
    limparSelect(selectElement, "Nenhum item disponível");
  }
}

function inicializarSelect2() {
  if (
    !$.fn.select2 ||
    $("#empresasSelect").hasClass("select2-hidden-accessible")
  )
    return;
  $("#empresasSelect").select2({
    placeholder: "Selecione uma ou mais empresas",
    allowClear: true,
  });
}

function aplicarFiltroEmpresas() {
  const empresasSelecionadas = $("#empresasSelect").val();
  const tabela = $("#dados").DataTable();
  empresasSelecionadas && empresasSelecionadas.length
    ? tabela
        .column(1)
        .search(`^(${empresasSelecionadas.join("|")})$`, true, false)
        .draw()
    : tabela.column(1).search("").draw();
}

function atualizarEmpresasSelect(empresas) {
  empresasSelect.innerHTML = "";

  if (!empresas || !empresas.length) {
    limparSelect(empresasSelect, "Nenhuma empresa disponível");
    return;
  }

  empresasSelect.disabled = false;
  const grupos = agruparEmpresasPorGrupo(empresas);
  const gruposOrdenados = Object.fromEntries(
    Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b))
  );
  Object.keys(gruposOrdenados).forEach((grupo) => {
    const optgroup = criarOptgroup(grupo, gruposOrdenados[grupo]);
    empresasSelect.appendChild(optgroup);
  });

  inicializarSelect2();
}

function agruparEmpresasPorGrupo(empresas) {
  return empresas.reduce((grupos, empresa) => {
    if (!grupos[empresa.grupo.descricao]) grupos[empresa.grupo.descricao] = [];
    grupos[empresa.grupo.descricao].push(empresa);
    return grupos;
  }, {});
}

function criarOptgroup(grupo, empresas) {
  const optgroup = document.createElement("optgroup");
  optgroup.label = grupo;

  empresas.forEach((empresa) => {
    const option = document.createElement("option");
    option.value = empresa.id;
    option.textContent = empresa.nome;
    optgroup.appendChild(option);
  });

  return optgroup;
}
