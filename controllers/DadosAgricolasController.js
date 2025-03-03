const Safras = require("../server/safras");
const Grupos = require("../server/grupos");
const Ambientes = require("../server/ambientes");
const Dados = require("../server/dadosAgricolas");

const getDados = async (req, res) => {
  try {
    const safras = await Safras.getSafras(req);
    const grupos = await Grupos.getGrupos(req);
    return res.render("dadosAgricolas/index", {
      title: "Dados Agrícolas",
      subtitle: "Gerenciamento de Dados",
      safras: safras.result.sort((a, b) => b.ano - a.ano),
      grupos: grupos.result.sort((a, b) =>
        a.descricao.localeCompare(b.descricao)
      ),
      empresas: {},
      js: "/js/dados-Agricolas.js",
    });
  } catch (error) {
    req.session.error = { title: "Problema ao Carregar Dados", message: error };
    console.error("Erro de acesso:", error);
    return res.redirect("/");
  }
};

const getAmbienteProducaoPartial = async (req, res) => {
  const { safraId, empresaId, safraAno } = req.query;
  try {
    if (!safraId || !empresaId) {
      return res
        .status(400)
        .send("Parâmetros inválidos: safraId e empresaId são obrigatórios.");
    }
    const response = await Ambientes.getAmbientesProSafraEmpresa(
      req,
      safraId,
      empresaId
    );
    const ambiente = response.isSuccess ? response.result : null;
    // Formatar a data, se existir
    if (ambiente && ambiente.inicioSafra) {
      ambiente.inicioSafra = formatDateForInput(ambiente.inicioSafra);
    }
    return res.render("dadosAgricolas/ambientePartial", {
      layout: false,
      ambiente,
      safraAno,
    });
  } catch (error) {
    console.error("Erro ao carregar a partial ambiente-producao:", error);
    return res.status(500).send("Erro interno ao carregar a partial.");
  }
};

const saveAmbiente = async (req, res) => {
  const ambiente = req.body;
  try {
    // Verifica se já existe um ambiente para a safra e empresa
    const response = await Ambientes.getAmbientesProSafraEmpresa(
      req,
      ambiente.safraId,
      ambiente.empresaId
    );
    let result;
    if (response.isSuccess && response.result) {
      // Alteração
      ambiente.Id = response.result.id;
      result = await Ambientes.editAmbiente(req, response.result.id, ambiente);
    } else {
      if (ambiente.moagemReestimada == "") delete ambiente.moagemReestimada;
      // Cadastro
      result = await Ambientes.createAmbiente(req, ambiente);
    }

    if (result.isSuccess) {
      return res
        .status(200)
        .json({ message: "Ambiente de Produção salvo com sucesso!" });
    } else {
      return res
        .status(400)
        .json({ message: "Falha ao salvar o Ambiente de Produção." });
    }
  } catch (error) {
    console.error("Erro ao salvar Ambiente de Produção:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao salvar o Ambiente de Produção." });
  }
};

const getDadosAgricolasPartial = async (req, res) => {
  const { safraId, empresaId, periodoId } = req.query;
  try {
    const response = await Ambientes.getAmbientesProSafraEmpresa(
      req,
      safraId,
      empresaId
    );
    const ambiente = response.isSuccess ? response.result : null;
    if (ambiente == null)
      throw new Error(
        "A Empresa selecionada não possui um Ambiente de Produção Configurado para a Safra informada!"
      );
    const response2 = await Dados.getDadosPorPeriodoAmbiente(
      req,
      periodoId,
      ambiente.id
    );
    const dados = response2.isSuccess ? response2.result : null;
    return res.render("dadosAgricolas/dadosPartial", {
      layout: false,
      dados,
      ambiente: ambiente,
    });
  } catch (error) {
    console.error("Erro ao carregar a partial dados agrícolas:", error);
    return res.status(500).json({
      message: error.message || "Erro interno ao carregar a partial.",
    });
  }
};

const saveDados = async (req, res) => {
  const dados = req.body;
  try {
    // Verifica se já existe um ambiente para a safra e empresa
    const response = await Dados.getDadosPorPeriodoAmbiente(
      req,
      dados.periodoSafraId,
      dados.ambienteProducaoId
    );
    let result;
    if (response.isSuccess && response.result) {
      // Alteração
      dados.Id = response.result.id;
      result = await Dados.editDados(req, response.result.id, dados);
    } else {
      // Cadastro
      result = await Dados.createDados(req, dados);
    }

    if (result.isSuccess) {
      return res
        .status(200)
        .json({ message: "Dados agrícolas salvos com sucesso!" });
    } else {
      return res
        .status(400)
        .json({ message: "Falha ao salvar os Dados Agrícolas." });
    }
  } catch (error) {
    console.error("Erro ao salvar os Dados Agrícolas:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao salvar os Dados Agrícolas." });
  }
};

module.exports = {
  getDados,
  getAmbienteProducaoPartial,
  saveAmbiente,
  getDadosAgricolasPartial,
  saveDados,
};

const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};
