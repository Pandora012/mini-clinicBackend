const { Registration, Patient, Doctor, Clinic } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const getTodayQueues = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const queues = await Registration.findAll({
      where: {
        visit_date: today
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ],
      order: [['queue_number', 'ASC']]
    });

    const waitingCount = await Registration.count({
      where: {
        visit_date: today,
        status: 'Menunggu'
      }
    });

    const inProgressCount = await Registration.count({
      where: {
        visit_date: today,
        status: 'Pemeriksaan'
      }
    });

    const completedCount = await Registration.count({
      where: {
        visit_date: today,
        status: 'Selesai'
      }
    });

    res.json({
      success: true,
      data: queues,
      stats: {
        waiting: waitingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        total: queues.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getNextQueue = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { doctor_id, clinic_id } = req.query;

    const whereClause = {
      visit_date: today,
      status: 'Menunggu'
    };

    if (doctor_id) whereClause.doctor_id = doctor_id;
    if (clinic_id) whereClause.clinic_id = clinic_id;

    const nextQueue = await Registration.findOne({
      where: whereClause,
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ],
      order: [['queue_number', 'ASC']]
    });

    if (!nextQueue) {
      return res.json({
        success: true,
        message: 'No queue available',
        data: null
      });
    }

    res.json({
      success: true,
      data: nextQueue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateQueueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await Registration.findByPk(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }

    await registration.update({ status });

    const updatedQueue = await Registration.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ]
    });

    res.json({
      success: true,
      message: 'Queue status updated successfully',
      data: updatedQueue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getQueueHistory = async (req, res) => {
  try {
    const { date, patient_id } = req.query;

    const whereClause = {};
    if (date) whereClause.visit_date = date;
    if (patient_id) whereClause.patient_id = patient_id;

    const queues = await Registration.findAll({
      where: whereClause,
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ],
      order: [['visit_date', 'DESC'], ['queue_number', 'ASC']]
    });

    res.json({
      success: true,
      data: queues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTodayQueues,
  getNextQueue,
  updateQueueStatus,
  getQueueHistory
};