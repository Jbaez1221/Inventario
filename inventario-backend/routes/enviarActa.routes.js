const express = require('express');
const router = express.Router();
const multer = require('multer');
const enviarActaController = require('../controllers/enviarActa.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('pdf'), enviarActaController.enviarActaPorCorreo);

module.exports = router;