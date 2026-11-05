const sequelize = require('../config/sequelize');
const { Patient, Registration } = require('../models');
const { generateMedicalRecordNumber } = require('../helpers/generator');
const patientValues = body => Object.fromEntries(['nik', 'name', 'gender', 'birth_date', 'phone', 'address'].filter(key => body[key] !== undefined).map(key => [key, body[key]]));
const { Op } = require('sequelize');

const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { nik: { [Op.like]: `%${search}%` } },
        { medical_record_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Patient.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createPatient = async (req, res) => {
  try {
    const patient = await sequelize.transaction(async transaction => {
      const medical_record_number = await generateMedicalRecordNumber(transaction);

      return Patient.create({
      ...patientValues(req.body),
      medical_record_number
      }, { transaction });
    });

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'NIK already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await patient.update(patientValues(req.body));

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'NIK already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (await Registration.count({ where: { patient_id: patient.id } })) {
      return res.status(409).json({ success: false, message: 'Pasien memiliki riwayat kunjungan dan tidak dapat dihapus.' });
    }
    await patient.destroy();

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
