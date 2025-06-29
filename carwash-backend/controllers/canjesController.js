const db = require('../db/connection');

// 🔁 Generar código único de validación (6 caracteres)
const generarCodigo = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ✅ Registrar un canje pendiente con código
const registrarCanje = (req, res) => {
  const { id_usuario, regalo_id } = req.body;
  const codigo_validacion = generarCodigo();

  console.log('📥 Datos recibidos para canje:', { id_usuario, regalo_id });

  if (!id_usuario || !regalo_id) {
    return res.status(400).json({ error: 'Faltan datos para procesar el canje' });
  }

  // 1. Obtener puntos del usuario
  db.query('SELECT puntos FROM usuarios WHERE id = ?', [id_usuario], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(500).json({ error: 'Error al buscar usuario o usuario no encontrado' });
    }

    const puntosUsuario = userResults[0].puntos;

    // 2. Obtener puntos requeridos del regalo
    db.query('SELECT puntos_requeridos, nombre FROM regalos WHERE id = ?', [regalo_id], (err2, regaloResults) => {
      if (err2 || regaloResults.length === 0) {
        return res.status(500).json({ error: 'Error al buscar regalo o regalo no encontrado' });
      }

      const puntosNecesarios = regaloResults[0].puntos_requeridos;
      const nombreRegalo = regaloResults[0].nombre;

      // 3. Validar si el usuario tiene suficientes puntos
      if (puntosUsuario < puntosNecesarios) {
        return res.status(400).json({ error: 'Puntos insuficientes para canjear este regalo' });
      }

      // 4. Descontar los puntos del usuario
      db.query('UPDATE usuarios SET puntos = puntos - ? WHERE id = ?', [puntosNecesarios, id_usuario], (err3) => {
        if (err3) {
          return res.status(500).json({ error: 'Error al descontar puntos del usuario' });
        }

        // 5. Registrar el canje
        const insertQuery = `
          INSERT INTO canjes (user_id, regalo_id, codigo_validacion, estado, fecha)

          VALUES (?, ?, ?, 'pendiente')
        `;

        db.query(insertQuery, [id_usuario, regalo_id, codigo_validacion], (err4, result) => {
          if (err4) {
            return res.status(500).json({ error: 'Error al registrar el canje' });
          }

          res.json({
            success: true,
            id_canje: result.insertId,
            codigo_validacion,
            nombre_regalo: nombreRegalo
          });
        });
      });
    });
  });
};


// ✅ Validar canje (operador escanea código QR)
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

    const canje = results[0];
    res.json({ success: true, mensaje: '✅ Canje encontrado', canje });
  });
};


// ✅ Obtener historial de canjes por usuario
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
      return res.status(404).json({ error: 'Canje no válido o ya entregado' });
    }

    res.json({ success: true, mensaje: '🎉 Canje marcado como entregado' });
  });
};


const entregarCanje = (req, res) => {
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
      return res.status(404).json({ error: 'Código no encontrado o ya entregado' });
    }

    res.json({ success: true, mensaje: '🎉 Canje marcado como entregado' });
  });
};


module.exports = {
  registrarCanje,
  validarCanje,
  obtenerCanjesPorUsuario,
 marcarCanjeComoEntregado,
 entregarCanje, 
};
