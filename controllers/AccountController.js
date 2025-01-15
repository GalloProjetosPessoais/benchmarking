//const jwt = require('jsonwebtoken');
const Usuarios = require('../server/usuarios');
const Grupos = require('../server/grupos');

const getLogin = (req, res) => {
  return res.render('account/login', { layout: false });
};

const postLogin = async (req, res) => {
  const login = req.body;
  try {
    const data = await Usuarios.autenticarUsuario(login.nomeUsuario, login.senha);
    if (data.statusCode === 200 && data.isSuccess) {
      // Configura o cookie com o token retornado
      res.cookie('authToken', data.result, {
        httpOnly: true, // Inacessível ao JavaScript no navegador
        secure: true,   // Apenas transmitido por HTTPS
        sameSite: 'Strict', // Previne CSRF - usar Strict depois
        maxAge: 3 * 60 * 60 * 1000, // 3 horas
      });
      // const decoded = jwt.verify(data.result, 'Super-Teste-Ativar-Faca-Com-Que-Esse-Projeto-Comece-A-Funcionar');
      // const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const userData = await Usuarios.getUsuarioLogado(req, data.result);
      res.cookie('authUser', userData.result, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 3 * 60 * 60 * 1000,
      });
      return res.redirect('/');
    } else {
      return res.render('account/login', { error: { title: 'Acesso Negado', message: data.errorMessages.join("<br>") }, layout: false });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return res.render('account/login', { error: { title: 'Problemas ao Entrar', message: 'Erro ao autenticar. Tente novamente mais tarde.' }, layout: false });
  }
};

const postLogout = async (req, res) => {
  try {
    const data = await Usuarios.removerAutenticacao(req);
    if (data.statusCode === 200 && data.isSuccess) {
      // Configura o cookie com o token retornado
      res.clearCookie('authToken', {
        httpOnly: true, // Inacessível ao JavaScript no navegador
        secure: true,   // Apenas transmitido por HTTPS
        sameSite: 'Strict', // Previne CSRF - usar Strict depois
      });
      res.clearCookie('authUser', {
        httpOnly: true, // Inacessível ao JavaScript no navegador
        secure: true,   // Apenas transmitido por HTTPS
        sameSite: 'Strict', // Previne CSRF - usar Strict depois
      });
      return res.redirect('/'); // Redireciona para a página inicial
    } else {
      // Exibe mensagem de erro na tela de login
      return res.redirect('/'); // Redireciona para a página inicial
    }
  } catch (error) {
    console.error('Erro no logout:', error);
    return res.redirect('/'); // Redireciona para a página inicial
  }
};

const getUsuarios = async (req, res) => {
  try {
    const data = await Usuarios.getUsuarios(req);
    if (data.statusCode === 200 && data.isSuccess) {
      return res.render('account/index', {
        title: 'Usuários',
        subtitle: 'Gerenciamento de Usuários',
        data: data.result,
        js: './partials/datatablejs.ejs'
      });
    }
    else {
      return res.redirect('/');
    }
  } catch (error) {
    console.error('Erro de acesso a Usuarios:', error);
  }
};

const getCreateUsuario = async (req, res, usuario = {}, error = null) => {
  try {
    const perfis = await Usuarios.getPerfis(req);
    const grupos = await Grupos.getGrupos(req);

    // Renderiza a página com os dados necessários
    return res.render('account/create', {
      title: 'Usuários',
      subtitle: 'Adicionar Conta',
      perfis: perfis.result || [],
      grupos: grupos.result || [],
      usuario,
      error,
    });
  } catch (error) {
    console.error('Erro ao carregar perfis ou grupos:', error);
    return res.render('account/create', {
      title: 'Usuários',
      subtitle: 'Adicionar Conta',
      perfis: [],
      grupos: [],
      usuario,
      error: { title: 'Problemas internos', message: 'Erro ao carregar dados para a página.' },
    });
  }
}

const postCreateUsuario = async (req, res) => {
  const usuario = req.body;
  try {
    // Verifica se as senhas coincidem
    if (usuario.senha !== usuario.senha2) {
      return getCreateUsuario(req, res, usuario, { title: 'Problemas no Registro', message: 'As senhas não coincidem!' });
    }
    delete usuario.senha2;
    // Tenta registrar o usuário
    const data = await Usuarios.registrarUsuario(req, usuario);

    if (data.statusCode === 201 && data.isSuccess) {
      // Salva mensagem temporária para exibir no toast
      req.session.tempData = { message: 'Usuário registrado com sucesso!' };
      return res.redirect('/usuarios');
    }
    // Exibe mensagens de erro retornadas pelo serviço
    const errorMessage = data.errorMessages?.join("<br>") || 'Erro ao registrar o usuário.';
    return getCreateUsuario(req, res, usuario, { title: 'Problemas no Registro', message: errorMessage });
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return getCreateUsuario(req, res, usuario, { title: 'Problemas no Registro', message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
};

const getConfirmUsuario = async (req, res) => {
  const { id, code } = req.query;
  try {
    const data = await Usuarios.confirmarUsuario(req, id, code);
    return res.render('account/confirm', { layout: false, message: data.isSuccess ? 'Conta confirmada com sucesso!' : `Problemas ao confirmar conta: ${data.errorMessages}` });
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return res.render('account/confirm', { layout: false, message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
}

const getDetailsUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Usuarios.getUsuario(req, id);
    const usuario = data.result;
    return res.render('account/details', {
      title: 'Usuários',
      subtitle: 'Detalhes da Conta',
      usuario,
    });
  } catch (error) {
    console.error('Erro ao carregar perfis ou grupos:', error);
    return res.render('account/details', {
      title: 'Usuários',
      subtitle: 'Detalhes da Conta',
      usuario: {},
      error: { title: 'Problemas internos', message: 'Erro ao carregar dados para a página.' },
    });
  }
}

const getEditUsuario = async (req, res, usuario = {}, error = null) => {
  const { id } = req.params;
  try {
    const perfis = await Usuarios.getPerfis(req);
    const grupos = await Grupos.getGrupos(req);
    const data = await Usuarios.getUsuario(req, id);
    const usuario = data.result;

    return res.render('account/edit', {
      title: 'Usuários',
      subtitle: 'Alterar Conta',
      perfis: perfis.result || [],
      grupos: grupos.result || [],
      usuario,
      error,
    });
  } catch (error) {
    console.error('Erro ao carregar perfis ou grupos:', error);
    return res.render('account/edit', {
      title: 'Usuários',
      subtitle: 'Alterar Conta',
      perfis: [],
      grupos: [],
      usuario,
      error: { title: 'Problemas internos', message: 'Erro ao carregar dados para a página.' },
    });
  }
}

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Usuarios.deleteUsuario(req, id);
    if (data.isSuccess)
      return res.status(200).json({ message: 'Usuário excluído com Sucesso!' });
    else
      return res.status(500).json({ message: data.errorMessages?.join("<br>") });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
}

const getRecuperarConta = async (req, res) => {
  return res.render('account/recover', { layout: false });
}

const postRecuperarConta = async (req, res) => {
  const email = req.body;
  try {
    const data = await Usuarios.recuperarContaUsuario(req, email);
    return res.render('account/recover', { layout: false, message: data.isSuccess ? 'Você receberá um email com os próximos passos' : `Problemas ao tentar recuperar conta: ${data.errorMessages}` });
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return res.render('account/recover', { layout: false, message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
}

const getTrocarSenha = async (req, res) => {
  const { id, code } = req.query;
  return res.render('account/reset', { layout: false, data: { id, code } });
}

const postTrocarSenha = async (req, res) => {
  const reset = req.body;
  if (reset.senha !== reset.senha2) {
    return res.render('account/reset', { layout: false, data: { id: reset.id, code: reset.code }, error: { title: 'Problemas no Registro', message: 'As senhas não coincidem!' } });
  }
  try {
    const data = await Usuarios.trocarSenha(req, reset);
    if (data.isSuccess) {
      return res.render('account/reset', { layout: false, data: reset, message: 'Sua senha foi alterada com sucesso' });
    } else {
      return res.render('account/reset', { layout: false, data: reset, error: { title: 'Problemas ao resetar Senha', message: data.errorMessages?.join("<br>") } });
    }

  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return res.render('account/reset', { layout: false, data: reset, message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
}


module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getUsuarios,
  getCreateUsuario,
  postCreateUsuario,
  getConfirmUsuario,
  getDetailsUsuario,
  getEditUsuario,
  deleteUsuario,
  getRecuperarConta,
  postRecuperarConta,
  getTrocarSenha,
  postTrocarSenha,
};
