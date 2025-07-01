// 🧠 Importaciones necesarias
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const clientesRoutes = require('./routes/clientes');
const controlHorariosRoutes = require('./routes/control_horarios');
const sucursalesRoutes = require('./routes/sucursales');
const empleadosRoutes = require('./routes/empleados');
const asistenciaRoutes = require('./routes/asistencia');
const serviciosRoutes = require('./routes/servicios');
const path = require('path');
const regalosRoutes = require('./routes/regalos');
const canjesRoutes = require('./routes/canjes');
const ventasRoutes = require('./routes/ventas');
const dellersRoutes = require('./routes/dellers');

require('./db/connection'); // conexión a la base de datos

// 🌍 Configurar variables de entorno
dotenv.config();

// 🚀 Crear instancia de la app
const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middleware
app.use(cors()); // permite conexión con Angular
app.use(express.json({ limit: '5mb' })); // permite imágenes más grandes
app.use(express.urlencoded({ extended: true, limit: '5mb' }));


// ✅ Servir imágenes
app.use('/uploads', express.static('public/uploads'));

// 📦 Rutas
app.use('/api/dellers', dellersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/control-horarios', controlHorariosRoutes);
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/regalos', regalosRoutes);
app.use('/api/canjes', canjesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// ✅ Ruta de prueba (opcional)
app.get('/', (req, res) => {
  res.send('✅ API CarWash funcionando correctamente');
});

// 🟢 Levantar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});




