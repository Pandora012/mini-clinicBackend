const transitions = { Menunggu: ['Check In'], 'Check In': ['Pemeriksaan'], Pemeriksaan: ['Selesai'], Selesai: [] };
const canTransition = (from, to) => from === to || !!transitions[from]?.includes(to);
module.exports = { canTransition };
