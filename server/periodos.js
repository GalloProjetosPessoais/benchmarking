const server = require('../server/index');
const url = 'periodos_safras';

const getPeriodosPorSafra = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/safra/${id}`);
}

const generatePeriodos = async (req, dados) => {
    return await server.post(req.cookies.authToken, `safras/gerarPeriodos`, dados)
};

module.exports = {
    getPeriodosPorSafra,
    generatePeriodos
};


