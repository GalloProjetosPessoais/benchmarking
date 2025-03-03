const Safras = require('../server/safras');

const getSafras = async (req, res) => {
  try {
    const data = await Safras.getSafras(req);
    if (data.statusCode === 200 && data.isSuccess) {
      return res.render('safras/index', {
        title: 'Planejamento',
        subtitle: 'Gerenciamento de Safras',
        data: data.result,
        useDatatable: true,
        customJs: '/js/datatables-safras.js'
      });
    }
    else {
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao Buscar Safra');
    }
  } catch (error) {
    req.session.error = { title: 'Problema ao Carregar Safras', message: error };
    console.error('Erro de acesso ao Safras:', error);
    return res.redirect('/');
  }
};

const getUpsertSafra = async (req, res) => {
  const { id } = req.params;
  let safra = req.session.safraData || {};
  delete req.session.safraData;

  if (!safra.id && id == 0) {
    safra = {
      id: 0,
      ativo: true,
    };
  } else if (!safra.id) {
    try {
      const data = await Safras.getSafra(req, id);
      if (data.statusCode == 200 && data.isSuccess) {
        safra = data.result;
      } else {
        req.session.error = {
          title: 'Problemas ao Buscar Safra',
          message: data.errorMessages?.join('<br>') || 'Erro desconhecido ao carregar os dados da Safra.',
        };
        return res.redirect('/safras');
      }
    } catch (err) {
      req.session.error = {
        title: 'Erro Interno',
        message: 'Falha ao carregar os dados para a página. Tente novamente mais tarde.',
      };
      return res.redirect('/safras');
    }
  }
  return res.render('safras/upsert', {
    title: 'Planejamento',
    subtitle: id == 0 ? 'Adicionar Safra' : 'Alterar Safra',
    safra,
  });
};

const postUpsertSafra = async (req, res) => {
  const { id } = req.params;
  const safra = req.body;
  safra.ativo = safra.ativo === 'true';
  try {
    const data = id == 0
      ? await Safras.createSafra(req, safra)
      : await Safras.editSafra(req, id, safra);
    if (data.isSuccess) {
      req.session.success = { title: 'Sucesso', message: `Safra ${id == 0 ? 'adicionada' : 'atualizada'} com sucesso!` };
      return res.redirect('/safras');
    }
    req.session.error = {
      title: 'Problemas no Cadastro',
      message: data.errorMessages?.join('<br>') || 'Erro ao Cadastrar Safra.',
    };
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
  }
  req.session.safraData = safra;
  return res.redirect(`/safras/upsert/${id}`);
};

const deleteSafra = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Safras.deleteSafra(req, id);
    if (data.isSuccess)
      req.session.success = { title: 'Safra excluída com Sucesso!', message: 'A exclusão foi realizada com êxito.' };
    else
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao tentar Excluir Safra');
  } catch (error) {
    console.error('Erro ao excluir safra:', error);
    req.session.error = { title: "Erro ao Tentar Excluir a Safra", message: error };
  }
  return res.redirect('/safras');
}

const ativarSafra = async(req, res) => {
  const { id } = req.params;
  try {
    const data = await Safras.getSafra(req, id);
    const safra = data.result;
    safra.ativo = !safra.ativo;
    const edit = await Safras.editSafra(req, id, safra);
    if (edit.isSuccess) {
      req.session.success = { title: 'Sucesso', message: `Safra alterada com sucesso!` };
      return res.redirect('/safras');
    }
    req.session.error = {
      title: 'Problemas ao Alterar',
      message: data.errorMessages?.join('<br>') || 'Erro ao Alterar Safra.',
    };
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
  }
  return res.redirect(`/safras`);
}


module.exports = {
  getSafras,
  getUpsertSafra,
  postUpsertSafra,
  deleteSafra,
  ativarSafra,
};
