const server = require('../server/index');
const url = 'empresas_safras';

const getEmpresasSafras = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/safra/${id}`);
}

const getEmpresaSafra = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/${id}`);
}

const editEmpresaSafra = async (req, id, empresaSafra) => {
    return await server.put(req.cookies.authToken, `${url}/${id}`, empresaSafra);
}

module.exports = {
    getEmpresaSafra,
    getEmpresasSafras,
    editEmpresaSafra,
};


