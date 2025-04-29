const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Registro de usuario
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email, status: 'validated' });
    if (existingUser) {
      return res.status(409).json({ msg: 'El email ya está registrado y validado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();

    const user = new User({ email, password: hashedPassword, code, attempts: 0 });
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Código de verificación',
      text: `Tu código de verificación es: ${code}`,
      html: `<p>Hola,</p><p>Gracias por registrarte. Tu código es: <strong>${code}</strong></p>`
    });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ email: user.email, status: user.status, role: user.role, token });

  } catch (error) {
    console.error('[register] Error al registrar usuario:', error);
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ msg: 'El email ya está registrado.' });
    }
    res.status(500).json({ msg: 'Error interno al registrar usuario', error });
  }
};

// Validar email con código
exports.validateEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    if (!user.code) {
      return res.status(400).json({ msg: 'No hay código de validación asociado a este usuario.' });
    }

    if (user.code !== req.body.code) {
      user.attempts += 1;
      await user.save();
      return res.status(400).json({ msg: 'Código incorrecto' });
    }

    // Código correcto: validamos email y actualizamos estado
    user.status = 'validated';
    user.code = null;
    user.attempts = 0;
    await user.save();

    res.json({ msg: 'Email validado correctamente' });

  } catch (error) {
    console.error('[validateEmail] Error al validar el código:', error);
    res.status(401).json({ msg: 'Token inválido o expirado', error });
  }
};


// Login de usuario
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    if (user.status !== 'validated') {
      return res.status(403).json({ msg: 'Email no validado' });
    }

    const passwordOK = await bcrypt.compare(password, user.password);
    if (!passwordOK) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ email: user.email, status: user.status, role: user.role, token });

  } catch (error) {
    console.error('[login] Error en el login:', error);
    res.status(500).json({ msg: 'Error interno al iniciar sesión', error });
  }
};

// Subir logo
exports.uploadLogo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    if (!req.file) return res.status(400).json({ msg: 'No se ha subido ningún archivo' });

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    user.logoUrl = imageUrl;

    await user.save();

    res.json({ msg: 'Logo subido correctamente', logoUrl: imageUrl });
  } catch (error) {
    console.error('[uploadLogo] Error al subir el logo:', error);
    res.status(500).json({ msg: 'Error al subir el logo', error });
  }
};

// Obtener perfil
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -code -__v');
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    console.error('[getProfile] Error al obtener perfil:', error);
    res.status(500).json({ msg: 'Error al obtener perfil', error });
  }
};

// Eliminar usuario (soft/hard delete)
exports.deleteUser = async (req, res) => {
  try {
    const soft = req.query.soft !== 'false';

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    if (soft) {
      user.status = 'deleted';
      await user.save();
      return res.json({ msg: 'Usuario marcado como eliminado (soft delete)' });
    } else {
      await User.deleteOne({ _id: user._id });
      return res.json({ msg: 'Usuario eliminado permanentemente (hard delete)' });
    }
  } catch (error) {
    console.error('[deleteUser] Error al eliminar usuario:', error);
    res.status(500).json({ msg: 'Error al eliminar el usuario', error });
  }
};

// Solicitar código de recuperación
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const code = generateCode();
    user.resetCode = code;
    user.resetCodeExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await user.save();

    res.json({ msg: 'Código de recuperación generado', code }); // temporal para pruebas
  } catch (error) {
    console.error('[forgotPassword] Error al generar código de recuperación:', error);
    res.status(500).json({ msg: 'Error al generar código de recuperación', error });
  }
};

// Resetear contraseña
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.resetCode !== code) {
      return res.status(400).json({ msg: 'Código inválido o usuario no encontrado' });
    }

    if (user.resetCodeExpiration < new Date()) {
      return res.status(400).json({ msg: 'El código ha expirado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpiration = null;

    await user.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('[resetPassword] Error al actualizar contraseña:', error);
    res.status(500).json({ msg: 'Error al actualizar la contraseña', error });
  }
};

// Invitar usuario
exports.inviteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;

  try {
    const inviter = await User.findById(req.user.id);
    if (!inviter) return res.status(404).json({ msg: 'Usuario invitador no encontrado' });

    if (!inviter.company || !inviter.company.name) {
      return res.status(400).json({ msg: 'No puedes invitar si no tienes una compañía asociada' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ msg: 'Ese email ya está registrado' });

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const code = generateCode();

    const invitedUser = new User({
      email,
      password: hashedPassword,
      role: 'guest',
      status: 'pending',
      code,
      company: inviter.company
    });

    await invitedUser.save();

    const token = jwt.sign({ id: invitedUser._id, email: invitedUser.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ msg: 'Usuario invitado correctamente', tempPassword, code, email, token });

  } catch (error) {
    console.error('[inviteUser] Error al invitar usuario:', error);
    res.status(500).json({ msg: 'Error al invitar al usuario', error });
  }
};
