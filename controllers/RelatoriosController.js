const Safras = require("../server/safras");
const Grupos = require("../server/grupos");
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

const getRelatoriosData = async (req, res) => {
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
    if (response.isSuccess) {
      const dados = {
        dados: response.result,
        mediaAtrAcumulado: response.result.length
          ? response.result.reduce(
            (acc, item) => acc + (item.atrAcumulado || 0),
            0
          ) / response.result.length
          : 0,
        mediaIndiceInfestacao: response.result.length
          ? response.result.reduce(
            (acc, item) => acc + (item.indiceInfestacaoFinal || 0),
            0
          ) / response.result.length
          : 0,
        mediaChuvaAcumulada: response.result.length
          ? response.result.reduce(
            (acc, item) => acc + (item.chuvaAcumulada || 0),
            0
          ) / response.result.length
          : 0,
        mediaImpurezaVegetal: response.result.length
          ? response.result.reduce(
            (acc, item) => acc + (item.impurezaVegetal || 0),
            0
          ) / response.result.length
          : 0,
        mediaImpurezaMineral: response.result.length
          ? response.result.reduce(
            (acc, item) => acc + (item.impurezaMineral || 0),
            0
          ) / response.result.length
          : 0,
        mediaPureza: response.result.length
          ? response.result.reduce((acc, item) => acc + (item.pureza || 0), 0) /
          response.result.length
          : 0,
      };
      //console.log(dados);
      return res.json(dados);
    }
    return res
      .status(404)
      .json({ message: "Erro ao buscar dados do período." });
  } catch (error) {
    //console.error("Erro ao buscar dados do período:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};


module.exports = {
  getRelatorios,
  getRelatoriosData,
};
