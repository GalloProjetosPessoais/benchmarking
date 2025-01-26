const server = require('../server/index');
const url = 'ambientes_producao';

const getAmbientes = async (req) => {
    return await server.get(req.cookies.authToken, url);
}

const getAmbientesProSafraEmpresa = async (req, safraId, empresaId) => {
    return await server.get(req.cookies.authToken, `${url}/safra_empresa/${safraId}/${empresaId}`);
}

const createAmbiente = async (req, data) => {
    return await server.post(req.cookies.authToken, url, data);
};

const editAmbiente = async (req, id, data) => {
    return await server.put(req.cookies.authToken, `${url}/${id}`, data);
};

module.exports = {
    getAmbientes,
    getAmbientesProSafraEmpresa,
    createAmbiente,
    editAmbiente,
};


