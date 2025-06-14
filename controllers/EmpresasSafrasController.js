const Safras = require("../server/safras");
const EmpresasSafra = require("../server/empresaSafras");

const getEmpresasSafra = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Safras.getSafra(req, id);
    if (data.statusCode === 200 && data.isSuccess) {
      const periodos = await EmpresasSafra.getEmpresasSafras(req, id);
      if (periodos.statusCode == 404)
        return res.redirect(`/safras/periodos/${id}`);
      return res.render("safras/empresas", {
        title: "Planejamento",
        subtitle: `Gerenciamento de Períodos da Safra ${data.result.ano}`,
        data: periodos.result,
        useDatatable: true,
        customJs: "/js/datatables-planejamento.js",
      });
    } else {
      throw new Error(
        data.errorMessages?.join("<br>") || "Erro ao Buscar Empresas Safra"
      );
    }
  } catch (error) {
    req.session.error = {
      title: "Problema ao Carregar Empresas Safras",
      message: error,
    };
    console.error("Erro de acesso a Empresas Safras:", error);
    return res.redirect("/");
  }
};

const ativarEmpresaPeriodo = async (req, res) => {
  const { id } = req.params;
  try {
    const periodo = await EmpresasSafra.getEmpresaSafra(req, id);
    const empresaSafra = {
      id: periodo.result.id,
      periodoSafraId: periodo.result.periodoSafraId,
      empresaId: periodo.result.empresaId,
      ativo: true,
    };
    const data = await EmpresasSafra.editEmpresaSafra(req, id, empresaSafra);
    if (data.isSuccess) {
      req.session.success = {
        title: "Sucesso",
        message: `Empresa Período ativado com sucesso!`,
      };
    } else {
      req.session.error = {
        title: "Problemas ao ativar",
        message: data.errorMessages?.join("<br>") || "Erro ao ativar período.",
      };
    }
    return res.redirect(
      `/safras/empresas/${periodo.result.periodoSafra.safraId}`
    );
  } catch (error) {
    req.session.error = {
      title: "Problema ao Ativar Empresas Safras",
      message: error,
    };
    console.error("Erro de acesso a Empresas Safras:", error);
    return res.redirect(
      `/safras/empresas/${periodo.result.periodoSafra.safraId}`
    );
  }
};

const desativarEmpresaPeriodo = async (req, res) => {
  const { id } = req.params;
  try {
    const periodo = await EmpresasSafra.getEmpresaSafra(req, id);
    const empresaSafra = {
      id: periodo.result.id,
      periodoSafraId: periodo.result.periodoSafraId,
      empresaId: periodo.result.empresaId,
      ativo: false,
    };
    const data = await EmpresasSafra.editEmpresaSafra(req, id, empresaSafra);
    if (data.isSuccess) {
      req.session.success = {
        title: "Sucesso",
        message: `Empresa Período desativado com sucesso!`,
      };
    } else {
      req.session.error = {
        title: "Problemas ao desativar",
        message:
          data.errorMessages?.join("<br>") || "Erro ao desativar período.",
      };
    }
    return res.redirect(
      `/safras/empresas/${periodo.result.periodoSafra.safraId}`
    );
  } catch (error) {
    req.session.error = {
      title: "Problema ao Desativar Empresas Safras",
      message: error,
    };
    console.error("Erro de acesso a Empresas Safras:", error);
    return res.redirect(
      `/safras/empresas/${periodo.result.periodoSafra.safraId}`
    );
  }
};

const getPeriodosPorSafraEmpresa = async (req, res) => {
  const { safraId, empresaId } = req.params;
  try {
    const data = await EmpresasSafra.getEmpresaSafraPeriodos(
      req,
      safraId,
      empresaId
    );
    if (data.isSuccess) {
      return res.json(data.result);
    }
    return res
      .status(400)
      .json({ message: "Erro ao buscar períodos da safra." });
  } catch (error) {
    console.error("Erro ao buscar períodos da safra:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const ativarEmpresasPeriodo = async (req, res) => {
  const ids = req.body;
  safraId = ids.safra;
  delete ids.safra;
  try {
    const data = await EmpresasSafra.activateEmpresaSafra(req, ids);
    if (data.isSuccess) {
      req.session.success = {
        title: "Sucesso",
        message: `Empresas Selecionadas Ativadas com sucesso!`,
      };
    } else {
      req.session.error = {
        title: "Problemas ao Ativar",
        message:
          data.errorMessages?.join("<br>") || "Erro ao Ativar Empresas Selecionadas.",
      };
    }
    return res.json({ redirectUrl: `/safras/empresas/${safraId}` });
  } catch (error) {
    console.error("Erro ao buscar períodos da safra:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};




module.exports = {
  getEmpresasSafra,
  ativarEmpresaPeriodo,
  desativarEmpresaPeriodo,
  getPeriodosPorSafraEmpresa,
  ativarEmpresasPeriodo,
};
