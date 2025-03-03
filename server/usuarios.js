const server = require('../server/index');
const url = 'usuarios';

const autenticarUsuario = async (nomeUsuario, senha) => {
    return await server.post(null, `${url}/login`, { nomeUsuario, senha });
};

const removerAutenticacao = async (req) => {
    if (!req.cookies.authToken) {
        return false;
    }
    return await server.post(req.cookies.authToken, `${url}/logout`, {});
};

const verificarAutenticacao = async (req) => {
    if (!req.cookies.authToken) {
        return false;
    }
    return await server.post(req.cookies.authToken, `${url}/logged`, {});
};

const getUsuarioLogado = async (req, token) => {
    const authToken = req.cookies.authToken || token;
    return await server.post(authToken, `${url}/logged`, {});
};

const getUsuarios = async (req) => {
    return await server.get(req.cookies.authToken, `${url}`);
}

const getUsuario = async (req, id) => {
    return await server.get(req.cookies.authToken, `${url}/${id}`);
}

const getPerfis = async (req) => {
    return await server.get(req.cookies.authToken, `${url}/perfis`);
}

const registrarUsuario = async (req, registro) => {
    return await server.apiCallFormData('POST', req.cookies.authToken, `${url}/registro`, registro);
};

const confirmarUsuario = async (req, id, code) => {
    const confirmar = {
        usuarioId: id,
        token: code
    }
    return await server.post(req.cookies.authToken, `${url}/confirmarRegistro`, confirmar);
}

const editUsuario = async (req, id, usuario) => {
    return await server.apiCallFormData('PUT', req.cookies.authToken, `${url}/${id}`, usuario);
};

const deleteUsuario = async (req, id) => {
    return await server.del(req.cookies.authToken, `${url}/${id}`);
}

const recuperarContaUsuario = async (req, email) => {
    return await server.post(req.cookies.authToken, `${url}/recuperarConta`, email);
}

const trocarSenha = async (req, reset) => {
    const values = {
        usuarioId: reset.id,
        token: reset.code,
        senha: reset.senha
    }
    return await server.post(req.cookies.authToken, `${url}/resetarSenha`, values);
}

const editarPerfilUsuario = async (req, id, usuario) => {
    return await server.apiCallFormData('PUT', req.cookies.authToken, `${url}/perfil/${id}`, usuario);
};

module.exports = {
    verificarAutenticacao,
    autenticarUsuario,
    removerAutenticacao,
    getUsuarioLogado,
    getUsuarios,
    getUsuario,
    getPerfis,
    registrarUsuario,
    confirmarUsuario,
    editUsuario,
    deleteUsuario,
    recuperarContaUsuario,
    trocarSenha,
    editarPerfilUsuario,
};