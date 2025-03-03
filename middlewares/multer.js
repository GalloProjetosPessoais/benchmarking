const multer = require('multer');

const storage = multer.memoryStorage(); // Armazena em memória

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: (req, file, cb) => {
    console.log("Recebendo arquivo:", file); // Verifica se o arquivo está chegando
    cb(null, true);
  },
});

module.exports = upload;