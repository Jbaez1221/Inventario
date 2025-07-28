const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'otros';
    if (req.baseUrl) {
      if (req.baseUrl.includes('equipos')) folder = 'equipos';
      else if (req.baseUrl.includes('asignaciones')) folder = 'asignaciones';
      else if (req.baseUrl.includes('devoluciones')) folder = 'devoluciones'; // <-- cambia aquí
    }
    const uploadPath = path.join('public', 'uploads', folder);

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
});

function getRelativeUrl(filePath) {
  let relative = filePath.replace(/^public[\\/]/, '');
  return relative.replace(/\\/g, '/');
}

module.exports = { upload, getRelativeUrl };