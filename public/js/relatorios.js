// 1. Lista de CDNs alternativos para cada biblioteca
const CDNS = {
  jspdf: [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
  ],
  domtoimage: [
    //    'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image-more/2.8.0/dom-to-image-more.min.js',
    'https://cdn.jsdelivr.net/npm/dom-to-image-more@2.8.0/dist/dom-to-image-more.min.js'
  ]
};

// 2. Carregador inteligente com fallback
async function carregarBiblioteca(nome, tentativa = 0) {
  try {
    if (window[nome]) return true;

    const url = CDNS[nome][tentativa];
    if (!url) throw new Error('CDNs esgotados');

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        if (!window[nome]) {
          console.error(`${nome} não se registrou globalmente`);
          reject();
        } else {
          resolve();
        }
      };
      script.onerror = () => {
        console.error(`Falha ao carregar ${url}`);
        reject();
      };
      document.head.appendChild(script);
    });

    return true;
  } catch (error) {
    if (tentativa < CDNS[nome].length - 1) {
      return carregarBiblioteca(nome, tentativa + 1);
    }
    throw error;
  }
}

// 3. Verificador de integridade
function verificarBibliotecas() {
  const problemas = [];

  if (!window.jspdf) {
    problemas.push('jspdf não carregado');
  } else if (!window.jspdf.jsPDF) {
    problemas.push('jspdf não inicializado corretamente');
  }

  if (!window.domtoimage) {
    problemas.push('domtoimage não carregado');
  } else if (typeof window.domtoimage.toPng !== 'function') {
    problemas.push('domtoimage incompleto');
  }

  return problemas;
}

// 4. Configuração principal
async function iniciarSistemaPDF() {
  try {
    // Tenta carregar ambas as bibliotecas
    await Promise.all([
      carregarBiblioteca('jspdf'),
      carregarBiblioteca('domtoimage')
    ]);

    // Verificação final
    const erros = verificarBibliotecas();
    if (erros.length > 0) {
      throw new Error(`Problemas nas bibliotecas:\n- ${erros.join('\n- ')}`);
    }

  } catch (error) {
    console.error('Falha crítica:', error);
    alert('Sistema de PDF indisponível. Erro: ' + error.message);
    document.getElementById('btnGerarPDF').disabled = true;
  }
}

async function gerarPDFMultiPaginas() {
  const btn = document.getElementById("btnGerarPDF");
  btn.disabled = true;
  btn.textContent = "GERANDO PDF...";
  showLoading();

  // 1. Salvar estado original
  const tabela = document.getElementById("dados");
  const tabelaWrapper = tabela.parentElement;
  const originalStyles = {
    tabela: {
      width: tabela.style.width,
      overflow: tabela.style.overflow,
      minWidth: tabela.style.minWidth,
      whiteSpace: tabela.style.whiteSpace
    },
    wrapper: {
      width: tabelaWrapper.style.width,
      overflow: tabelaWrapper.style.overflow,
      minWidth: tabelaWrapper.style.minWidth
    },
    cells: []
  };

  // Salvar estado das células
  const cells = tabela.querySelectorAll('th, td');
  cells.forEach(cell => {
    originalStyles.cells.push({
      element: cell,
      whiteSpace: cell.style.whiteSpace
    });
  });

  // Salvar DataTable settings
  const dataTable = $('#dados').DataTable();
  const dtSettings = dataTable.settings()[0];

  try {
    // 2. Preparar tabela para impressão
    dataTable.destroy();

    // Aplicar nowrap diretamente nas células
    cells.forEach(cell => {
      cell.style.whiteSpace = 'nowrap';
    });

    // Ajustar estilos da tabela
    Object.assign(tabela.style, {
      width: "auto",
      overflow: "visible",
      minWidth: "100%"
    });

    Object.assign(tabelaWrapper.style, {
      width: "auto",
      overflow: "visible",
      minWidth: "100%"
    });

    // Ajustar título
    const titulo = document.querySelector('#dtitle');
    if (titulo) {
      titulo.style.whiteSpace = "nowrap";
      titulo.style.width = `${tabela.offsetWidth}px`;
    }

    // Esperar renderização
    await new Promise(resolve => setTimeout(resolve, 300));

    // 3. Gerar PDF
    const pdf = new jspdf.jsPDF("l", "mm", "a4");
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    let yPos = margin + 5;
    let currentPage = 1;

    const safra = $("#safraId option:selected").text().trim();
    const periodo = $("#periodoId option:selected").text().trim();

    const addHeader = () => {
      pdf.setFontSize(12);
      pdf.setTextColor(40);
      pdf.text(`Relatório Benchmarking CMAA - Safra ${safra} - Período ${periodo}`, margin, 12);
    };

    const addFooter = () => {
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Página ${currentPage} - Gerado em: ${new Date().toLocaleDateString()}`, margin, pdf.internal.pageSize.getHeight() - 10);
    };

    const elementos = document.querySelectorAll(".print-section");
    if (!elementos.length) throw new Error("Nenhum conteúdo encontrado");

    addHeader();

    for (let i = 0; i < elementos.length; i++) {
      const elemento = elementos[i];
      await new Promise(resolve => setTimeout(resolve, 300));

      const imgData = await domtoimage.toJpeg(elemento, {
        quality: 0.95,
        width: elemento.scrollWidth,
        height: elemento.scrollHeight,
        style: {
          background: "white",
          transform: "none",
          overflow: "visible"
        },
      });

      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      let imgWidth = pageWidth;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20;
        imgWidth = imgHeight * imgRatio;
      }

      const xPos = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;

      if (i !== 0 && yPos + imgHeight > pageHeight) {
        addFooter();
        pdf.addPage();
        currentPage++;
        yPos = margin + 5;
        addHeader();
      }

      pdf.addImage(imgData, "JPEG", xPos, yPos, imgWidth, imgHeight, "", "FAST");
      yPos += imgHeight + 5;
    }

    addFooter();
    pdf.save(`Benchmarking SFR ${safra} - ${periodo.split(" - ")[1].replaceAll("/", "-")}.pdf`);

  } catch (error) {
    console.error("Erro:", error);
    alert("Falha ao gerar PDF: " + error.message);
  } finally {
    // 4. Restaurar estado original
    try {
      // Restaurar células
      originalStyles.cells.forEach(cellStyle => {
        cellStyle.element.style.whiteSpace = cellStyle.whiteSpace;
      });

      // Restaurar tabela
      Object.assign(tabela.style, originalStyles.tabela);
      Object.assign(tabelaWrapper.style, originalStyles.wrapper);

      // Restaurar título
      const titulo = document.querySelector('#dtitle');
      if (titulo) {
        titulo.style.whiteSpace = "";
        titulo.style.width = "";
      }

      // Reconstruir DataTable
      if (!$.fn.DataTable.isDataTable('#dados')) {
        $('#dados').DataTable({
          responsive: false,
          scrollX: true,
          scrollCollapse: true,
          // ... outras configurações originais
        });
      }

    } catch (e) {
      console.error("Erro ao restaurar:", e);
    }

    btn.disabled = false;
    btn.textContent = "EXPORTAR RELATÓRIO COMPLETO";
    hideLoading();
  }
}




document.addEventListener("DOMContentLoaded", () => {
  iniciarSistemaPDF();
  const selectSafra = document.getElementById("safraId");

  if (selectSafra.options.length > 0) {
    selectSafra.selectedIndex = 0;
    // Atraso pequeno para garantir que o evento seja acionado corretamente
    setTimeout(() => {
      selectSafra.dispatchEvent(new Event("change"));
    }, 10);
  }

  document.querySelector("#safraId").addEventListener("change", async (event) => {
    const safraId = event.target.value;

    try {
      const response = await fetch(`/buscar/periodosSafra/${safraId}`);
      if (!response.ok) throw new Error("Erro ao buscar períodos.");

      let periodos = await response.json();
      const periodoSelect = document.getElementById("periodoId");
      periodoSelect.innerHTML =
        '<option value="" disabled>Selecione um Período</option>';

      if (!periodos.length) {
        document.getElementById("graficos").classList.add("d-none");
        document.getElementById("nada").classList.remove("d-none");
        return;
      }

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

      periodoSelect.dispatchEvent(new Event("change"));

    } catch (error) {
      console.error("Erro ao buscar períodos:", error);
      alert("Erro ao carregar períodos. Tente novamente.");
    }
  });

  document.getElementById("periodoId").addEventListener("change", (event) => {
    const periodoId = event.target.value;
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
    //console.error(error);
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

  // GRÁFICO Produção Estimada X Produção Reestimada
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(b.moagemEstimada) - parseFloat(a.moagemEstimada));
  let empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const moagemEstimada = dadosFiltrados.map((d) => parseFloat(d.moagemEstimada));
  const moagemReestimada = dadosFiltrados.map((d) => parseFloat(d.moagemReestimada));
  atualizarGrafico(
    "graficoProducao",
    ["Produção Estimada", "Produção Reestimada"],
    [moagemEstimada, moagemReestimada],
    ["#AFD46C", "#007344"],
    empresas,
    0,
    "",
    "Toneladas",
    0
  );


  // GRÁFICO Produção Acumulada
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(b.moagemRealizada) - parseFloat(a.moagemRealizada));
  empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const producaoAcumulada = dadosFiltrados.map((d) => parseFloat(d.moagemRealizada));
  atualizarGrafico(
    "graficoProducaoAcumulada",
    ["Produção Acumulada"],
    [producaoAcumulada],
    ["#AFD46C"],
    empresas,
    0,
    "",
    "Toneladas",
    0
  );


  // GRÁFICO TCH Estimado X TCH Realizado
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(b.tchRealizado) - parseFloat(a.tchRealizado));
  let dadosTCH = dadosFiltrados.filter((d) => {
    const estimado = parseFloat(d.tchEstimado);
    const realizado = parseFloat(d.tchRealizado);
    return estimado !== 0 && realizado !== 0; // Mantém se pelo menos um for diferente de 0
  });

  empresas = dadosTCH.map((d) => d.nomeEmpresa);
  const tchEstimado = dadosTCH.map((d) => parseFloat(d.tchEstimado));
  const tchRealizado = dadosTCH.map((d) => parseFloat(d.tchRealizado));
  const todosValores = [...tchEstimado, ...tchRealizado]; // Junta os dois vetores
  const mediaGeralTCH = todosValores.reduce((total, num) => total + num, 0) / todosValores.length;
  atualizarGrafico(
    "graficoTCH",
    ["TCH Estimado", "TCH Realizado"],
    [tchEstimado, tchRealizado],
    ["#AFD46C", "#007344"],
    empresas,
    mediaGeralTCH,
    "TCH Médio",
    "TCH, t/ha",
    1
  );


  // GRÁFICO ATR Médio Acumulado
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(b.atrAcumulado) - parseFloat(a.atrAcumulado));
  empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const atrDia = dadosFiltrados.map((d) => parseFloat(d.atrDia));
  const atrAcumulado = dadosFiltrados.map((d) => parseFloat(d.atrAcumulado));
  const mediaAtrAcumulado = parseFloat(dados.mediaAtrAcumulado);
  atualizarGrafico(
    "graficoATR",
    ["ATR Dia", "ATR Acumulado"],
    [atrDia, atrAcumulado],
    ["#AFD46C", "#007344"],
    empresas,
    mediaAtrAcumulado,
    "ATR Médio",
    "ATR, kg/t",
    1
  );


  // GRÁFICO TAH Médio
  dadosTCH.forEach(d => d.tahCalculado = calcularTAH(d.tchRealizado, d.atrAcumulado));
  dadosTCH = dadosTCH.sort((a, b) => parseFloat(b.tahCalculado) - parseFloat(a.tahCalculado));
  empresas = dadosTCH.map((d) => d.nomeEmpresa);
  const tah = dadosTCH.map((d) => d.tahCalculado);
  const mediaTAH = tah.length > 0 ? tah.reduce((acc, val) => acc + val, 0) / tah.length : 0;
  atualizarGrafico(
    "graficoTAH",
    ["TAH"],
    [tah],
    ["#AFD46C"],
    empresas,
    mediaTAH,
    "Média TAH",
    "t/ha",
    1
  );


  // GRÁFICO Índice de Infestação Final
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(a.indiceInfestacaoFinal) - parseFloat(b.indiceInfestacaoFinal));
  empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const indiceInfestacaoFinal = dadosFiltrados.map((d) => parseFloat(d.indiceInfestacaoFinal));
  const mediaIndiceInfestacao = parseFloat(dados.mediaIndiceInfestacao);
  atualizarGrafico(
    "graficoIndiceInfestacao",
    ["Índice de Infestação Final"],
    [indiceInfestacaoFinal],
    ["#AFD46C"],
    empresas,
    mediaIndiceInfestacao,
    "Média do Índice de Infestação Final",
    "Brocas, %",
    2
  );


  // GRÁFICO Índice Pluviométrico - Acumulado
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(b.chuvaAcumulada) - parseFloat(a.chuvaAcumulada));
  empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const chuvaAcumulada = dadosFiltrados.map((d) => parseFloat(d.chuvaAcumulada));
  const mediaChuvaAcumulada = parseFloat(dados.mediaChuvaAcumulada);
  atualizarGrafico(
    "graficoChuvaAcumulada",
    ["Chuva Acumulada"],
    [chuvaAcumulada],
    ["#AFD46C"],
    empresas,
    mediaChuvaAcumulada,
    "Média de Chuva Acumulada",
    "Precipitação, mm",
    0
  );


  // GRÁFICO IDEA
  dadosTCH.forEach(d => d.idea = calcularIDEA(d.tchRealizado, d.atrAcumulado, d.idadeMedia));
  dadosTCH = dadosTCH.sort((a, b) => parseFloat(b.idea) - parseFloat(a.idea));
  empresas = dadosTCH.map((d) => d.nomeEmpresa);
  const idea = dadosTCH.map((d) => d.idea);
  const mediaIdea = idea.length > 0 ? idea.reduce((acc, val) => acc + val, 0) / idea.length : 0;
  atualizarGrafico(
    "graficoIDEA",
    ["IDEA"],
    [idea],
    ["#AFD46C"],
    empresas,
    mediaIdea,
    "Média IDEA",
    "",
    0
  );


  // GRÁFICO Impureza Mineral
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(a.impurezaMineral) - parseFloat(b.impurezaMineral));
  empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const impurezaMineral = dadosFiltrados.map((d) => parseFloat(d.impurezaMineral));
  const mediaMineral = parseFloat(dados.mediaImpurezaMineral);
  atualizarGrafico(
    "graficoImpurezasMineral",
    ["Impureza Mineral"],
    [impurezaMineral],
    ["#AFD46C"],
    empresas,
    mediaMineral,
    "Média de Impureza Mineral",
    "Impureza Mineral (kg/t)",
    2
  );


  // GRÁFICO Impureza Vegetal
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(a.impurezaVegetal) - parseFloat(b.impurezaVegetal));
  empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const impurezaVegetal = dadosFiltrados.map((d) => parseFloat(d.impurezaVegetal));
  const mediaVegetal = parseFloat(dados.mediaImpurezaVegetal);
  atualizarGrafico(
    "graficoImpurezasVegetal",
    ["Impureza Vegetal"],
    [impurezaVegetal],
    ["#AFD46C"],
    empresas,
    mediaVegetal,
    "Média da Impureza Vegetal",
    "Impureza Vegetal (kg/t)",
    2
  );


  // GRÁFICO Pureza
  dadosFiltrados = dadosFiltrados.sort((a, b) => parseFloat(a.pureza) - parseFloat(b.pureza));
  empresas = dadosFiltrados.map((d) => d.nomeEmpresa);
  const pureza = dadosFiltrados.map((d) => parseFloat(d.pureza));
  const mediaPureza = parseFloat(dados.mediaPureza);
  atualizarGrafico(
    "graficoPureza",
    ["Pureza"],
    [pureza],
    ["#AFD46C"],
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

  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const ctx = canvasElement.getContext("2d");
  Chart.register(ChartDataLabels);

  let datasets = [];

  // **Adicionar barras primeiro**
  dataLabels.forEach((label, index) => {

    let fontSize = 12;
    if (window.innerWidth <= 768 && dataValues[0].length > 10) {
      fontSize = 8; 
    }
    datasets.push({
      label: label,
      data: dataValues[index],
      backgroundColor: dataColors[index],
      order: 1,
      yAxisID: "y",
      datalabels: {
        anchor: "start",
        align: "end",
        color: "#000",
        font: {
          weight: "bold",
          size: fontSize,
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

  // **Adicionar linha da média POR CIMA**
  if (mediaValue > 0 && mediaLabel != "") {
    datasets.unshift({
      label: mediaLabel,
      data: Array(dataValues[0].length).fill(mediaValue),
      type: "line",
      borderColor: "red",
      borderWidth: 3,
      borderDash: [5, 5],
      fill: false,
      pointStyle: "circle",
      pointRadius: 3,
      pointBackgroundColor: "red",
      yAxisID: "y",
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
            // font: {
            //   size: 12
            // }
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: Math.max(...dataValues.flat()) * 1.2,
          title: {
            display: true,
            text: legend,
            font: {
              size: 12,
            },
          },
        },
      }
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
    if (empresa.ativo && empresa.grupo.ativo) {
      const option = document.createElement("option");
      option.value = empresa.id;
      option.textContent = empresa.nome;
      empresasSelect.appendChild(option);
    }
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
    const tabela = $('#dados').DataTable({
      pageLength: 50,
      lengthMenu: [10, 25, 50, 100],
      responsive: false,
      autoWidth: false,
      scrollX: true,
      language: { url: '../../lib/datatables.json' },
      layout: {
        topStart: 'pageLength',
        topEnd: 'search',
        top2End: {
          buttons: [
            {
              extend: 'copy', exportOptions: { columns: ':visible(:not(.not-export-col))' },
              format: {
                format: {
                  body: function (data, row, column, node) {
                    if (column === 10 || column === 13) return data.replace(/<\/?[^>]+(>|$)/g, '').replace(/[▲▼●]/g, '').trim();
                    return typeof data === 'string'
                      ? data.replace(/\./g, '').replace(',', '.')
                      : data;
                  },
                  footer: function (data, row, column, node) {
                    const i = $(column).attr('data-dt-column');
                    if (i == 10 || i == 13) return data.replace(/<\/?[^>]+(>|$)/g, '').replace(/[▲▼●]/g, '').trim();
                    return typeof data === 'string'
                      ? data.replace(/\./g, '').replace(',', '.')
                      : data;
                  }
                }
              }
            },
            {
              extend: 'csv', exportOptions: { columns: ':visible(:not(.not-export-col))' },
              format: {
                format: {
                  body: function (data, row, column, node) {
                    if (column === 10 || column === 13) return data.replace(/<\/?[^>]+(>|$)/g, '').replace(/[▲▼●]/g, '').trim();
                    return typeof data === 'string'
                      ? data.replace(/\./g, '').replace(',', '.')
                      : data;
                  },
                  footer: function (data, row, column, node) {
                    const i = $(column).attr('data-dt-column');
                    if (i == 10 || i == 13) return data.replace(/<\/?[^>]+(>|$)/g, '').replace(/[▲▼●]/g, '').trim();
                    return typeof data === 'string'
                      ? data.replace(/\./g, '').replace(',', '.')
                      : data;
                  }
                }
              }
            },
            {
              extend: 'excel', exportOptions: {
                columns: ':visible(:not(.not-export-col))',
                format: {
                  body: function (data, row, column, node) {
                    if (column === 10 || column === 13) return data.replace(/<\/?[^>]+(>|$)/g, '').replace(/[▲▼●]/g, '').trim();
                    return typeof data === 'string'
                      ? data.replace(/\./g, '').replace(',', '.')
                      : data;
                  },
                  footer: function (data, row, column, node) {
                    const i = $(column).attr('data-dt-column');
                    if (i == 10 || i == 13) return data.replace(/<\/?[^>]+(>|$)/g, '').replace(/[▲▼●]/g, '').trim();
                    return typeof data === 'string'
                      ? data.replace(/\./g, '').replace(',', '.')
                      : data;
                  }
                }
              }
            },
            {
              extend: 'pdf', exportOptions: { columns: ':visible(:not(.not-export-col))' }, orientation: 'landscape', pageSize: 'A4',
              customize: function (doc) {
                doc.defaultStyle.fontSize = 8;
                doc.styles.tableHeader.fontSize = 10;
                doc.pageMargins = [10, 10, 10, 10];
              }
            },
            { extend: 'print', exportOptions: { columns: ':visible(:not(.not-export-col))' }, orientation: 'landscape', pageSize: 'A4' },
            { extend: 'colvis', text: "Campos" }
          ],
        },
        top2Start: function () {
          let toolbar = document.createElement('div');
          toolbar.classList.add('row');
          toolbar.innerHTML = `<button class="btn btn-primary" id="btnGerarPDF" onclick="gerarPDFMultiPaginas()">
              <i class="bx bx-report"></i> EXPORTAR RELATÓRIO COMPLETO
            </button>`;
          return toolbar;
        },
        bottomStart: 'info',
        bottomEnd: 'paging'
      },
      order: [[4, 'desc']],
      columns: [
        { data: 'Usina', title: 'Usina', className: 'text-center' },
        { data: 'InicioSafra', title: 'Início Safra', className: 'text-center' },
        { data: 'MoagemEstimada', title: 'Produção Est. (t)', className: 'text-center' },
        { data: 'MoagemReestimada', title: 'Produção Ree. (t)', className: 'text-center' },
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

            // Tratamento especial para valor zero
            if (valor === 0) {
              return `
                <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                  <span style="color:rgb(188, 141, 0); font-size: 1rem; font-weight: normal;">●</span>
                  <span style="font-weight: normal;">${formatarNumero(valor, 2)}%</span>
                </div>
              `;
            }

            const cor = valor >= 0 ? 'green' : 'red';
            const seta = valor >= 0 ? '▲' : '▼';

            return `
            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
              <span style="color: ${cor}; font-weight: normal;">${seta}</span>
              <span style="font-weight: normal;">${formatarNumero(valor, 2)}%</span>
            </div>`;
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

    tabela.on('draw.dt', function () {
      const dadosVisiveis = tabela.rows({ filter: 'applied' }).data().toArray();
      atualizarTotaisFooter(dadosVisiveis);
    });

    tabela.on('init', function () {
      tabela.columns.adjust().draw();
    });

    return tabela;
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
   * 1) Mapear dados para DataTables
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
      MoagemEstimada: Math.round(parseFloat(item.moagemEstimada) || 0).toLocaleString('pt-BR', { useGrouping: true }),
      MoagemReestimada: Math.round(parseFloat(item.moagemReestimada)).toLocaleString('pt-BR', { useGrouping: true }) || null,
      MoagemAcumulada: Math.round(parseFloat(item.moagemRealizada) || 0).toLocaleString('pt-BR', { useGrouping: true }),
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
    tabela.draw(false);

    // Atualiza os totais com todos os dados iniciais
    atualizarTotaisFooter(dadosFormatados);
  } else {
    tabela = inicializarTabela();
    tabela.rows.add(dadosFormatados).draw();
    atualizarTotaisFooter(dadosFormatados);
  }
}

// $(function () {
//   $('#dados tbody').on('mouseenter', 'tr', function () {
//     $(this).addClass('hovered');
//   }).on('mouseleave', 'tr', function () {
//     $(this).removeClass('hovered');
//   });
// });







function normalizarNumero(valor) {
  // Se já for número, retorna direto
  if (typeof valor === 'number') return valor;

  // Se for null/undefined/string vazia, retorna 0
  if (!valor && valor !== 0) return 0;

  // Converte para string e faz os tratamentos
  const valorString = String(valor)
    .replace(/\./g, '')     // Remove pontos de milhar
    .replace(',', '.')      // Troca vírgula decimal por ponto
    .replace(/%/g, '')      // Remove porcentagem
    .replace(/[^\d.-]/g, ''); // Remove qualquer caractere não numérico exceto ponto e sinal

  return parseFloat(valorString) || 0;
}

function calcularMediaIgnorandoZeros(dados, campo) {
  let sum = 0;
  let count = 0;

  dados.forEach(item => {
    const valor = normalizarNumero(item[campo]);
    if (valor !== 0) {
      sum += valor;
      count++;
    }
  });

  return count > 0 ? sum / count : 0;
}


function atualizarTotaisFooter(dados) {
  if (!dados || dados.length === 0) {
    $('#dados tfoot').hide();
    return;
  }
  /**********************************************
   * 1) Calcular totais e médias usando parseFloat
   **********************************************/
  let totalEstimado = Math.round(
    dados.reduce((total, item) => total + normalizarNumero(item.MoagemEstimada), 0)
  );
  let totalReestimado = Math.round(
    dados.reduce((total, item) => total + normalizarNumero(item.MoagemReestimada), 0)
  );
  let totalMoagem = Math.round(
    dados.reduce((total, item) => total + normalizarNumero(item.MoagemAcumulada), 0)
  );

  let totalATR_Dia = dados.reduce((total, item) => total + normalizarNumero(item.ATR_Dia), 0) / dados.length;
  let totalATR_Acumulado = dados.reduce((total, item) => total + normalizarNumero(item.ATR_Acumulado), 0) / dados.length;
  let totalTCH_Estimado = calcularMediaIgnorandoZeros(dados, 'TCH_Estimado');
  let totalTCH_Realizado = calcularMediaIgnorandoZeros(dados, 'TCH_Realizado');
  let totalTCH_Variacao = calcularMediaIgnorandoZeros(dados, 'TCH_Variacao');
  let totalIdadeMedia = dados.reduce((total, item) => total + normalizarNumero(item.IdadeMedia), 0) / dados.length;

  // Índice IDEA (já existente)
  let totalIndiceIdea = dados.reduce((soma, item) => {
    const tchReal = parseFloat(item.TCH_Realizado) || 0;
    const atrAcu = parseFloat(item.ATR_Acumulado) || 0;
    const idade = parseFloat(item.IdadeMedia) || 0;
    return soma + (tchReal + atrAcu * 0.67 + idade * 10);
  }, 0) / dados.length;

  // 🔥 Totais (médias) para Pureza e Altitude (já incluídos)
  let totalPureza = dados.reduce((total, item) => total + (parseFloat(item.Pureza) || 0), 0) / dados.length;
  //let totalAltitude = dados.reduce((total, item) => total + (parseFloat(item.Altitude) || 0), 0) / dados.length;

  // 🔥 Totais para IIF e Chuva (já incluídos)
  let totalIIF = dados.reduce((total, item) => total + (parseFloat(item.IIF) || 0), 0) / dados.length;
  let totalChuva = dados.reduce((total, item) => total + (parseFloat(item.ChuvaAcumulada) || 0), 0) / dados.length;

  /**********************************************
     * 4) Atualiza o rodapé (tfoot)
     **********************************************/
  $("#totalEstimado").text(
    Math.round(totalEstimado).toLocaleString('pt-BR', { useGrouping: true })
  );
  $("#totalReestimado").text(
    Math.round(totalReestimado).toLocaleString('pt-BR', { useGrouping: true })
  );
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
  // $("#totalAltitude").text(
  //   parseFloat(totalAltitude || 0).toLocaleString('pt-BR', {
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0
  //   })
  // );

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

  if (totalTCH_Variacao === 0)
    $("#totalTCH_Variacao").html(`
      <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
        <span style="color:rgb(188, 141, 0); font-size: 1rem;">●</span>
        <span style="color:black; ">${formatarNumero(totalTCH_Variacao, 2)}%</span>
      </div>
    `)
  else
    $("#totalTCH_Variacao").html(`
    <div style="display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: bold;">
      <span style="color: ${corTotal};">${setaTotal}</span>
      <span style="color: black;">${formatarNumero(totalTCH_Variacao, 2)}%</span>
    </div>
  `);


  $('#dados tfoot').show();
}


// Supondo que sua sidebar tenha um evento quando é expandida/recolhida
$('#sbIcon').on('click', function () {
  setTimeout(function () {
    if ($.fn.DataTable.isDataTable('#dados')) {
      var table = $('#dados').DataTable();
      table.columns.adjust().draw();
    }
  }, 600); // Pequeno delay para permitir a animação da sidebar
});


$(window).on('resize', function () {
  if ($.fn.DataTable.isDataTable('#dados')) {
    $('#dados').DataTable().columns.adjust().draw();
  }
});