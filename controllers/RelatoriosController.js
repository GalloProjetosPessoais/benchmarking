const Safras = require("../server/safras");
const Grupos = require("../server/grupos");
const Ambientes = require("../server/ambientes");
const Dados = require("../server/dadosAgricolas");

const getRelatorios = async (req, res) => {
  try {
    const safras = await Safras.getSafras(req);
    const grupos = await Grupos.getGrupos(req);
    return res.render("relatorios/index", {
      title: "Relatórios",
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
        "/js/relatorios.js",
      ],
      css: ["/css/select2.css", "/css/global.css"],
    });
  } catch (error) {
    req.session.error = { title: "Problema ao Carregar Dados", message: error };
    console.error("Erro de acesso:", error);
    return res.redirect("/");
  }
};

const getRelatoriosPartial = async (req, res) => {
  const { periodoId, grupoId, empresaId } = req.query;
  try {
    if (!periodoId) {
      return res
        .status(400)
        .send("Parâmetros inválidos: periodoId é obrigatório.");
    }
    let response;
    if (grupoId == undefined && empresaId == undefined)
      response = await Dados.getDadosPorPeriodo(req, periodoId);
    else if (empresaId == undefined)
      response = await Dados.getDadosPorPeriodoGrupo(req, periodoId, grupoId);
    else if (grupoId == undefined)
      response = await Dados.getDadosPorPeriodoEmpresa(
        req,
        periodoId,
        empresaId
      );

    const dados = response.isSuccess ? response.result : null;
    console.log(dados);
    return res.render("relatorios/graficos", {
      layout: false,
      dados,
    });
  } catch (error) {
    console.error("Erro ao carregar a partial relatórios:", error);
    return res.status(500).send("Erro interno ao carregar a partial.");
  }
};

module.exports = {
  getRelatorios,
  getRelatoriosPartial,
};
