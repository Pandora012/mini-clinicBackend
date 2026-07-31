const { Patient } = require('../models');

const generateMedicalRecordNumber = async () => {
  const lastPatient = await Patient.findOne({
    order: [['id', 'DESC']]
  });

  let nextNumber = 1;
  if (lastPatient && lastPatient.medical_record_number) {
    const lastNumber = parseInt(lastPatient.medical_record_number.replace('RM', ''));
    nextNumber = lastNumber + 1;
  }

  return `RM${String(nextNumber).padStart(6, '0')}`;
};

const generateQueueNumber = async (visitDate) => {
  const { Registration } = require('../models');
  
  const today = visitDate || new Date().toISOString().split('T')[0];
  
  const lastQueue = await Registration.findOne({
    where: {
      visit_date: today
    },
    order: [['queue_number', 'DESC']]
  });

  let nextNumber = 1;
  if (lastQueue && lastQueue.queue_number) {
    const lastNumber = parseInt(lastQueue.queue_number.replace('A', ''));
    nextNumber = lastNumber + 1;
  }

  return `A${String(nextNumber).padStart(3, '0')}`;
};

module.exports = { generateMedicalRecordNumber, generateQueueNumber };