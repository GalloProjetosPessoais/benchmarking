const routes = require("express").Router();
const multer = require("multer");

const attachUser = require("../middlewares/attachUser");
const autenticar = require("../middlewares/auth");

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Usa a memória em vez do disco
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: (req, file, cb) => {
    //console.log("Recebendo arquivo:", file); // Verifica se o arquivo está chegando
    cb(null, true);
  },
});

const HomeController = require("../controllers/HomeController");
const AccountController = require("../controllers/AccountController");
const GruposController = require("../controllers/GruposController");
const EmpresasController = require("../controllers/EmpresasController");
const SafrasController = require("../controllers/SafrasController");
const PeriodosController = require("../controllers/PeriodosController");
const EmpresasSafrasController = require("../controllers/EmpresasSafrasController");
const DadosAgricolasController = require("../controllers/DadosAgricolasController");
const RelatoriosController = require("../controllers/RelatoriosController");

// Rotas que NÃO exigem autenticação
routes.get(`/login`, AccountController.getLogin);
routes.post(`/login`, AccountController.postLogin);
routes.post(`/logout`, AccountController.postLogout);

routes.get(`/usuarios/confirmarEmail`, AccountController.getConfirmUsuario);
routes.get(`/usuarios/recuperarConta`, AccountController.getRecuperarConta);
routes.post(`/usuarios/recuperarConta`, AccountController.postRecuperarConta);
routes.get(`/usuarios/trocarSenha`, AccountController.getTrocarSenha);
routes.post(`/usuarios/trocarSenha`, AccountController.postTrocarSenha);

// Rotas que exigem autenticação
routes.use(attachUser);
routes.get(`/`, autenticar, HomeController.getHome);

// Usuários
routes.get(`/usuarios`, autenticar, AccountController.getUsuarios);
routes.get(`/usuarios/create`, autenticar, AccountController.getCreateUsuario);
routes.post(
  `/usuarios/create`,
  autenticar,
  upload.single("arquivoFoto"),
  AccountController.postCreateUsuario
);
routes.get(
  `/usuarios/details/:id`,
  autenticar,
  AccountController.getDetailsUsuario
);
routes.get(
  `/usuarios/perfil/:id`,
  autenticar,
  AccountController.getPerfilUsuario
);
routes.post(
  `/usuarios/perfil/:id`,
  autenticar,
  upload.single("arquivoFoto"),
  AccountController.postPerfilUsuario
);
routes.get(`/usuarios/edit/:id`, autenticar, AccountController.getEditUsuario);
routes.post(
  `/usuarios/edit/:id`,
  autenticar,
  upload.single("arquivoFoto"),
  AccountController.postEditUsuario
);
routes.delete(
  `/usuarios/delete/:id`,
  autenticar,
  AccountController.deleteUsuario
);

// Grupos
routes.get(`/grupos`, autenticar, GruposController.getGrupos);
routes.get(`/grupos/upsert/:id`, autenticar, GruposController.getUpsertGrupo);
routes.post(`/grupos/upsert/:id`, autenticar, GruposController.postUpsertGrupo);
routes.delete(`/grupos/delete/:id`, autenticar, GruposController.deleteGrupo);

// Empresas
routes.get(`/empresas`, autenticar, EmpresasController.getEmpresas);
routes.get(
  `/empresas/upsert/:id`,
  autenticar,
  EmpresasController.getUpsertEmpresa
);
routes.post(
  `/empresas/upsert/:id`,
  autenticar,
  EmpresasController.postUpsertEmpresa
);
routes.delete(
  `/empresas/delete/:id`,
  autenticar,
  EmpresasController.deleteEmpresa
);

// Safras
routes.get(`/safras`, autenticar, SafrasController.getSafras);
routes.get(`/safras/upsert/:id`, autenticar, SafrasController.getUpsertSafra);
routes.post(`/safras/upsert/:id`, autenticar, SafrasController.postUpsertSafra);
routes.get(`/safras/ativar/:id`, autenticar, SafrasController.ativarSafra);
routes.delete(`/safras/delete/:id`, autenticar, SafrasController.deleteSafra);
// Periodos e empresas da Safra
routes.get(
  `/safras/periodos/:id`,
  autenticar,
  PeriodosController.getPeriodosSafra
);
routes.get(
  `/safras/empresas/:id`,
  autenticar,
  EmpresasSafrasController.getEmpresasSafra
);

// Gerenciar Periodos Safra
routes.post(
  `/periodos/gerar/:id`,
  autenticar,
  PeriodosController.postGerarPeriodos
);
routes.delete(
  `/periodos/delete/:id`,
  autenticar,
  PeriodosController.deletePeriodo
);
routes.get(
  `/periodos/ativar/:id`,
  autenticar,
  PeriodosController.ativarPeriodo
);

//  Dados Agrícolas
routes.get(`/dados`, autenticar, DadosAgricolasController.getDados);
routes.post("/ambientes", autenticar, DadosAgricolasController.saveAmbiente);
routes.post("/dados", autenticar, DadosAgricolasController.saveDados);

// Empresas Periodos
routes.get(
  "/empresasSafras/ativar/:id",
  autenticar,
  EmpresasSafrasController.ativarEmpresaPeriodo
);
routes.get(
  "/empresasSafras/desativar/:id",
  autenticar,
  EmpresasSafrasController.desativarEmpresaPeriodo
);

// Rotas de retorno de dados
routes.get("/buscar/empresaGrupo", EmpresasController.getDadosEmpresasGrupo);
routes.get(
  "/buscar/empresaGrupo/:id",
  EmpresasController.getDadosEmpresasPorGrupo
);
routes.get(
  "/buscar/periodosSafra/:id",
  PeriodosController.getDadosPeriodosPorSafra
);

// Rotas de partials
routes.get(
  "/partials/ambiente-producao",
  DadosAgricolasController.getAmbienteProducaoPartial
);
routes.get(
  "/partials/dados-agricolas",
  DadosAgricolasController.getDadosAgricolasPartial
);
routes.get("/partials/graficos", RelatoriosController.getRelatoriosPartial);

// Rotas Relatorios
routes.get(`/relatorios`, autenticar, RelatoriosController.getRelatorios);

module.exports = routes;
