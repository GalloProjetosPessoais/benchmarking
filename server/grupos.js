const server = require('../server/index');
const url = 'grupos';

const getGrupos = async (req) => {
    return await server.get(req.cookies.authToken, `${url}`);
}

const getGrupo = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/${id}`);
}

const createGrupo = async (req, grupo) => {
    return await server.post(req.cookies.authToken, `${url}`, grupo);
};

const editGrupo = async (req, id, grupo) => {
    return await server.put(req.cookies.authToken, `${url}/${id}`, grupo);
};

const deleteGrupo = async (req, id) => {
    return await server.del(req.cookies.authToken, `${url}/${id}`);
}

module.exports = {
    getGrupos,
    getGrupo,
    createGrupo,
    editGrupo,
    deleteGrupo
};