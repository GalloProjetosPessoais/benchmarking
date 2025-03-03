//const jwt = require('jsonwebtoken');
const Usuarios = require('../server/usuarios');
const Grupos = require('../server/grupos');
const Utils = require('../utils/utils');

const getLogin = (req, res) => {
  res.clearCookie('authToken');
  res.clearCookie('authUser');
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
      const user = userData.result;

      const resultado = user.permissoes.reduce((acc, item) => {
        // Encontrar o módulo no resultado acumulado
        let moduloExistente = acc.find(el => el.modulo === item.modulo.nome);

        // Se o módulo já existe, adicionar a ação ao campo `acao`
        if (moduloExistente) {
          moduloExistente.acao += item.acao.id.toString();
        } else {
          // Caso contrário, criar um novo módulo com a primeira ação
          acc.push({
            modulo: item.modulo.nome,
            acao: item.acao.id.toString(),
          });
        }
        return acc;
      }, []);
      user.permissoes = resultado;

      res.cookie('authUser', user, {
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
      const data2 = data.result.map(item => ({
        ...item,
        fone: item.fone != null ? Utils.formatPhone(item.fone) : ''
      }));
      return res.render('account/index', {
        title: 'Usuários',
        subtitle: 'Gerenciamento de Usuários',
        data: data2,
        useDatatable: true,
      });
    }
    else {
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao Buscar Usuários');
    }
  } catch (error) {
    req.session.error = { title: 'Problema ao Carregar Usuários', message: error };
    console.error('Erro de acesso ao Usuário:', error);
    return res.redirect('/');
  }
};

const getCreateUsuario = async (req, res) => {
  let usuario = req.session.usuarioData || {};
  delete req.session.usuarioData;
  try {
    const perfis = await Usuarios.getPerfis(req);
    const grupos = await Grupos.getGrupos(req);
    return res.render('account/create', {
      title: 'Usuários',
      subtitle: 'Adicionar Conta',
      perfis: perfis.result || [],
      grupos: grupos.result.sort((a, b) => a.descricao.localeCompare(b.descricao)) || [],
      usuario,
      js: '/js/usuarios.js'
    });
  } catch (error) {
    console.error('Erro ao carregar perfis ou grupos:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao carregar os dados para a página. Tente novamente mais tarde.',
    };
    return res.render('account/create', {
      title: 'Usuários',
      subtitle: 'Adicionar Conta',
      perfis: [],
      grupos: [],
      usuario,
      js: '/js/usuarios.js'
    });
  }
}

const postCreateUsuario = async (req, res) => {
  const usuario = req.body;
  const arquivoFoto = req.file;
  try {
    if (usuario.senha !== usuario.senha2) {
      req.session.usuarioData = usuario;
      req.session.error = {
        title: 'Problemas no Registro', message: 'As senhas não coincidem!'
      };
      return getCreateUsuario(req, res);
    }
    delete usuario.senha2;

    // Criando um FormData corretamente no Node.js
    const formData = new FormData();

    // Adiciona os campos do usuário ao FormData
    Object.keys(usuario).forEach(key => {
      formData.append(key, usuario[key]);
    });

    // Se houver um arquivo, adiciona corretamente ao FormData
    if (arquivoFoto) {
      const blob = new Blob([arquivoFoto.buffer], { type: arquivoFoto.mimetype });
      formData.append('arquivoFoto', blob, arquivoFoto.originalname);
    }

    const data = await Usuarios.registrarUsuario(req, formData);

    if (data.statusCode === 201 && data.isSuccess) {
      req.session.success = { title: 'Sucesso', message: 'Usuário registrado com sucesso!' };
      return res.redirect('/usuarios');
    }
    req.session.error = {
      title: 'Problemas no Cadastro',
      message: data.errorMessages?.join('<br>') || 'Erro ao Registrar Usuário.',
    };
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
  }
  req.session.usuarioData = usuario;
  return getCreateUsuario(req, res);
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
    usuario.fone = usuario.fone != null ? Utils.formatPhone(usuario.fone) : '';
    return res.render('account/details', {
      title: 'Usuários',
      subtitle: 'Detalhes da Conta',
      usuario,
    });
  } catch (error) {
    console.error('Erro ao carregar perfis ou grupos:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
    return res.render('account/details', {
      title: 'Usuários',
      subtitle: 'Detalhes da Conta',
      usuario: {},
    });
  }
}

const getEditUsuario = async (req, res) => {
  const { id } = req.params;
  let usuario = req.session.usuarioData || {};
  delete req.session.usuarioData;
  try {
    const perfis = await Usuarios.getPerfis(req);
    const grupos = await Grupos.getGrupos(req);
    if (!usuario.id) {
      const data = await Usuarios.getUsuario(req, id);
      usuario = data.result;
    }
    return res.render('account/edit', {
      title: 'Usuários',
      subtitle: 'Alterar Conta',
      perfis: perfis.result || [],
      grupos: grupos.result.sort((a, b) => a.descricao.localeCompare(b.descricao)) || [],
      usuario,
      js: '/js/usuarios.js'
    });
  } catch (error) {
    console.error('Erro ao carregar perfis ou grupos:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao carregar os dados para a página. Tente novamente mais tarde.',
    };
    return res.render('account/edit', {
      title: 'Usuários',
      subtitle: 'Alterar Conta',
      perfis: [],
      grupos: [],
      usuario,
      js: '/js/usuarios.js'
    });
  }
}

const postEditUsuario = async (req, res) => {
  const { id } = req.params;
  const usuario = req.body;
  const arquivoFoto = req.file;
  try {
    const formData = new FormData();
    Object.keys(usuario).forEach(key => {
      formData.append(key, usuario[key]);
    });
    if (arquivoFoto) {
      const blob = new Blob([arquivoFoto.buffer], { type: arquivoFoto.mimetype });
      formData.append('arquivoFoto', blob, arquivoFoto.originalname);
    }
    const data = await Usuarios.editUsuario(req, id, formData);

    if (data.statusCode === 204 && data.isSuccess) {
      req.session.success = { title: 'Sucesso', message: 'Usuário atualizado com sucesso!' };
      return res.redirect('/usuarios');
    }
    req.session.error = {
      title: 'Problemas ao Atualizar Usuário',
      message: data.errorMessages?.join('<br>') || 'Erro ao Atualizar Usuário.',
    };
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
  }
  req.session.usuarioData = usuario;
  return getPerfilUsuario(req, res);
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Usuarios.deleteUsuario(req, id);
    if (data.isSuccess)
      req.session.success = { title: 'Usuário excluído com Sucesso!', message: 'A exclusão foi realizada com êxito.' };
    else
      throw new Error(data.errorMessages?.join("<br>") || 'Erro ao tentar Excluir Usuário');
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    req.session.error = { title: "Erro ao Tentar Excluir a Usuário", message: error };
  }
  return res.redirect('/usuarios')
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


const getPerfilUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Usuarios.getUsuario(req, id);
    const usuario = data.result;
    return res.render('account/perfil', {
      title: 'Usuários',
      subtitle: 'Perfil da Conta',
      usuario,
      js: '/js/usuarios.js'
    });
  } catch (error) {
    console.error('Erro ao carregar perfis ou grupos:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
    return res.render('account/perfil', {
      title: 'Usuários',
      subtitle: 'Perfil da Conta',
      usuario: {},
    });
  }
}

const postPerfilUsuario = async (req, res) => {
  const { id } = req.params;
  const usuario = req.body;
  const arquivoFoto = req.file;
  try {
    const formData = new FormData();
    Object.keys(usuario).forEach(key => {
      formData.append(key, usuario[key]);
    });
    if (arquivoFoto) {
      const blob = new Blob([arquivoFoto.buffer], { type: arquivoFoto.mimetype });
      formData.append('arquivoFoto', blob, arquivoFoto.originalname);
    }
    const data = await Usuarios.editarPerfilUsuario(req, id, formData);

    if (data.statusCode === 204 && data.isSuccess) {
      req.session.success = { title: 'Sucesso', message: 'Perfil editado com sucesso!' };
      return res.redirect('/usuarios');
    }
    req.session.error = {
      title: 'Problemas ao Editar Perfil',
      message: data.errorMessages?.join('<br>') || 'Erro ao Editar Perfil de Usuário.',
    };
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    req.session.error = {
      title: 'Erro Interno',
      message: 'Falha ao processar a solicitação. Tente novamente mais tarde.',
    };
  }
  req.session.usuarioData = usuario;
  return getPerfilUsuario(req, res);
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getUsuarios,
  getCreateUsuario,
  postCreateUsuario,
  getConfirmUsuario,
  getDetailsUsuario,
  getPerfilUsuario,
  postPerfilUsuario,
  getEditUsuario,
  postEditUsuario,
  deleteUsuario,
  getRecuperarConta,
  postRecuperarConta,
  getTrocarSenha,
  postTrocarSenha,
};
