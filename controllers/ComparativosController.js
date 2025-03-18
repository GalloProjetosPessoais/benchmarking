const Safras = require("../server/safras");
const Grupos = require("../server/grupos");
const Dados = require("../server/dadosAgricolas");

const getComparativos = async (req, res) => {
  try {
    const safras = await Safras.getSafras(req);
    const grupos = await Grupos.getGrupos(req);
    return res.render("comparativos/index", {
      title: "Comparativos",
      subtitle: "",
      safras: safras.result.sort((a, b) => b.ano - a.ano),
      grupos: grupos.result.sort((a, b) =>
        a.descricao.localeCompare(b.descricao)
      ),
      empresas: {},
      useDatatable: true,
      js: [
        "/lib/select2.js",
        "/lib/chart.js",
        "/lib/chartjs-plugin-datalabels.js",
        "/js/comparativos.js",
      ],
      css: ["/css/select2.css", "/css/global.css"],
    });
  } catch (error) {
    req.session.error = { title: "Problema ao Carregar Dados", message: error };
    console.error("Erro de acesso:", error);
    return res.redirect("/");
  }
};

const getComparativosData = async (req, res) => {
  const { periodos, grupoId } = req.query;
  try {
    if (!periodos || !grupoId) {
      return res
        .status(400)
        .send("Parâmetros inválidos: periodoId é obrigatório.");
    }
    // Converte periodos para array (caso venha como string)
    const listaPeriodos = Array.isArray(periodos)
      ? periodos
      : periodos.split(",");

    // Executa as consultas para cada periodoId em paralelo
    const responses = await Promise.all(
      listaPeriodos.map((periodoId) =>
        Dados.getDadosPorPeriodoGrupo(req, periodoId, grupoId)
      )
    );

    // Filtra apenas as respostas bem-sucedidas e junta os resultados
    const dados = responses
      .filter((response) => response.isSuccess && response.result) // Apenas resultados válidos
      .flatMap((response) => response.result); // Junta todos os arrays de dados
    return res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados do período:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

module.exports = {
  getComparativos,
  getComparativosData,
};
