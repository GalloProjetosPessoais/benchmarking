const server = require('../server/index');
const url = 'periodos_safras';

const getPeriodo = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/${id}`);
}

const getPeriodosPorSafra = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/safra/${id}`);
}

const generatePeriodos = async (req, dados) => {
    return await server.post(req.cookies.authToken, `safras/gerarPeriodos`, dados)
};

const editPeriodo = async (req, id, periodo) => {
    return await server.put(req.cookies.authToken, `${url}/${id}`, periodo);
}

const deletePeriodo = async (req, id) => {
    return await server.del(req.cookies.authToken, `${url}/${id}`);
}

const ativarPeriodo = async (req, id) => {
    return await server.post(req.cookies.authToken, `${url}/${id}`, null);
}

module.exports = {
    getPeriodo,
    getPeriodosPorSafra,
    generatePeriodos,
    editPeriodo,
    deletePeriodo,
    ativarPeriodo,
};


