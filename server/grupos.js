const server = require('../server/index');

const getGrupos = async (req) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/grupos`, {
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
        console.error('Erro ao buscar grupos:', error);
    }
}

const getGrupo = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/grupos/${id}`, {
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
        console.error('Erro ao buscar grupo:', error);
    }
}

const createGrupo = async (req, grupo) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/grupos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(grupo),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao cadastrar grupo:', error);
        throw new Error('Falha ao conectar à API.');
    }
};

const editGrupo = async (req, id, grupo) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/grupos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(grupo),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao alterar grupo:', error);
        throw new Error('Falha ao conectar à API.');
    }
};

const deleteGrupo = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/grupos/${id}`, {
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
        console.error('Erro ao excluir grupo:', error);
    }
}

module.exports = {
    getGrupos,
    getGrupo,
    createGrupo,
    editGrupo,
    deleteGrupo
};