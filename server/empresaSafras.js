const server = require("../server/index");
const url = "empresas_safras";

const getEmpresasSafras = async (req, id) => {
  return await server.get(req.cookies.authToken, `${url}/safra/${id}`);
};

const getEmpresaSafra = async (req, id) => {
  return await server.get(req.cookies.authToken, `${url}/${id}`);
};

const getEmpresaSafraPeriodos = async (req, safraId, empresaId) => {
  return await server.get(
    req.cookies.authToken,
    `${url}/safra_empresa/${safraId}/${empresaId}`
  );
};

const editEmpresaSafra = async (req, id, empresaSafra) => {
  return await server.put(req.cookies.authToken, `${url}/${id}`, empresaSafra);
};

const activateEmpresaSafra = async (req, empresaSafra) => {
  return await server.put(req.cookies.authToken, `${url}`, empresaSafra);
};

module.exports = {
  getEmpresaSafra,
  getEmpresasSafras,
  getEmpresaSafraPeriodos,
  editEmpresaSafra,
  activateEmpresaSafra,
};
