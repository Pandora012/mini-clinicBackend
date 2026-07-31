const { Registration, Patient, Doctor, Clinic } = require('../models');
const { generateQueueNumber } = require('../helpers/generator');
const { Op } = require('sequelize');

const getAllRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', date = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (date) {
      whereClause.visit_date = date;
    }
    if (status) {
      whereClause.status = status;
    }

    const includeClause = [
      {
        model: Patient,
        as: 'patient',
        where: search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { nik: { [Op.like]: `%${search}%` } }
          ]
        } : undefined
      },
      {
        model: Doctor,
        as: 'doctor'
      },
      {
        model: Clinic,
        as: 'clinic'
      }
    ];

    const { count, rows } = await Registration.findAndCountAll({
      where: whereClause,
      include: includeClause.filter(inc => inc.where !== undefined || !search),
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['visit_date', 'DESC'], ['queue_number', 'ASC']]
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

const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ]
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createRegistration = async (req, res) => {
  try {
    const { patient_id, doctor_id, clinic_id, visit_date, payment_type, initial_complaint } = req.body;

    const queue_number = await generateQueueNumber(visit_date);

    const registration = await Registration.create({
      patient_id,
      doctor_id,
      clinic_id,
      visit_date,
      payment_type,
      initial_complaint,
      queue_number,
      status: 'Menunggu'
    });

    const registrationWithDetails = await Registration.findByPk(registration.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: registrationWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    await registration.update(req.body);

    const updatedRegistration = await Registration.findByPk(registration.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ]
    });

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: updatedRegistration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    await registration.destroy();

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration
};