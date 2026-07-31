const { Patient, Registration, Doctor, Clinic } = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalPatients = await Patient.count();

    const patientsToday = await Registration.count({
      distinct: true,
      col: 'patient_id',
      where: { visit_date: today }
    });

    const totalQueuesToday = await Registration.count({
      where: { visit_date: today }
    });

    const waitingPatients = await Registration.count({
      where: {
        visit_date: today,
        status: 'Menunggu'
      }
    });

    const completedPatients = await Registration.count({
      where: {
        visit_date: today,
        status: 'Selesai'
      }
    });

    const totalDoctors = await Doctor.count();

    const totalClinics = await Clinic.count();

    res.json({
      success: true,
      data: {
        totalPatients,
        patientsToday,
        totalQueuesToday,
        waitingPatients,
        completedPatients,
        totalDoctors,
        totalClinics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getRecentRegistrations = async (req, res) => {
  try {
    const recentRegistrations = await Registration.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ]
    });

    res.json({
      success: true,
      data: recentRegistrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPatientStatistics = async (req, res) => {
  try {
    const malePatients = await Patient.count({
      where: { gender: 'Laki-laki' }
    });

    const femalePatients = await Patient.count({
      where: { gender: 'Perempuan' }
    });

    const patientsByMonth = await Patient.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'month'],
        [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'year'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [
        Sequelize.fn('MONTH', Sequelize.col('created_at')),
        Sequelize.fn('YEAR', Sequelize.col('created_at'))
      ],
      order: [
        [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'DESC'],
        [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'DESC']
      ],
      limit: 12
    });

    res.json({
      success: true,
      data: {
        malePatients,
        femalePatients,
        patientsByMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentRegistrations,
  getPatientStatistics
};