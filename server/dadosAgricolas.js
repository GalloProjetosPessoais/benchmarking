const server = require('../server/index');
const url = 'dados_agricolas';

const getDados = async (req) => {
    return await server.get(req.cookies.authToken, url);
}

const getDadosPorPeriodo = async (req, periodoId) => {
    return await server.get(req.cookies.authToken, `${url}/periodo/${periodoId}`);
}

const getDadosPorPeriodoGrupo = async (req, periodoId, grupoId) => {
    return await server.get(req.cookies.authToken, `${url}/periodo_grupo/${periodoId}/${grupoId}`);
}

const getDadosPorPeriodoEmpresa = async (req, periodoId, empresaId) => {
    return await server.get(req.cookies.authToken, `${url}/periodo_empresa/${periodoId}/${empresaId}`);
}

const getDadosPorPeriodoAmbiente = async (req, periodoId, ambienteId) => {
    return await server.get(req.cookies.authToken, `${url}/periodo_ambiente/${periodoId}/${ambienteId}`);
}

const createDados = async (req, data) => {
    return await server.post(req.cookies.authToken, url, data);
};

const editDados = async (req, id, data) => {
    return await server.put(req.cookies.authToken, `${url}/${id}`, data);
};

const deleteDados = async (req, id) => {
    return await server.del(req.cookies.authToken, `${url}/${id}`);
};

module.exports = {
    getDados,
    getDadosPorPeriodo,
    getDadosPorPeriodoGrupo,
    getDadosPorPeriodoEmpresa,
    getDadosPorPeriodoAmbiente,
    createDados,
    editDados,
    deleteDados,
};

