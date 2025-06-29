const db = require('../db/connection');


const multer = require('multer');
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


// ✅ Obtener todos los regalos
const obtenerRegalos = (req, res) => {
  db.query('SELECT * FROM regalos ORDER BY puntos_requeridos ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ✅ Crear nuevo regalo (ya sin idSucursal)
const crearRegalo = (req, res) => {
  const { nombre, descripcion, puntos_requeridos } = req.body;
  const imagen = req.file ? req.file.filename : '';

  if (!nombre || !descripcion || !puntos_requeridos) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = `
    INSERT INTO regalos (nombre, descripcion, puntos_requeridos, imagen, fecha_creacion)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(query, [nombre, descripcion, puntos_requeridos, imagen], (err, result) => {
    if (err) {
      console.error('❌ Error al crear regalo:', err);
      return res.status(500).json({ error: 'Error al crear el regalo' });
    }
    res.json({ mensaje: 'Regalo creado correctamente', id: result.insertId });
  });
};


// ✅ Generar código QR
const generarCodigo = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ✅ Canjear regalo
const canjearRegalo = (req, res) => {
  const { user_id, id_regalo } = req.body;

  if (!user_id || !id_regalo) {
    return res.status(400).json({ error: 'Faltan datos para el canje' });
  }

  db.query('SELECT puntos FROM usuarios WHERE user_id = ?', [user_id], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.status(500).json({ error: 'Usuario no encontrado' });
    }

    const puntosUsuario = userResult[0].puntos;

    db.query('SELECT puntos_requeridos, nombre FROM regalos WHERE id = ?', [id_regalo], (err2, regaloResult) => {
      if (err2 || regaloResult.length === 0) {
        return res.status(500).json({ error: 'Regalo no encontrado' });
      }

      const puntosNecesarios = regaloResult[0].puntos_requeridos;
      const nombreRegalo = regaloResult[0].nombre;

      if (puntosUsuario < puntosNecesarios) {
        return res.status(400).json({ error: 'Puntos insuficientes' });
      }

      // Restar puntos
      db.query('UPDATE usuarios SET puntos = puntos - ? WHERE user_id = ?', [puntosNecesarios, user_id], (err3) => {
        if (err3) return res.status(500).json({ error: 'Error al descontar puntos' });

        const codigo = generarCodigo();

        const insertQuery = `
          INSERT INTO canjes (user_id, regalo_id, codigo_validacion, estado, fecha)
          VALUES (?, ?, ?, 'pendiente', NOW())
        `;

        db.query(insertQuery, [user_id, id_regalo, codigo], (err4) => {
          if (err4) {
            console.error('❌ Error en INSERT:', err4);
            return res.status(500).json({ error: 'Canje registrado con error' });
          }

          res.json({
            success: true,
            mensaje: '🎁 Canje exitoso',
            nombre_regalo: nombreRegalo,
            codigo_validacion: codigo
          });
        });
      });
    });
  });
};

// ✅ Validar canje
const validarCanje = (req, res) => {
  const { codigo } = req.body;
  const query = `
    SELECT c.*, r.nombre AS nombre_regalo
    FROM canjes c
    LEFT JOIN regalos r ON c.regalo_id = r.id
    WHERE c.codigo_validacion = ?
  `;

  db.query(query, [codigo], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Código no válido' });
    }

    res.json({ success: true, mensaje: '✅ Canje encontrado', canje: results[0] });
  });
};

// ✅ Obtener canjes por usuario
const obtenerCanjesPorUsuario = (req, res) => {
  const user_id = req.params.user_id;
  const query = `
    SELECT c.id, c.fecha_creado, c.estado, c.codigo_validacion,
           r.nombre, r.descripcion, r.puntos_requeridos, r.imagen
    FROM canjes c
    JOIN regalos r ON c.regalo_id = r.id
    WHERE c.user_id = ?
    ORDER BY c.fecha_creado DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ✅ Marcar canje como entregado
const marcarCanjeComoEntregado = (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Código requerido' });

  const query = `
    UPDATE canjes 
    SET estado = 'entregado', fecha_validado = NOW() 
    WHERE codigo_validacion = ? AND estado = 'pendiente'
  `;

  db.query(query, [codigo], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Código no válido o ya entregado' });
    }

    res.json({ success: true, mensaje: '🎉 Canje marcado como entregado' });
  });
};


// ✅ Actualizar regalo
const actualizarRegalo = (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, puntos_requeridos } = req.body;

  if (!nombre || !descripcion || !puntos_requeridos) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // ✅ Imagen puede venir como archivo o como nombre en texto
  const imagenNombre = req.file ? req.file.filename : (req.body.imagen || '');

  const query = `
    UPDATE regalos
    SET nombre = ?, descripcion = ?, puntos_requeridos = ?, imagen = ?
    WHERE id = ?
  `;

  db.query(query, [nombre, descripcion, puntos_requeridos, imagenNombre, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar regalo:', err);
      return res.status(500).json({ error: 'Error al actualizar el regalo' });
    }
    res.json({ mensaje: 'Regalo actualizado correctamente' });
  });
};


// ✅ Eliminar regalo
const eliminarRegalo = (req, res) => {
  const id = req.params.id;

  const query = `DELETE FROM regalos WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar regalo:', err);
      return res.status(500).json({ error: 'Error al eliminar el regalo' });
    }
    res.json({ mensaje: 'Regalo eliminado correctamente' });
  });
};


module.exports = {
  obtenerRegalos,
  crearRegalo,
  canjearRegalo,
  validarCanje,
  obtenerCanjesPorUsuario,
  marcarCanjeComoEntregado,
  entregarCanje: marcarCanjeComoEntregado,
  eliminarRegalo,
  actualizarRegalo
};
