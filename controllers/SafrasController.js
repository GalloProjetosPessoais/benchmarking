const Safras = require('../server/safras');

const getSafras = async (req, res) => {
  try {
    const data = await Safras.getSafras(req);
    if (data.statusCode === 200 && data.isSuccess) {
      return res.render('safras/index', {
        title: 'Safras',
        subtitle: 'Gerenciamento de Safras',
        data: data.result,
        js: './partials/datatablejs.ejs'
      });
    }
    else {
      return res.redirect('/');
    }
  } catch (error) {
    console.error('Erro de acesso ao Safras:', error);
  }
};

const getUpsertSafra = async (req, res, safra = {}, error = null) => {
  const { id } = req.params;
  if (error == null) {
    if (id == 0) {
      safra = {
        id: 0,
        descricao: '',
        ativo: true,
      }
    } else {
      try {
        const data = await Safras.getSafra(req, id);
        if (data.statusCode == 200 && data.isSuccess) {
          safra = data.result;
        } else {
          error = data.errorMessages?.join("<br>") || 'Erro ao Buscar Safra';
        }
      } catch (error) {
        error = { title: 'Problemas internos', message: 'Erro ao carregar dados para a página.' };
      }
    }
  }
  return res.render('safras/upsert', {
    title: 'Safras',
    subtitle: id == 0 ? 'Adicionar Safra' : 'Alterar Safra',
    safra,
    error,
  });
}

const postUpsertSafra = async (req, res) => {
  const { id } = req.params;
  const safra = req.body;
  safra.ativo = safra.ativo === 'true';
  try {
    const data = id == 0 ?
      await Safras.createSafra(req, safra) :
      await Safras.editSafra(req, id, safra);
    if (data.isSuccess) {
      req.session.tempData = { message: `Safra ${id == 0 ? 'registrada' : 'alterada'} com sucesso!` };
      return res.redirect('/safras');
    }
    const errorMessage = data.errorMessages?.join("<br>") || 'Erro ao cadastrar Safra.';
    return getUpsertSafra(req, res, safra, { title: 'Problemas no Cadastro', message: errorMessage });
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return getCreateSafra(req, res, safra, { title: 'Problemas no Cadastro', message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
}

const deleteSafra = async (req, res) => {
  const { id } = req.params;
  try {
    // Exclua o registro do banco, usando seu ORM ou diretamente no banco de dados
    const data = await Safras.deleteSafra(req, id);
    if (data.isSuccess)
      return res.status(200).json({ message: 'Safra excluído com Sucesso!' });
    else
      return res.status(500).json({ message: data.errorMessages?.join("<br>") });
  } catch (error) {
    console.error('Erro ao excluir safra:', error);
    return res.status(500).json({ message: 'Erro ao excluir safra.' });
  }
}

module.exports = {
  getSafras,
  getUpsertSafra,
  postUpsertSafra,
  deleteSafra,
};
