const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

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

    const user = new User({
      email,
      password: hashedPassword,
      code,
      attempts: 0,
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });

    res.status(201).json({
      email: user.email,
      status: user.status,
      role: user.role,
      token
    });

  } catch (error) {
    // Manejo del error por email duplicado (único)
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ msg: 'El email ya está registrado.' });
    }

    res.status(500).json({ msg: 'Error del servidor', error });
  }
};


exports.validateEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'Token requerido' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
  
      if (user.code !== req.body.code) {
        user.attempts += 1;
        await user.save();
        return res.status(400).json({ msg: 'Código incorrecto' });
      }
  
      user.status = 'validated';
      user.code = null;
      user.attempts = 0;
      await user.save();
  
      res.json({ msg: '✅ Email validado correctamente' });
  
    } catch (error) {
      res.status(401).json({ msg: 'Token inválido o expirado', error });
    }
  };

  exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
  
      if (user.status !== 'validated') {
        return res.status(403).json({ msg: 'Email no validado' });
      }
  
      const passwordOK = await bcrypt.compare(password, user.password);
      if (!passwordOK) {
        return res.status(401).json({ msg: 'Contraseña incorrecta' });
      }
  
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '2h'
      });
  
      res.json({
        email: user.email,
        status: user.status,
        role: user.role,
        token
      });
  
    } catch (error) {
      res.status(500).json({ msg: 'Error en el servidor', error });
    }
};