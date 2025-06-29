const db = require('../db/connection');
const bcrypt = require('bcrypt');
const { enviarCorreoBienvenida } = require('../utils/mailer');

// 🔁 Generar ID de usuario (6 caracteres alfanuméricos)
const generarIdUsuario = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// ✅ Login con JOIN para empleados
const loginUsuario = (req, res) => {
  const { telefono } = req.body;
  console.log('📲 Login recibido con teléfono:', telefono);

  const query = `
    SELECT 
      usuarios.*, 
      usuarios.id AS id_cliente,
      empleados.hora_entrada, 
      empleados.hora_salida, 
      empleados.dia_descanso, 
      empleados.nombre_empleado,
      empleados.id_sucursal
    FROM usuarios 
    LEFT JOIN empleados ON usuarios.id = empleados.id_usuario
    WHERE usuarios.telefono = ?
  `;

  db.query(query, [telefono], (err, results) => {
    if (err) {
      console.error('❌ Error SQL al buscar usuario:', err);
      return res.status(500).json({ error: err });
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado. Por favor regístrese.' });
    }
  });
};

// ✅ Crear nuevo usuario
const crearUsuario = async (req, res) => {
  const {
    telefono,
    email,
    password,
    nombre_contacto,
    nombre_empresa,
    rol_id = 1
  } = req.body;

  const user_id = generarIdUsuario();
  const hashed = password ? await bcrypt.hash(password, 10) : null;

  const query = `
    INSERT INTO usuarios (
      telefono, email, password, rol_id,
      puntos, servicios_acumulados, user_id,
      nombre_contacto, nombre_empresa
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    telefono,
    email,
    hashed,
    rol_id,
    0,
    0,
    user_id,
    nombre_contacto,
    nombre_empresa
  ], async (err, result) => {
    if (err) return res.status(500).json({ error: err });

    try {
      await enviarCorreoBienvenida(email, telefono);
    } catch (error) {
      console.warn('⚠️ Error enviando correo:', error.message);
    }

    res.json({ mensaje: 'Usuario creado con éxito', id: result.insertId, user_id });
  });
};

// ✅ Obtener todos los usuarios
const obtenerUsuarios = (req, res) => {
  const query = 'SELECT * FROM usuarios';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ✅ Obtener un usuario por ID numérico
const obtenerUsuario = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(results[0]);
  });
};

// ✅ Obtener usuario por código (user_id alfanumérico)
const obtenerUsuarioPorCodigo = (req, res) => {
  const { user_id } = req.params;
  db.query('SELECT * FROM usuarios WHERE user_id = ?', [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result[0]);
  });
};

// ✅ Editar usuario
const editarUsuario = (req, res) => {
  const { id } = req.params;
  const {
    telefono,
    email,
    nombre_contacto,
    nombre_empresa
  } = req.body;

  const query = `
    UPDATE usuarios
    SET telefono = ?, email = ?, nombre_contacto = ?, nombre_empresa = ?
    WHERE id = ?
  `;

  db.query(query, [telefono, email, nombre_contacto, nombre_empresa, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  });
};

// ✅ Eliminar usuario
const eliminarUsuario = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  });
};

// ✅ Resetear contraseña
const resetearPasswordCliente = async (req, res) => {
  const { id } = req.params;
  const nueva = '123456';
  const hashed = await bcrypt.hash(nueva, 10);

  db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashed, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Contraseña restablecida correctamente' });
  });
};

// ✅ Obtener ventas del día para cliente
const obtenerVentasDelDiaPorCliente = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT COUNT(*) AS cantidad, COALESCE(SUM(monto_total), 0) AS total
    FROM ventas
    WHERE id_usuario = ? AND DATE(fecha_hora) = CURDATE()
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
};

// ✅ Obtener servicios por cliente
const obtenerServiciosPorCliente = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM servicios WHERE id_usuario = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ✅ Obtener credenciales del usuario
const getCredencialesUsuario = (req, res) => {
  const { id } = req.params;
  db.query('SELECT email, password, rol_id FROM usuarios WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(results[0]);
  });
};

// ✅ Obtener sucursales asignadas a un usuario
const obtenerSucursalesPorUsuario = (req, res) => {
  const { id } = req.params;

  // Primero obtenemos el rol del usuario
  const rolQuery = 'SELECT rol_id FROM usuarios WHERE id = ?';
  db.query(rolQuery, [id], (err, rolResult) => {
    if (err) return res.status(500).json({ error: err });
    if (rolResult.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const rol_id = rolResult[0].rol_id;

    // Roles que deben ver TODAS las sucursales
    if (rol_id === 1 || rol_id === 2 || rol_id === 3 || rol_id === 5) {
      const allQuery = 'SELECT * FROM sucursales';
      db.query(allQuery, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
      });
    } else {
      // Rol 4 → Empleado: solo las sucursales asignadas
      const query = `
        SELECT s.* 
        FROM sucursales s
        INNER JOIN empleados e ON e.id_sucursal = s.id_sucursal
        WHERE e.id_usuario = ?
      `;
      db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
      });
    }
  });
};

// Obtener sucursal por id
const obtenerSucursalPorId = (req, res) => {
  const idSucursal = req.params.id;

  db.query('SELECT * FROM sucursales WHERE id_sucursal = ?', [idSucursal], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener sucursal por ID:', err);
      return res.status(500).json({ error: 'Error al obtener la sucursal' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    res.json(results[0]); // Enviar solo la primera (única) sucursal
  });
};


module.exports = {
  crearUsuario,
  loginUsuario,
  obtenerUsuario,
  obtenerUsuarios,
  editarUsuario,
  eliminarUsuario,
  resetearPasswordCliente,
  obtenerVentasDelDiaPorCliente,
  obtenerServiciosPorCliente,
  getCredencialesUsuario,
  obtenerUsuarioPorCodigo,
  obtenerSucursalesPorUsuario,
  obtenerSucursalPorId 
};
