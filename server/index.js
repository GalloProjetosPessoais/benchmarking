// Agente HTTPS que ignora a verificação de certificados
const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: false, // Permite certificados autoassinados
});

//const baseUrl = 'https://localhost:5000/api';
const baseUrl = 'https://shelley.com.br/api';

module.exports = {
    https,
    agent,
    baseUrl,
};