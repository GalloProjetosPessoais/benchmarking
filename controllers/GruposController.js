const Grupos = require('../server/grupos');

const getGrupos = async (req, res) => {
  try {
    const data = await Grupos.getGrupos(req);
    if (data.statusCode === 200 && data.isSuccess) {
      return res.render('grupos/index', {
        title: 'Grupos',
        subtitle: 'Gerenciamento de Grupos',
        data: data.result,
        useDatatable: true
      });
    }
    else {
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao Buscar Grupos');
    }
  } catch (error) {
    req.session.error = { title: 'Problema ao Carregar Grupos', message: error };
    console.error('Erro de acesso ao Grupos:', error);
    return res.redirect('/');
  }
};

const getUpsertGrupo = async (req, res) => {
  const { id } = req.params;
  let grupo = req.session.grupoData || {};
  delete req.session.grupoData;

  if (!grupo.id && id == 0) {
    grupo = {
      id: 0,
      descricao: '',
      ativo: true,
    };
  } else if (!grupo.id) {
    try {
      const data = await Grupos.getGrupo(req, id);
      if (data.statusCode == 200 && data.isSuccess) {
        grupo = data.result;
      } else {
        req.session.error = {
          title: 'Problemas ao Buscar Grupo',
          message: data.errorMessages?.join('<br>') || 'Erro desconhecido ao carregar os dados do Grupo.',
        };
        return res.redirect('/grupos');
      }
    } catch (err) {
      req.session.error = {
        title: 'Erro Interno',
        message: 'Falha ao carregar os dados para a página. Tente novamente mais tarde.',
      };
      return res.redirect('/grupos');
    }
  }
  return res.render('grupos/upsert', {
    title: 'Grupos',
    subtitle: id == 0 ? 'Adicionar Grupo' : 'Alterar Grupo',
    grupo,
  });
}

const postUpsertGrupo = async (req, res) => {
  const { id } = req.params;
  const grupo = req.body;
  grupo.ativo = grupo.ativo === 'true';
  try {
    const data = id == 0
      ? await Grupos.createGrupo(req, grupo)
      : await Grupos.editGrupo(req, id, grupo);
    if (data.isSuccess) {
      req.session.success = { title: 'Sucesso', message: `Grupo ${id == 0 ? 'adicionado' : 'atualizado'} com sucesso!` };
      return res.redirect('/grupos');
    }
    req.session.error = {
      title: 'Problemas no Cadastro',
      message: data.errorMessages?.join('<br>') || 'Erro ao Cadastrar Grupo.',
    };
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
  }
  req.session.grupoData = grupo;
  return res.redirect(`/grupos/upsert/${id}`);
}

const deleteGrupo = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Grupos.deleteGrupo(req, id);
    if (data.isSuccess)
      req.session.success = { title: 'Grupo excluído com Sucesso!', message: 'A exclusão foi realizada com êxito.' };
    else
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao tentar Excluir Grupo');
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    req.session.error = { title: "Erro ao Tentar Excluir Grupo", message: error };
  }
  return res.redirect('/grupos');
}

module.exports = {
  getGrupos,
  getUpsertGrupo,
  postUpsertGrupo,
  deleteGrupo,
};
