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

async function carregarGraficos(periodoId) {
  const empresasSelecionadas = $("#empresasSelect").val();

  let url = `/relatorios/dados?periodoId=${periodoId}`;
  // if (empresasSelecionadas && empresasSelecionadas.length > 0) {
  //   url += `&empresaId=${empresasSelecionadas.join(",")}`;
  // }

  const dados = await fetchData(url);
  if (dados) {
    // Filtra apenas as empresas que estão na lista selecionada (se houver seleção)
    const dadosFiltrados = empresasSelecionadas?.length
      ? dados.dados.filter((d) =>
          empresasSelecionadas.includes(String(d.empresaId))
        )
      : dados.dados;

    const empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
    const impurezaMineral = dadosFiltrados.map((d) =>
      parseFloat(d.impurezaMineral)
    );
    const impurezaVegetal = dadosFiltrados.map((d) =>
      parseFloat(d.impurezaVegetal)
    );
    const pureza = dadosFiltrados.map((d) => parseFloat(d.pureza));

    const idea = dadosFiltrados.map((d) =>
      calcularIDEA(d.tchRealizado, d.atrAcumulado, d.idadeMedia)
    );

    const mediaMineral = parseFloat(dados.mediaImpurezaMineral);
    const mediaVegetal = parseFloat(dados.mediaImpurezaVegetal);
    const mediaPureza = parseFloat(dados.mediaPureza);
    const mediaIdea =
      idea.length > 0
        ? idea.reduce((acc, val) => acc + val, 0) / idea.length
        : 0;

    atualizarGrafico("graficoIDEA", "Índice IDEA", empresas, idea, mediaIdea);
    atualizarGrafico(
      "graficoImpurezasMineral",
      "Impureza Mineral",
      empresas,
      impurezaMineral,
      mediaMineral
    );
    atualizarGrafico(
      "graficoImpurezasVegetal",
      "Impureza Vegetal",
      empresas,
      impurezaVegetal,
      mediaVegetal
    );
    atualizarGrafico("graficoPureza", "Pureza", empresas, pureza, mediaPureza);
  } else {
    atualizarGrafico("graficoIDEA", "Índice IDEA", [], [], 0);
    atualizarGrafico("graficoImpurezasMineral", "Impureza Mineral", [], [], 0);
    atualizarGrafico("graficoImpurezasVegetal", "Impureza Vegetal", [], [], 0);
    atualizarGrafico("graficoPureza", "Pureza", [], [], 0);
  }
}

function calcularIDEA(tchRealizado, atrAcumulado, idadeMedia) {
  // TCH REA + (ATR AC X 0,67) + (Idade Média X 10)
  return tchRealizado + atrAcumulado * 0.67 + idadeMedia * 10;
}

$("#empresasSelect").on("change", function () {
  const periodoId = $("#periodoId").val();
  if (periodoId) {
    carregarGraficos(periodoId);
  }
});

let chartInstances = {};

function atualizarGrafico(canvasId, label, labels, data, media) {
  document.querySelector("#graficos").classList.remove("d-none");

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
  mediaContainer.textContent = `Média de ${label}: ${media.toFixed(2)}`;

  canvasElement.parentNode.insertBefore(mediaContainer, canvasElement);

  // **Destrói gráfico antigo antes de criar um novo**
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const ctx = canvasElement.getContext("2d");
  Chart.register(ChartDataLabels);
  chartInstances[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: "green",
          datalabels: {
            anchor: "end",
            align: "top",
            color: "gray",
            font: {
              weight: "bold",
              size: 12,
            },
            formatter: (value) => value.toFixed(2),
          },
        },
        {
          label: `Média ${label}`,
          data: Array(labels.length).fill(media),
          type: "line",
          borderColor: "red",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointStyle: "circle",
          pointRadius: 4,
          pointBackgroundColor: "red",
          datalabels: { display: false },
        },
      ],
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
          suggestedMax: Math.max(...data) * 1.2,
          title: {
            display: true,
            text: "(kg/t)",
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
