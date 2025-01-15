const Empresas = require('../server/empresas');
const Grupos = require('../server/grupos');

const getEmpresas = async (req, res) => {
  try {
    const data = await Empresas.getEmpresas(req);
    if (data.statusCode === 200 && data.isSuccess) {
      return res.render('empresas/index', {
        title: 'Empresas',
        subtitle: 'Gerenciamento de Empresas',
        data: data.result,
        js: './partials/datatablejs.ejs'
      });
    }
    else {
      return res.redirect('/');
    }
  } catch (error) {
    console.error('Erro de acesso ao Empresas:', error);
  }
};

const getUpsertEmpresa = async (req, res, empresa = {}, error = null) => {
  const { id } = req.params;
  const grupos = await Grupos.getGrupos(req);

  if (error == null) {
    if (id == 0) {
      empresa = {
        id: 0,
        nome: '',
        grupoId: 0,
        ativo: true,
      }
    } else {
      try {
        const data = await Empresas.getEmpresa(req, id);
        if (data.statusCode == 200 && data.isSuccess) {
          empresa = data.result;
        } else {
          error = data.errorMessages?.join("<br>") || 'Erro ao Buscar Empresa';
        }
      } catch (error) {
        error = { title: 'Problemas internos', message: 'Erro ao carregar dados para a página.' };
      }
    }
  }
  return res.render('empresas/upsert', {
    title: 'Empresas',
    subtitle: id == 0 ? 'Adicionar Empresa' : 'Alterar Empresa',
    empresa,
    grupos: grupos.result || [],
    error,
  });
}

const postUpsertEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresa = req.body;
  empresa.ativo = empresa.ativo === 'true';
  try {
    const data = id == 0 ?
      await Empresas.createEmpresa(req, empresa) :
      await Empresas.editEmpresa(req, id, empresa);
    if (data.isSuccess) {
      req.session.tempData = { message: `Empresa ${id == 0 ? 'registrada' : 'alterada'} com sucesso!` };
      return res.redirect('/empresas');
    }
    const errorMessage = data.errorMessages?.join("<br>") || 'Erro ao cadastrar Empresa.';
    return getUpsertEmpresa(req, res, empresa, { title: 'Problemas no Cadastro', message: errorMessage });
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return getCreateEmpresa(req, res, empresa, { title: 'Problemas no Cadastro', message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
}

const deleteEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    // Exclua o registro do banco, usando seu ORM ou diretamente no banco de dados
    const data = await Empresas.deleteEmpresa(req, id);
    if (data.isSuccess)
      return res.status(200).json({ message: 'Empresa excluído com Sucesso!' });
    else
      return res.status(500).json({ message: data.errorMessages?.join("<br>") });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    return res.status(500).json({ message: 'Erro ao excluir empresa.' });
  }
}

module.exports = {
  getEmpresas,
  getUpsertEmpresa,
  postUpsertEmpresa,
  deleteEmpresa,
};
