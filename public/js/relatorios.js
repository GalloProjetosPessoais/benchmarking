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

  // Filtro de empresas por grupo
  //   document
  //     .querySelector("#grupoId")
  //     .addEventListener("change", async (event) => {
  //       const grupoId = event.target.value;
  //       try {
  //         const response = await fetch(`/buscar/empresaGrupo/${grupoId}`);
  //         if (!response.ok) throw new Error("Erro ao buscar empresas.");

  //         const empresas = await response.json();

  //         const empresaSelect = document.getElementById("empresaId");
  //         empresaSelect.innerHTML = "";
  //         empresaSelect.innerHTML =
  //           '<option value="" disabled selected>Selecione uma Empresa</option>';
  //         empresas.forEach((empresa) => {
  //           const option = document.createElement("option");
  //           option.value = empresa.id;
  //           option.textContent = empresa.nome;
  //           empresaSelect.appendChild(option);
  //         });
  //         await buscarDados();
  //       } catch (error) {
  //         console.error("Erro ao buscar empresas:", error);
  //         alert("Erro ao carregar empresas. Tente novamente.");
  //       }
  //     });

  // empresas
  //   document
  //     .querySelector("#empresaId")
  //     .addEventListener("change", async (event) => {
  //       await buscarDados();
  //     });

  // periodo
  document
    .querySelector("#periodoId")
    .addEventListener("change", async (event) => {
      await buscarDados();
    });
});

async function buscarDados() {
  const container = document.getElementById("partial-container");
  const grupoId = document.getElementById("grupoId").value;
  const empresaId = document.getElementById("empresaId").value;
  const periodoId = document.getElementById("periodoId").value;
  if (!periodoId) {
    Swal.fire({
      icon: "warning",
      title: "Filtros Incompletos",
      text: "Por favor, selecione a Safra e o Período antes de continuar.",
      confirmButtonColor: "var(--primary)",
    });
    return;
  }
  try {
    let response;
    if (periodoId != "")
      if (empresaId == "")
        if (grupoId == "")
          response = await fetch(`/partials/graficos?periodoId=${periodoId}`);
        else
          response = await fetch(
            `/partials/graficos?periodoId=${periodoId}&grupoId=${grupoId}`
          );
      else
        response = await fetch(
          `/partials/graficos?periodoId=${periodoId}&empresaId=${empresaId}`
        );

    if (!response.ok) throw new Error("Erro ao carregar os gráficos.");
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar. Tente novamente.");
  }
}

// *************************************************************************
// *************************************************************************
// *************************************************************************
// *************************************************************************
// *************************************************************************

async function carregarEmpresas() {
  const empresas = await fetchData(`/buscar/empresaGrupo`);
  if (empresas) {
    atualizarEmpresasSelect(empresas);
  } else {
    limparSelect(empresasSelect, "Erro ao carregar empresas");
  }
}

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

$(function () {
  inicializarSelect2();
  const tabela = inicializarTabela();

  //   $("#periodosSelect").on("change", function () {
  //     const periodoId = $(this).val();
  //     if (periodoId) {
  //       carregarEmpresasNaTabela(periodoId, tabela);
  //       carregarGraficos(periodoId);
  //     } else {
  //       tabela.clear().draw();
  //     }
  //   });

  $("#empresasSelect").on("change", aplicarFiltroEmpresas);
  carregarEmpresas();
});

// safraSelect.addEventListener("change", () => {
//   const safraId = safraSelect.value;
//   safraId
//     ? carregarPeriodos(safraId)
//     : limparSelect(periodoSelect, "Selecione uma safra primeiro");
// });

// periodoSelect.addEventListener("change", () => {
//   const periodoId = periodoSelect.value;
//   if (periodoId) {
//     carregarEmpresas(periodoId);
//     carregarGraficos(periodoId);
//   } else {
//     limparSelect(empresasSelect, "Selecione um período primeiro");
//   }
// });

async function carregarPeriodos(safraId) {
  const periodos = await fetchData(`${BACKEND_URL}/periodos/${safraId}`);
  if (periodos && periodos.length) {
    atualizarSelect(
      periodoSelect,
      periodos,
      "Id",
      (data) =>
        `${new Date(data.DataInicio).toLocaleDateString()} - ${new Date(
          data.DataFim
        ).toLocaleDateString()}`
    );
    periodoSelect.value = periodos[0].Id;
    carregarEmpresas(periodos[0].Id);
    carregarEmpresasNaTabela(periodos[0].Id, $("#dados").DataTable());
    carregarGraficos(periodos[0].Id);
  } else {
    limparSelect(periodoSelect, "Nenhum período disponível");
  }
}

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

  let url = `${BACKEND_URL}/impurezas?periodoId=${periodoId}`;
  if (empresasSelecionadas && empresasSelecionadas.length > 0) {
    url += `&empresaId=${empresasSelecionadas.join(",")}`;
  }

  const dados = await fetchData(url);

  if (dados && dados.dados.length) {
    const empresas = dados.dados.map((d) => d.Empresa);
    const impurezaMineral = dados.dados.map((d) =>
      parseFloat(d.Impureza_Mineral)
    );
    const impurezaVegetal = dados.dados.map((d) =>
      parseFloat(d.Impureza_Vegetal)
    );
    const mediaMineral = parseFloat(dados.media.Media_Impureza_Mineral);
    const mediaVegetal = parseFloat(dados.media.Media_Impureza_Vegetal);

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
  } else {
    atualizarGrafico("graficoImpurezasMineral", "Impureza Mineral", [], [], 0);
    atualizarGrafico("graficoImpurezasVegetal", "Impureza Vegetal", [], [], 0);
  }
}

$("#empresasSelect").on("change", function () {
  const periodoId = $("#periodosSelect").val();
  if (periodoId) {
    carregarGraficos(periodoId);
  }
});

let chartInstances = {};

function atualizarGrafico(canvasId, label, labels, data, media) {
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
            color: "black",
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
            text: "Impureza (kg/t)",
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

  Object.keys(grupos).forEach((grupo) => {
    const optgroup = criarOptgroup(grupo, grupos[grupo]);
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
