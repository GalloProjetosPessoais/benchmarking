const Grupos = require('../server/grupos');

const getGrupos = async (req, res) => {
  try {
    const data = await Grupos.getGrupos(req);
    if (data.statusCode === 200 && data.isSuccess) {
      return res.render('grupos/index', {
        title: 'Grupos',
        subtitle: 'Gerenciamento de Grupos',
        data: data.result,
        js: './partials/datatablejs.ejs'
      });
    }
    else {
      return res.redirect('/');
    }
  } catch (error) {
    console.error('Erro de acesso ao Grupos:', error);
  }
};

const getUpsertGrupo = async (req, res, grupo = {}, error = null) => {
  const { id } = req.params;
  if (error == null) {
    if (id == 0) {
      grupo = {
        id: 0,
        descricao: '',
        ativo: true,
      }
    } else {
      try {
        const data = await Grupos.getGrupo(req, id);
        if (data.statusCode == 200 && data.isSuccess) {
          grupo = data.result;
        } else {
          error = data.errorMessages?.join("<br>") || 'Erro ao Buscar Grupo';
        }
      } catch (error) {
        error = { title: 'Problemas internos', message: 'Erro ao carregar dados para a página.' };
      }
    }
  }
  return res.render('grupos/upsert', {
    title: 'Grupos',
    subtitle: id == 0 ? 'Adicionar Grupo' : 'Alterar Grupo',
    grupo,
    error,
  });
}

const postUpsertGrupo = async (req, res) => {
  const { id } = req.params;
  const grupo = req.body;
  grupo.ativo = grupo.ativo === 'true';
  try {
    const data = id == 0 ?
      await Grupos.createGrupo(req, grupo) :
      await Grupos.editGrupo(req, id, grupo);
    if (data.isSuccess) {
      req.session.tempData = { message: `Grupo ${id == 0 ? 'registrado' : 'alterado'} com sucesso!` };
      return res.redirect('/grupos');
    }
    const errorMessage = data.errorMessages?.join("<br>") || 'Erro ao cadastrar Grupo.';
    return getUpsertGrupo(req, res, grupo, { title: 'Problemas no Cadastro', message: errorMessage });
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return getCreateGrupo(req, res, grupo, { title: 'Problemas no Cadastro', message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
}

const deleteGrupo = async (req, res) => {
  const { id } = req.params;
  try {
    // Exclua o registro do banco, usando seu ORM ou diretamente no banco de dados
    const data = await Grupos.deleteGrupo(req, id);
    if (data.isSuccess)
      return res.status(200).json({ message: 'Grupo excluído com Sucesso!' });
    else
      return res.status(500).json({ message: data.errorMessages?.join("<br>") });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    return res.status(500).json({ message: 'Erro ao excluir grupo.' });
  }
}

module.exports = {
  getGrupos,
  getUpsertGrupo,
  postUpsertGrupo,
  deleteGrupo,
};
