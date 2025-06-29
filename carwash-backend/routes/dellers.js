const express = require('express');
const router = express.Router();
const dellersController = require('../controllers/dellersController');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Asegúrate que esta carpeta exista
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });


// ✅ BITÁCORA – estas rutas deben ir primero
router.delete('/bitacora/:id_bitacora', dellersController.eliminarBitacora);

router.post(
  '/bitacora/agregar',
  upload.fields([
    { name: 'foto1', maxCount: 1 },
    { name: 'foto2', maxCount: 1 },
    { name: 'foto3', maxCount: 1 },
    { name: 'foto4', maxCount: 1 },
  ]),
  dellersController.agregarBitacora
);

router.get('/bitacora/:id_deller', dellersController.obtenerBitacorasPorDeller);


// ✅ DELLER
router.post('/', dellersController.agregarDeller);
router.get('/', dellersController.obtenerDellers);
router.get('/sucursal/:id_sucursal', dellersController.obtenerDellersPorSucursal);
router.put('/:id', dellersController.actualizarDeller);
router.delete('/:id', dellersController.eliminarDeller);
router.get('/:id', dellersController.obtenerDellerPorId); // ¡ESTA VA DE ÚLTIMA!

module.exports = router;
