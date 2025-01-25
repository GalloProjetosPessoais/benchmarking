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

module.exports = {
  getPeriodosSafra,
  postGerarPeriodos,
};
