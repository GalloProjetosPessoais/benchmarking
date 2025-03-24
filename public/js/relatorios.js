document.addEventListener("DOMContentLoaded", () => {

  document.querySelector("#safraId").addEventListener("change", async (event) => {
    const safraId = event.target.value;
    try {
      const response = await fetch(`/buscar/periodosSafra/${safraId}`);
      if (!response.ok) throw new Error("Erro ao buscar períodos.");

      let periodos = await response.json();
      const periodoSelect = document.getElementById("periodoId");
      periodoSelect.innerHTML =
        '<option value="" disabled>Selecione um Período</option>';

      if (!periodos.length) return; // Se não houver períodos, sai da função.

      const hoje = new Date();

      // **Filtra apenas períodos passados ou atuais (exclui futuros)**
      periodos = periodos.filter((p) => new Date(p.dataInicio) <= hoje);

      if (!periodos.length) return; // Se todos os períodos eram futuros, sai da função.

      // **Encontra o período ativo mais recente**
      const periodoAtivoMaisRecente = periodos
        .filter((p) => p.ativo)
        .sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio))[0];

      // **Ordena os períodos restantes do mais recente para o mais antigo**
      periodos.sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio));

      periodos.forEach((periodo) => {
        const dataInicio = new Date(periodo.dataInicio).toLocaleDateString("pt-BR");
        const dataFim = new Date(periodo.dataFim).toLocaleDateString("pt-BR");

        const option = document.createElement("option");
        option.value = periodo.id;
        option.textContent = `${dataInicio} - ${dataFim}`;

        // **Define o mais recente ativo como selecionado**
        if (periodoAtivoMaisRecente && periodo.id === periodoAtivoMaisRecente.id) {
          option.selected = true;
        }

        periodoSelect.appendChild(option);
      });

    } catch (error) {
      console.error("Erro ao buscar períodos:", error);
      alert("Erro ao carregar períodos. Tente novamente.");
    }
  });

  document.getElementById("periodoId").addEventListener("change", (event) => {
    const periodoId = event.target.value;
    // if (!periodoId) {
    //   return limparSelect(empresasSelect, "Selecione um período primeiro");
    // }
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

async function carregarEmpresas() {
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
      carregarGraficos(periodoId);
    } else {
      tabela.clear().draw();
    }
  });
});

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
  let dadosFiltrados = empresasSelecionadas?.length
    ? dados.dados.filter((d) =>
      empresasSelecionadas.includes(String(d.empresaId))
    )
    : dados.dados;

  dadosFiltrados = dadosFiltrados.sort((a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa, 'pt-BR'));

  const tabela = inicializarTabela();
  carregarEmpresasNaTabela(dadosFiltrados, tabela);

  // Valores dos gráficos
  const empresas = dadosFiltrados.map((d) => d.nomeEmpresa);

  const moagemEstimada = dadosFiltrados.map((d) => parseFloat(d.moagemEstimada));
  const moagemReestimada = dadosFiltrados.map((d) => parseFloat(d.moagemReestimada));

  const producaoAcumulada = dadosFiltrados.map((d) => parseFloat(d.moagemRealizada));

  const tchEstimado = dadosFiltrados.map((d) => parseFloat(d.tchEstimado));
  const tchRealizado = dadosFiltrados.map((d) => parseFloat(d.tchRealizado));

  const todosValores = [...tchEstimado, ...tchRealizado]; // Junta os dois vetores
  const mediaGeralTCH = todosValores.reduce((total, num) => total + num, 0) / todosValores.length;
  
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
    "graficoProducao",
    ["Produção Estimada", "Produção Reestimada"],
    [moagemEstimada, moagemReestimada],
    ["green", "darkgreen"],
    empresas,
    0,
    "",
    "Toneladas",
    0
  );

  atualizarGrafico(
    "graficoProducaoAcumulada",
    ["Produção Acumulada"],
    [producaoAcumulada],
    ["green"],
    empresas,
    0,
    "",
    "Toneladas",
    0
  );

  atualizarGrafico(
    "graficoTCH",
    ["TCH Estimado", "TCH Realizado"],
    [tchEstimado, tchRealizado],
    ["green", "darkgreen"],
    empresas,
    mediaGeralTCH,
    "TCH Médio",
    "TCH, t/ha",
    1
  );

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

  let canvasElement = document.getElementById(canvasId);

  if (mediaValue > 0 && mediaLabel != "") {
    let mediaId = `media-${canvasId}`;
    let mediaElement = document.getElementById(mediaId);
    if (mediaElement) {
      mediaElement.remove();
    }

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
  }

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

  if (mediaValue > 0 && mediaLabel != "") {
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
  }

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

function atualizarEmpresasSelect(empresas) {
  empresasSelect.innerHTML = "";

  if (!empresas || !empresas.length) {
    limparSelect(empresasSelect, "Nenhuma empresa disponível");
    return;
  }

  empresasSelect.disabled = false;

  // Ordena as empresas pelo nome
  empresas.sort((a, b) => a.nome.localeCompare(b.nome));

  empresas.forEach((empresa) => {
    const option = document.createElement("option");
    option.value = empresa.id;
    option.textContent = empresa.nome;
    empresasSelect.appendChild(option);
  });

  inicializarSelect2(); // Se necessário
}






/*******************************
 * 1) Formata os números SEM truncar
 *******************************/
function formatarNumero(valor, casas) {
  // Se o valor é nulo, indefinido ou string vazia, exibe "-"
  if (valor === null || valor === undefined || valor === '') {
    return '-';
  }

  // Converte para número
  const numero = parseFloat(valor);

  // Se não for número válido, exibe "-"
  if (isNaN(numero)) {
    return '-';
  }

  // Formata com X casas decimais
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}


function inicializarTabela() {
  if (!$.fn.DataTable.isDataTable('#dados')) {
    return $('#dados').DataTable({
      pageLength: 50,
      lengthMenu: [10, 25, 50, 100],
      responsive: true,
      autoWidth: false,
      language: { url: '/lib/brasil.json' },
      columns: [
        { data: 'Usina', title: 'Usina', className: 'text-center' },
        { data: 'InicioSafra', title: 'Início Safra', className: 'text-center' },
        { data: 'MoagemAcumulada', title: 'Moagem Acu. (t)', className: 'text-center' },
        { data: 'PercentualRealizado', title: '% Realizado', className: 'text-center' },

        // ATR Dia -> 1 casa decimal
        {
          data: 'ATR_Dia',
          title: 'ATR Dia (KG/T)',
          className: 'text-center',
          render: function (data) {
            return formatarNumero(parseFloat(data), 1);
          }
        },

        // ATR Acumulado -> 1 casa decimal
        {
          data: 'ATR_Acumulado',
          title: 'ATR Acu. (KG/T)',
          className: 'text-center',
          render: function (data) {
            return formatarNumero(parseFloat(data), 1);
          }
        },

        // TCH Estimado -> 1 casa decimal
        {
          data: 'TCH_Estimado',
          title: 'TCH Est.',
          className: 'text-center',
          render: function (data) {
            return formatarNumero(parseFloat(data), 1);
          }
        },

        // TCH Realizado -> 1 casa decimal
        {
          data: 'TCH_Realizado',
          title: 'TCH Real.',
          className: 'text-center',
          render: function (data) {
            return formatarNumero(parseFloat(data), 1);
          }
        },

        // TCH Variação -> 2 casas decimais + seta
        {
          data: 'TCH_Variacao',
          title: 'TCH Var. (%)',
          className: 'text-center',
          type: 'html',
          render: function (data, type, row) {
            if (type !== 'display') {
              return data;
            }

            if (data == null || isNaN(parseFloat(data))) {
              return '-';
            }

            const valor = parseFloat(data);
            const cor = valor >= 0 ? 'green' : 'red';
            const seta = valor >= 0 ? '▲' : '▼';

            return `
            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
              <span style="color: ${cor}; font-weight: normal;">${seta}</span>
              <span style="color: black; font-weight: normal;">${formatarNumero(valor, 2)}%</span>
            </div>
          `;
          }


        },

        // Idade Média -> 2 casas decimais
        {
          data: 'IdadeMedia',
          title: 'Idade Média',
          className: 'text-center',
          render: function (data) {
            return formatarNumero(parseFloat(data), 2);
          }
        },

        // Índice IDEA (sem casas decimais)
        {
          data: 'IndiceIdea',
          title: 'Índice IDEA',
          className: 'text-center',
          render: function (data) {
            return formatarNumero(parseFloat(data), 0);
          }
        },

        // I.I.F. (%) -> 2 casas decimais + símbolo %
        {
          data: 'IIF',
          title: 'I.I.F. (%)',
          className: 'text-center',
          render: function (data) {
            if (data === null || data === undefined || isNaN(parseFloat(data))) {
              return '-';
            }
            const valor = parseFloat(data);
            return `${formatarNumero(valor, 2)}%`;
          }
        },

        // Ind. Pluv. (mm) -> sem casas decimais
        {
          data: 'ChuvaAcumulada',
          title: 'Ind. Pluv. (mm)',
          className: 'text-center',
          render: function (data) {
            if (data === null || data === undefined || isNaN(parseFloat(data))) {
              return '-';
            }
            return parseFloat(data).toLocaleString('pt-BR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            });
          }
        },

        // Pureza -> 2 casas decimais
        {
          data: 'Pureza',
          title: 'Pureza (%)',
          className: 'text-center',
          render: function (data) {
            if (data === null || data === undefined || isNaN(parseFloat(data))) {
              return '-';
            }
            const valor = parseFloat(data);
            return formatarNumero(valor, 2);
          }
        },

        // Altitude (m) -> sem casas decimais
        {
          data: 'Altitude',
          title: 'Altitude (m)',
          className: 'text-center',
          render: function (data) {
            if (data === null || data === undefined || isNaN(parseFloat(data))) {
              return '-';
            }
            const valor = parseFloat(data);
            return formatarNumero(valor, 0);
          }
        },

        // 🔥 NOVAS COLUNAS: Ambiente A, B, C, D, E
        { data: 'AmbienteA', title: 'A', className: 'text-center' },
        { data: 'AmbienteB', title: 'B', className: 'text-center' },
        { data: 'AmbienteC', title: 'C', className: 'text-center' },
        { data: 'AmbienteD', title: 'D', className: 'text-center' },
        { data: 'AmbienteE', title: 'E', className: 'text-center' },

        // 🔥 NOVA COLUNA: Observação (texto)
        { data: 'Observacao', title: 'Observação', className: 'text-center' }
      ]
    });
  } else {
    return $('#dados').DataTable();
  }
}

async function carregarEmpresasNaTabela(dados, tabela) {

  dados = dados.map(item => ({
    ...item,
    TCH_Variacao: item.tchEstimado !== 0
      ? Number((((item.tchRealizado - item.tchEstimado) / item.tchEstimado) * 100).toFixed(2))
      : 0
  }));

  /**********************************************
   * 1) Calcular totais e médias usando parseFloat
   **********************************************/
  let totalMoagem = Math.round(
    dados.reduce((total, item) => total + (parseFloat(item.moagemRealizada) || 0), 0)
  );
  let totalATR_Dia = dados.reduce((total, item) => total + (parseFloat(item.atrDia) || 0), 0) / dados.length;
  let totalATR_Acumulado = dados.reduce((total, item) => total + (parseFloat(item.atrAcumulado) || 0), 0) / dados.length;
  let totalTCH_Estimado = dados.reduce((total, item) => total + (parseFloat(item.tchEstimado) || 0), 0) / dados.length;
  let totalTCH_Realizado = dados.reduce((total, item) => total + (parseFloat(item.tchRealizado) || 0), 0) / dados.length;
  let totalTCH_Variacao = dados.reduce((total, item) => total + (parseFloat(item.TCH_Variacao) || 0), 0) / dados.length;
  let totalIdadeMedia = dados.reduce((total, item) => total + (parseFloat(item.idadeMedia) || 0), 0) / dados.length;

  // Índice IDEA (já existente)
  let totalIndiceIdea = dados.reduce((soma, item) => {
    const tchReal = parseFloat(item.tchRealizado) || 0;
    const atrAcu = parseFloat(item.atrAcumulado) || 0;
    const idade = parseFloat(item.idadeMedia) || 0;
    return soma + (tchReal + atrAcu * 0.67 + idade * 10);
  }, 0) / dados.length;

  // 🔥 Totais (médias) para Pureza e Altitude (já incluídos)
  let totalPureza = dados.reduce((total, item) => total + (parseFloat(item.pureza) || 0), 0) / dados.length;
  let totalAltitude = dados.reduce((total, item) => total + (parseFloat(item.altitude) || 0), 0) / dados.length;

  // 🔥 Totais para IIF e Chuva (já incluídos)
  let totalIIF = dados.reduce((total, item) => total + (parseFloat(item.IIF) || 0), 0) / dados.length;
  let totalChuva = dados.reduce((total, item) => total + (parseFloat(item.chuvaAcumulada) || 0), 0) / dados.length;

  /**********************************************
   * 2) Mapear dados para DataTables
   **********************************************/
  const dadosFormatados = dados.map(item => {
    const tchReal = parseFloat(item.tchRealizado) || 0;
    const atrAcu = parseFloat(item.atrAcumulado) || 0;
    const idade = parseFloat(item.idadeMedia) || 0;
    const indiceIdea = tchReal + atrAcu * 0.67 + idade * 10;

    return {
      Usina: (item.nomeEmpresa || '').trim(),
      InicioSafra: item.inicioSafra
        ? new Date(item.inicioSafra).toLocaleDateString('pt-BR')
        : 'N/A',
      MoagemAcumulada: Math.round(parseFloat(item.moagemRealizada) || 0)
        .toLocaleString('pt-BR', { useGrouping: true }),
      PercentualRealizado: formatarNumero(item.realizado, 2) + '%',
      ATR_Dia: parseFloat(item.atrDia),
      ATR_Acumulado: parseFloat(item.atrAcumulado),
      TCH_Estimado: parseFloat(item.tchEstimado),
      TCH_Realizado: parseFloat(item.tchRealizado),
      TCH_Variacao: parseFloat(item.TCH_Variacao),
      IdadeMedia: parseFloat(item.idadeMedia),
      IndiceIdea: indiceIdea,

      Pureza: parseFloat(item.pureza),
      Altitude: parseFloat(item.altitude),
      IIF: parseFloat(item.indiceInfestacaoFinal),
      ChuvaAcumulada: parseFloat(item.chuvaAcumulada),

      // 🔥 NOVOS CAMPOS (Ambiente A/B/C/D/E e Observacao)
      AmbienteA: parseFloat(item.ambienteA),
      AmbienteB: parseFloat(item.ambienteB),
      AmbienteC: parseFloat(item.ambienteC),
      AmbienteD: parseFloat(item.ambienteD),
      AmbienteE: parseFloat(item.ambienteE),
      Observacao: item.observacao || ''
    };
  });

  /**********************************************
  * 3) Atualiza ou cria a DataTable
  **********************************************/
  if ($.fn.DataTable.isDataTable('#dados')) {
    tabela.clear();
    tabela.rows.add(dadosFormatados);
    tabela.draw(false); // Desenha apenas uma vez, sem resetar a paginação
  } else {
    tabela = inicializarTabela();
    tabela.rows.add(dadosFormatados).draw();
  }

  /**********************************************
   * 4) Atualiza o rodapé (tfoot)
   **********************************************/
  $("#totalMoagem").text(
    Math.round(totalMoagem).toLocaleString('pt-BR', { useGrouping: true })
  );
  $("#totalATR_Dia").text(formatarNumero(totalATR_Dia, 2));
  $("#totalATR_Acumulado").text(formatarNumero(totalATR_Acumulado, 2));
  $("#totalTCH_Estimado").text(formatarNumero(totalTCH_Estimado, 2));
  $("#totalTCH_Realizado").text(formatarNumero(totalTCH_Realizado, 2));
  $("#totalIdadeMedia").text(formatarNumero(totalIdadeMedia, 2));
  $("#totalIndiceIdea").text(formatarNumero(totalIndiceIdea, 0));

  // Pureza (2 casas decimais)
  $("#totalPureza").text(formatarNumero(totalPureza, 2));

  // Altitude (sem casas decimais)
  $("#totalAltitude").text(
    parseFloat(totalAltitude || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  );

  // IIF (2 dec + %)
  $("#totalIIF").text(`${formatarNumero(totalIIF, 2)}%`);

  // Chuva (sem dec)
  $("#totalChuva").text(
    parseFloat(totalChuva || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  );

  const corTotal = totalTCH_Variacao >= 0 ? 'green' : 'red';
  const setaTotal = totalTCH_Variacao >= 0 ? '▲' : '▼';

  $("#totalTCH_Variacao").html(`
    <div style="display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: bold;">
      <span style="color: ${corTotal};">${setaTotal}</span>
      <span style="color: black;">${formatarNumero(totalTCH_Variacao, 2)}%</span>
    </div>
  `);

  $('#dados tfoot').show();
}

$(function () {
  $('#dados tbody').on('mouseenter', 'tr', function () {
    $(this).addClass('hovered');
  }).on('mouseleave', 'tr', function () {
    $(this).removeClass('hovered');
  });
});