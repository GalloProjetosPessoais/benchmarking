const server = require('../server/index');
const url = 'empresas';

const getEmpresas = async (req) => {
    return await server.get(req.cookies.authToken, `${url}`);
}

const getEmpresa = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/${id}`);
}

const getEmpresaPorGrupo = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/grupo/${id}`);
}

const createEmpresa = async (req, empresa) => {
    return await server.post(req.cookies.authToken, `${url}`, empresa);
};

const editEmpresa = async (req, id, empresa) => {
    return await server.put(req.cookies.authToken, `${url}/${id}`, empresa);
};

const deleteEmpresa = async (req, id) => {
    return await server.del(req.cookies.authToken, `${url}/${id}`);
}

module.exports = {
    getEmpresas,
    getEmpresa,
    getEmpresaPorGrupo,
    createEmpresa,
    editEmpresa,
    deleteEmpresa
};