const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE || 'Asia/Jakarta';
const clinicDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};
module.exports = { clinicDate };
