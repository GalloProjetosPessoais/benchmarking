const server = require('../server/index');

const getSafras = async (req) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/safras`, {
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
        console.error('Erro ao buscar safras:', error);
    }
}

const getSafra = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/safras/${id}`, {
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
        console.error('Erro ao buscar safra:', error);
    }
}

const createSafra = async (req, safra) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/safras`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(safra),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao cadastrar safra:', error);
        throw new Error('Falha ao conectar à API.');
    }
};

const editSafra = async (req, id, safra) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/safras/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(safra),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao alterar safra:', error);
        throw new Error('Falha ao conectar à API.');
    }
};

const deleteSafra = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/safras/${id}`, {
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
        console.error('Erro ao excluir safra:', error);
    }
}

module.exports = {
    getSafras,
    getSafra,
    createSafra,
    editSafra,
    deleteSafra
};