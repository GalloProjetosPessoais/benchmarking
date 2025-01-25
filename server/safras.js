const server = require('../server/index');
const url = 'safras';

const getSafras = async (req) => {
    return await server.get(req.cookies.authToken, `${url}`);
}

const getSafra = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/${id}`);
}

const createSafra = async (req, safra) => {
    return await server.post(req.cookies.authToken, `${url}`, safra);
};

const editSafra = async (req, id, safra) => {
    return await server.put(req.cookies.authToken, `${url}/${id}`, safra);
};

const deleteSafra = async (req, id) => {
    return await server.del(req.cookies.authToken, `${url}/${id}`);
}

module.exports = {
    getSafras,
    getSafra,
    createSafra,
    editSafra,
    deleteSafra
};