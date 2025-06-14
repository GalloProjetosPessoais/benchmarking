const Empresas = require("../server/empresas");
const Grupos = require("../server/grupos");

const getEmpresas = async (req, res) => {
  try {
    const data = await Empresas.getEmpresas(req);
    if (data.statusCode === 200 && data.isSuccess) {
      return res.render("empresas/index", {
        title: "Empresas",
        subtitle: "Gerenciamento de Empresas",
        data: data.result,
        useDatatable: true,
      });
    } else {
      throw new Error(
        data.errorMessages?.join("<br>") || "Erro ao Buscar Empresas"
      );
    }
  } catch (error) {
    req.session.error = {
      title: "Problema ao Carregar Empresas",
      message: error,
    };
    console.error("Erro de acesso as Empresas:", error);
    return res.redirect("/");
  }
};

const getUpsertEmpresa = async (req, res) => {
  const { id } = req.params;
  const grupos = await Grupos.getGrupos(req);
  let empresa = req.session.empresaData || {};
  delete req.session.empresaData;

  if (!empresa.id && id == 0) {
    empresa = {
      id: 0,
      nome: "",
      grupoId: 0,
      ativo: true,
    };
  } else if (!empresa.id) {
    try {
      const data = await Empresas.getEmpresa(req, id);
      if (data.statusCode == 200 && data.isSuccess) {
        empresa = data.result;
      } else {
        req.session.error = {
          title: "Problemas ao Buscar Empresa",
          message:
            data.errorMessages?.join("<br>") ||
            "Erro desconhecido ao carregar os dados da Empresa.",
        };
        return res.redirect("/empresas");
      }
    } catch (err) {
      req.session.error = {
        title: "Erro Interno",
        message:
          "Falha ao carregar os dados para a página. Tente novamente mais tarde.",
      };
      return res.redirect("/empresas");
    }
  }
  return res.render("empresas/upsert", {
    title: "Empresas",
    subtitle: id == 0 ? "Adicionar Empresa" : "Alterar Empresa",
    empresa,
    grupos:
      grupos.result.sort((a, b) => a.descricao.localeCompare(b.descricao)) ||
      [],
  });
};

const postUpsertEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresa = req.body;
  empresa.ativo = empresa.ativo === "true";
  try {
    const data =
      id == 0
        ? await Empresas.createEmpresa(req, empresa)
        : await Empresas.editEmpresa(req, id, empresa);
    if (data.isSuccess) {
      req.session.success = {
        title: "Sucesso",
        message: `Empresa ${id == 0 ? "registrada" : "alterada"} com sucesso!`,
      };
      return res.redirect("/empresas");
    }
    req.session.error = {
      title: "Problemas no Cadastro",
      message: data.errorMessages?.join("<br>") || "Erro ao Cadastrar Empresa.",
    };
  } catch (error) {
    console.error("Erro ao processar a solicitação:", error);
    req.session.error = {
      title: "Erro Interno",
      message: "Falha ao processar a solicitação. Tente novamente mais tarde.",
    };
  }
  req.session.empresaData = empresa;
  return res.redirect(`/empresas/upsert/${id}`);
};

const deleteEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Empresas.deleteEmpresa(req, id);
    if (data.isSuccess)
      req.session.success = {
        title: "Empresa excluída com Sucesso!",
        message: "A exclusão foi realizada com êxito.",
      };
    else
      throw new Error(
        data.errorMessages?.join("<br>") || "Erro ao tentar Excluir Safra"
      );
  } catch (error) {
    console.error("Erro ao excluir empresa:", error);
    req.session.error = {
      title: "Erro ao Tentar Excluir a Empresa",
      message: error,
    };
  }
  return res.redirect("/empresas");
};

const getDadosEmpresasPorGrupo = async (req, res) => {
  const { id } = req.params;
  try {
    const empresas = await Empresas.getEmpresaPorGrupo(req, id);
    if (empresas.isSuccess) {
      return res.json(empresas.result);
    }
    res.status(400).json({ message: "Erro ao buscar empresas do grupo." });
  } catch (error) {
    console.error("Erro ao buscar empresas do grupo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const getDadosEmpresasGrupo = async (req, res) => {
  try {
    const empresas = await Empresas.getEmpresas(req);
    if (empresas.isSuccess) {
      return res.json(empresas.result);
    }
    res.status(400).json({ message: "Erro ao buscar empresas." });
  } catch (error) {
    console.error("Erro ao buscar empresas do grupo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

module.exports = {
  getEmpresas,
  getUpsertEmpresa,
  postUpsertEmpresa,
  deleteEmpresa,
  getDadosEmpresasPorGrupo,
  getDadosEmpresasGrupo,
};
