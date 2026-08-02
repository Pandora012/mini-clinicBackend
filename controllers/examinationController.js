const { Examination, Registration, Patient, MedicalAction, Prescription, Doctor, Clinic } = require("../models");

const getExaminationByRegistrationId = async (req, res) => {
  try {
    const { registration_id } = req.params;

    const examination = await Examination.findOne({
      where: { registration_id },
      include: [
        {
          model: Registration,
          as: "registration",
          include: [{ model: Patient, as: "patient" }],
        },
        { model: MedicalAction, as: "medical_actions" },
        { model: Prescription, as: "prescriptions" },
      ],
    });

    if (!examination) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: examination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createExamination = async (req, res) => {
  try {
    const { registration_id, complaint, blood_pressure, body_temperature, body_weight, body_height, diagnosis, therapy_plan } = req.body;

    const examination = await Examination.create({
      registration_id,
      complaint,
      blood_pressure,
      body_temperature,
      body_weight,
      body_height,
      diagnosis,
      therapy_plan,
    });

    const fullExamination = await Examination.findByPk(examination.id, {
      include: [
        {
          model: Registration,
          as: "registration",
          include: [{ model: Patient, as: "patient" }],
        },
        { model: MedicalAction, as: "medical_actions" },
        { model: Prescription, as: "prescriptions" },
      ],
    });

    await Registration.update({ status: "Pemeriksaan" }, { where: { id: registration_id } });

    res.status(201).json({
      success: true,
      message: "Examination created successfully",
      data: fullExamination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateExamination = async (req, res) => {
  try {
    const examination = await Examination.findByPk(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    await examination.update(req.body);

    const updatedExamination = await Examination.findByPk(examination.id, {
      include: [
        {
          model: Registration,
          as: "registration",
          include: [{ model: Patient, as: "patient" }],
        },
        { model: MedicalAction, as: "medical_actions" },
        { model: Prescription, as: "prescriptions" },
      ],
    });

    res.json({
      success: true,
      message: "Examination updated successfully",
      data: updatedExamination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPatientHistory = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const examinations = await Examination.findAll({
      include: [
        {
          model: Registration,
          as: "registration",
          where: { patient_id },
          include: [
            { model: Doctor, as: "doctor" },
            { model: Clinic, as: "clinic" },
          ],
        },
        { model: MedicalAction, as: "medical_actions" },
        { model: Prescription, as: "prescriptions" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: examinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addMedicalAction = async (req, res) => {
  try {
    const { examination_id, action_name, notes } = req.body;

    const medicalAction = await MedicalAction.create({
      examination_id,
      action_name,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Medical action added successfully",
      data: medicalAction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addPrescription = async (req, res) => {
  try {
    const { examination_id, medicine_name, dosage, instruction } = req.body;

    const prescription = await Prescription.create({
      examination_id,
      medicine_name,
      dosage,
      instruction,
    });

    res.status(201).json({
      success: true,
      message: "Prescription added successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeExamination = async (req, res) => {
  try {
    const examination = await Examination.findByPk(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    await Registration.update({ status: "Selesai" }, { where: { id: examination.registration_id } });

    res.json({
      success: true,
      message: "Examination completed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getExaminationByRegistrationId,
  createExamination,
  updateExamination,
  getPatientHistory,
  addMedicalAction,
  addPrescription,
  completeExamination,
};
