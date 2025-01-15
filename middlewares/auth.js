const Usuarios = require('../server/usuarios');

const autenticar = async (req, res, next) => {
    try {
        const isAuthenticated = await Usuarios.verificarAutenticacao(req);
        if (isAuthenticated.isSuccess) {
            return next(); // Continua para a próxima rota
        } else {
            return res.redirect('/login'); // Redireciona para login
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return res.redirect('/login'); // Redireciona em caso de erro
    }
};

module.exports = autenticar;
