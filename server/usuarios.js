const server = require('../server/index');

const autenticarUsuario = async (nomeUsuario, senha) => {
    const fetch = (await import('node-fetch')).default; // Importação dinâmica
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomeUsuario, senha }),
            agent: server.agent, // remover isso depois
        });
        const data = await response.json();
        return data; // Retorna a resposta da API
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        throw new Error('Falha ao conectar à API.');
    }
};


const removerAutenticacao = async (req) => {
    const fetch = (await import('node-fetch')).default; // Importação dinâmica
    const authToken = req.cookies.authToken; // Obtém o token do cookie
    if (!authToken) {
        return false; // Sem token, não autenticado
    }
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao remover autenticação:', error);
        throw new Error('Falha ao conectar à API.');
    }
};


// Verifica se o token de autenticação é válido
const verificarAutenticacao = async (req) => {
    const fetch = (await import('node-fetch')).default; // Importação dinâmica
    const authToken = req.cookies.authToken; // Obtém o token do cookie
    if (!authToken) {
        return false; // Sem token, não autenticado
    }
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/logged`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            agent: server.agent,
        });
        const data = await response.json();
        return data; // Retorna true se o token for válido
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false; // Em caso de erro, trata como não autenticado
    }
};

const getUsuarioLogado = async (req, token) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken || token;
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/logged`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
};

const getUsuarios = async (req) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/usuarios`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro buscar usuários:', error);
    }
}

const getUsuario = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro buscar usuário:', error);
    }
}

const getPerfis = async (req) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/perfis`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro buscar perfis:', error);
    }
}


const registrarUsuario = async (req, registro) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(registro),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        throw new Error('Falha ao conectar à API.');
    }
};

const confirmarUsuario = async (req, id, code) => {
    const fetch = (await import('node-fetch')).default;
    const confirmar = {
        usuarioId: id,
        token: code
    }
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/confirmarRegistro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(confirmar),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao confirmar email do usuário:', error);
        throw new Error('Falha ao conectar à API.');
    }
}


const deleteUsuario = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
    }
}


const recuperarContaUsuario = async (req, email) => {
    const fetch = (await import('node-fetch')).default;
    try {
        const response = await fetch(`${server.baseUrl}/usuarios/recuperarConta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(email),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao recuperar conta do usuário:', error);
        throw new Error('Falha ao conectar à API.');
    }
}

const trocarSenha = async (req, reset) => {
    const fetch = (await import('node-fetch')).default;
    try {
        const values = {
            usuarioId: reset.id,
            token: reset.code,
            senha: reset.senha
          }
        const response = await fetch(`${server.baseUrl}/usuarios/resetarSenha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao resetar conta do usuário:', error);
        throw new Error('Falha ao conectar à API.');
    }
}

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
    deleteUsuario,
    recuperarContaUsuario,
    trocarSenha,
};