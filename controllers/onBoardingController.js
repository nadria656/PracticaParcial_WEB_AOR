const { validationResult } = require('express-validator');
const User = require('../models/user');

// Actualizar datos personales del usuario
exports.onboardingPersonal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const { name, surname, nif } = req.body;

    user.name = name;
    user.surname = surname;
    user.nif = nif;

    await user.save();

    res.json({ msg: 'Datos personales actualizados correctamente', user });

  } catch (error) {
    console.error('[onboardingPersonal] Error al actualizar datos personales:', error);
    res.status(500).json({ msg: 'Error interno al actualizar datos personales', error });
  }
};

// Actualizar o crear datos de la compañía del usuario
exports.onboardingCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const { isFreelance, name, cif, address } = req.body;

    if (isFreelance) {
      user.company = {
        name: `${user.name} ${user.surname}`,
        cif: user.nif,
        address: 'Dirección no especificada'
      };
    } else {
      if (!name || !cif || !address) {
        return res.status(400).json({ msg: 'Faltan datos de la compañía' });
      }

      user.company = { name, cif, address };
    }

    await user.save();

    res.json({ msg: 'Datos de la compañía actualizados correctamente', company: user.company });

  } catch (error) {
    console.error('[onboardingCompany] Error al actualizar datos de la compañía:', error);
    res.status(500).json({ msg: 'Error interno al actualizar datos de la compañía', error });
  }
};
