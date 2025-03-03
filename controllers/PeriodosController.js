const Safras = require('../server/safras');
const Periodos = require('../server/periodos');

const getPeriodosSafra = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Safras.getSafra(req, id);
    if (data.statusCode === 200 && data.isSuccess) {
      const periodos = await Periodos.getPeriodosPorSafra(req, id);
      return res.render('safras/periodos', {
        title: 'Planejamento',
        subtitle: `Gerenciamento de Perídos da Safra ${data.result.ano}`,
        safra: data.result,
        data: periodos.result,
        useDatatable: true,
        customJs: '/js/datatables-periodos.js'
      });
    }
    else {
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao Buscar Períodos Safra');
    }
  } catch (error) {
    req.session.error = { title: 'Problema ao Carregar Períodos', message: error };
      console.error('Erro de acesso ao Períodos Safras:', error);
      return res.redirect('/');
  }  
}

const postGerarPeriodos = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  try {
      const data = await Periodos.generatePeriodos(req, dados);
      if (data.isSuccess) {
        req.session.success = { title: `Safra ${dados.anoSafra}`, message: `Períodos Gerados com Sucesso!` };
      } else {
        req.session.error = { title: `Safra ${dados.anoSafra}`, message: data.errorMessages?.join("<br>") || 'Erro ao Gerar Períodos.' };
      }
      return res.redirect(`/safras/periodos/${id}`);
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
      req.session.error = { title: `Safra ${dados.anoSafra}`, message: error };
      return res.redirect(`/safras/periodos/${id}`);
    }
}


const getDadosPeriodosPorSafra = async (req, res) => {
  const { id } = req.params;
  try {
    const periodos = await Periodos.getPeriodosPorSafra(req, id);
    if (periodos.isSuccess) {
      return res.json(periodos.result);
    }
    res.status(400).json({ message: 'Erro ao buscar períodos da safra.' });
  } catch (error) {
    console.error('Erro ao buscar períodos da safra:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

const deletePeriodo = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Periodos.deletePeriodo(req, id);
    if (data.isSuccess)
      req.session.success = { title: 'Período excluído com Sucesso!', message: 'A exclusão foi realizada com êxito.' };
    else
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao tentar Excluir Período');
  } catch (error) {
    console.error('Erro ao excluir safra:', error);
    req.session.error = { title: "Erro ao Tentar Excluir a Período", message: error };
  }
  return res.redirect(`/safras/periodos/${periodo.safraId}`);
}

const ativarPeriodo = async (req, res) => {
  const { id } = req.params;
  const periodo = await Periodos.getPeriodo(req, id);
  try {
      const data = await Periodos.ativarPeriodo(req, id);
      if (data.isSuccess) {
        req.session.success = { title: 'Sucesso', message: `Período ativado com sucesso!` };
      } else {
        req.session.error = {
          title: 'Problemas ao ativar',
          message: data.errorMessages?.join('<br>') || 'Erro ao ativar período.',
        };
      }
      return res.redirect(`/safras/periodos/${periodo.result.safraId}`);
    } catch (error) {
      req.session.error = { title: 'Problema ao Ativar Empresas Safras', message: error };
      console.error('Erro de acesso a Empresas Safras:', error);
      return res.redirect(`/safras/empresas/${periodo.result.safraId}`);
    }
}


module.exports = {
  getPeriodosSafra,
  postGerarPeriodos,
  getDadosPeriodosPorSafra,
  deletePeriodo,
  ativarPeriodo,
};
