// Agente HTTPS que ignora a verificação de certificados
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false, // Permite certificados autoassinados
});

//const baseUrl = 'https://localhost:5000/api';
const baseUrl = 'https://shelley.com.br/api';

const apiCall = async (method, token, url, data = null) => {
  const fetch = (await import('node-fetch')).default;
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${baseUrl}/${url}`, {
      method: method,
      headers: headers,
      body: data != null ? JSON.stringify(data) : null,
      agent: agent,
    });
    return await response.json();
  } catch (error) {
    let type = '';
    if (method == 'GET')
      type = 'Buscar Dados'
    else
      if (method == 'POST')
        type = 'Salvar Dados'
      else
        type = 'Excluir Dados'
    console.error(`Erro ao ${type}`, error);
  }
}

const get = async (token, url) => {
    return await apiCall('GET', token, `${url}`);
}

const post = async (token, url, data) => {
    return await apiCall('POST', token, `${url}`, data);
};

const put = async (token, url, data) => {
    return await apiCall('PUT', token, `${url}`, data);
};

const del = async (token, url) => {
    return await apiCall('DELETE', token, `${url}`);
}

module.exports = {
  https,
  agent,
  baseUrl,
  apiCall,
  get,
  post,
  put,
  del,
};