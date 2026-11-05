const { clinicDate } = require('../helpers/clinicDate');
const sequelize = require('../config/sequelize');
const { canTransition } = require('../helpers/workflow');
const { Registration, Patient, Doctor, Clinic } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const getTodayQueues = async (req, res) => {
  try {
    const today = clinicDate();

    const queues = await Registration.findAll({
      where: {
        visit_date: today
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Clinic, as: 'clinic' }
      ],
      order: [['id', 'ASC']]
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
    const today = clinicDate();
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
      order: [['id', 'ASC']]
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

    if (!canTransition(registration.status, status) || status === 'Selesai') {
      return res.status(409).json({ success: false, message: 'Urutan status tidak valid. Selesaikan pasien melalui pemeriksaan dokter.' });
    }
    const [changed] = await Registration.update({ status }, { where: { id, status: registration.status } });
    if (!changed && registration.status !== status) {
      return res.status(409).json({ success: false, message: 'Status sudah berubah. Muat ulang antrean.' });
    }

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
      order: [['visit_date', 'DESC'], ['id', 'ASC']]
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

const callNextQueue = async (req, res) => {
  try {
    const queue = await sequelize.transaction(async transaction => {
      const next = await Registration.findOne({
        where: { visit_date: clinicDate(), status: 'Menunggu' },
        order: [['id', 'ASC']], transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!next) return null;
      await next.update({ status: 'Check In' }, { transaction });
      return next;
    });
    res.json({ success: true, data: queue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memanggil antrean. Silakan coba lagi.' });
  }
};

module.exports = {
  callNextQueue,
  getTodayQueues,
  getNextQueue,
  updateQueueStatus,
  getQueueHistory
};
