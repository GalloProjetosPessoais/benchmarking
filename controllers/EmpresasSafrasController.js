const Safras = require('../server/safras');
const EmpresasSafra = require('../server/empresaSafras');

const getEmpresasSafra = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Safras.getSafra(req, id);
    if (data.statusCode === 200 && data.isSuccess) {
      const periodos = await EmpresasSafra.getEmpresasSafras(req, id);
      if (periodos.statusCode == 404)
        return res.redirect(`/safras/periodos/${id}`);
      return res.render('safras/empresas', {
        title: 'Planejamento',
        subtitle: `Gerenciamento de Períodos da Safra ${data.result.ano}`,
        data: periodos.result,
        useDatatable: true
      });
    }
    else {
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao Buscar Empresas Safra');
    }
  } catch (error) {
    req.session.error = { title: 'Problema ao Carregar Empresas Safras', message: error };
    console.error('Erro de acesso a Empresas Safras:', error);
    return res.redirect('/');
  }  
}

module.exports = {
  getEmpresasSafra,
};
