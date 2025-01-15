const server = require('../server/index');

const getEmpresas = async (req) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/empresas`, {
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
        console.error('Erro ao buscar empresas:', error);
    }
}

const getEmpresa = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/empresas/${id}`, {
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
        console.error('Erro ao buscar empresa:', error);
    }
}

const createEmpresa = async (req, empresa) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/empresas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(empresa),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        throw new Error('Falha ao conectar à API.');
    }
};

const editEmpresa = async (req, id, empresa) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/empresas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(empresa),
            agent: server.agent,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao alterar empresa:', error);
        throw new Error('Falha ao conectar à API.');
    }
};

const deleteEmpresa = async (req, id) => {
    const fetch = (await import('node-fetch')).default;
    const authToken = req.cookies.authToken;
    try {
        const response = await fetch(`${server.baseUrl}/empresas/${id}`, {
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
        console.error('Erro ao excluir empresa:', error);
    }
}

module.exports = {
    getEmpresas,
    getEmpresa,
    createEmpresa,
    editEmpresa,
    deleteEmpresa
};