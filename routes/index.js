const routes = require('express').Router();
const attachUser = require('../middlewares/attachUser');
const autenticar = require('../middlewares/auth');

const HomeController = require('../controllers/HomeController');
const AccountController = require('../controllers/AccountController');
const GruposController = require('../controllers/GruposController');
const EmpresasController = require('../controllers/EmpresasController');
const SafrasController = require('../controllers/SafrasController');
const PeriodosController = require('../controllers/PeriodosController');
const EmpresasSafrasController = require('../controllers/EmpresasSafrasController');

// Rotas que NÃO exigem autenticação
routes.get(`/login`, AccountController.getLogin);
routes.post(`/login`, AccountController.postLogin);
routes.post(`/logout`, AccountController.postLogout);

routes.get(`/usuarios/confirmarEmail`, AccountController.getConfirmUsuario)
routes.get(`/usuarios/recuperarConta`, AccountController.getRecuperarConta)
routes.post(`/usuarios/recuperarConta`, AccountController.postRecuperarConta)
routes.get(`/usuarios/trocarSenha`, AccountController.getTrocarSenha)
routes.post(`/usuarios/trocarSenha`, AccountController.postTrocarSenha)

// Rotas que exigem autenticação
routes.use(attachUser);
routes.get(`/`, autenticar, HomeController.getHome);

// Usuários
routes.get(`/usuarios`, autenticar, AccountController.getUsuarios);
routes.get(`/usuarios/create`, autenticar, AccountController.getCreateUsuario);
routes.post(`/usuarios/create`, autenticar, AccountController.postCreateUsuario);
routes.get(`/usuarios/details/:id`, autenticar, AccountController.getDetailsUsuario);
routes.get(`/usuarios/edit/:id`, autenticar, AccountController.getEditUsuario);
routes.delete(`/usuarios/delete/:id`, autenticar, AccountController.deleteUsuario);

// Grupos
routes.get(`/grupos`, autenticar, GruposController.getGrupos);
routes.get(`/grupos/upsert/:id`, autenticar, GruposController.getUpsertGrupo);
routes.post(`/grupos/upsert/:id`, autenticar, GruposController.postUpsertGrupo);
routes.delete(`/grupos/delete/:id`, autenticar, GruposController.deleteGrupo);

// Empresas
routes.get(`/empresas`, autenticar, EmpresasController.getEmpresas);
routes.get(`/empresas/upsert/:id`, autenticar, EmpresasController.getUpsertEmpresa);
routes.post(`/empresas/upsert/:id`, autenticar, EmpresasController.postUpsertEmpresa);
routes.delete(`/empresas/delete/:id`, autenticar, EmpresasController.deleteEmpresa);

// Safras
routes.get(`/safras`, autenticar, SafrasController.getSafras);
routes.get(`/safras/upsert/:id`, autenticar, SafrasController.getUpsertSafra);
routes.post(`/safras/upsert/:id`, autenticar, SafrasController.postUpsertSafra);
routes.delete(`/safras/delete/:id`, autenticar, SafrasController.deleteSafra);
// Periodos e empresas da Safra
routes.get(`/safras/periodos/:id`, autenticar, PeriodosController.getPeriodosSafra);
routes.get(`/safras/empresas/:id`, autenticar, EmpresasSafrasController.getEmpresasSafra);

// Gerar Periodos
routes.post(`/periodos/gerar/:id`, autenticar, PeriodosController.postGerarPeriodos);


module.exports = routes;