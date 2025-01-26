const server = require('../server/index');
const url = 'dados_agricolas';

const getDados = async (req) => {
    return await server.ler(req.cookies.authToken, `${url}`);
}

const getDadosPorPeriodoAmbiente = async (req) => {
    return await server.ler(req.cookies.authToken, `${url}`);
}


module.exports = {
    getDados,
};

