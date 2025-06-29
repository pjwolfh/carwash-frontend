const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');
const upload = require('../middlewares/upload');

// 🔹 Obtener TODOS los servicios (para home general)
router.get('/', serviciosController.obtenerTodosLosServicios);

// 🔹 Obtener servicios por cliente (si lo usas)
router.get('/:id_sucursal', serviciosController.obtenerServicios);
router.get('/sucursal/:id_sucursal', serviciosController.obtenerServicios);




// 🔹 Crear nuevo servicio
router.post('/', serviciosController.agregarServicio);

// 🔹 Editar servicio
router.put('/:id', serviciosController.editarServicio);

// 🔹 Eliminar servicio
router.delete('/:id', serviciosController.eliminarServicio);

// 🔹 Subir imagen (para servicio)
router.post('/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ imagePath });
});





module.exports = router;
