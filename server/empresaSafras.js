const server = require('../server/index');
const url = 'empresas_safras';

const getEmpresasSafras = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/safra/${id}`);
}


module.exports = {
    getEmpresasSafras,
};


