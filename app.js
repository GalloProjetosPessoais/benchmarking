const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

require('dotenv').config({ path: './config.env' });

const app = express();
const port = process.env.PORT || 3000;

// register view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware para layouts
app.use(expressLayouts);
app.set('layout', 'layout'); // Define o layout padrão

// Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // Garantir segurança
    secure: false, // Defina como true apenas se estiver usando HTTPS
    sameSite: 'lax', // Ajusta as restrições do cookie
  }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Define o caminho base dinamicamente
const basePath = process.env.BASE_PATH || '/';
app.use(basePath, routes);

// 404
app.use((req, res) => {
  res.status(404).render('404');
})

// listen for requests
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
