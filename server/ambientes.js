const server = require('../server/index');
const url = 'ambientes_producao';

const getAmbientes = async (req) => {
    return await server.apiCallGet(req.cookies.authToken, `${url}`);
}


module.exports = {
    getAmbientes,
};


