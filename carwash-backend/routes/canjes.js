const express = require('express');
const router = express.Router();
const {
  registrarCanje,
  obtenerCanjesPorUsuario,
  validarCanje,
  entregarCanje // ✅
} = require('../controllers/canjesController');

router.post('/', registrarCanje);
router.get('/:user_id', obtenerCanjesPorUsuario);
router.post('/validar', validarCanje);
router.post('/entregar', entregarCanje); // ✅ solo esta

module.exports = router;
