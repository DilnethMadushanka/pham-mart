// Helpers for matching prescriptions against the doctor database.

const normalizeReg = (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const normalizeName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\bdr\.?\s*/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Placeholder values the app stores when a patient gives no doctor details.
const PLACEHOLDER_REGS = new Set(["VERIFYSLMC", "DIRECTORDER"]);

export function doctorLabel(doctor) {
  return `${doctor.name} · ${doctor.slmcNo} · ${doctor.id}`;
}

// The linked doctor, or the best guess from the registration number or name
// written on the prescription. Returns { doctor, how } where how is
// "linked", "registration" or "name".
export function findDoctorForPrescription(rx, doctors = []) {
  if (!rx) return { doctor: null, how: null };
  if (rx.doctorId) {
    const linked = doctors.find(d => d.id === rx.doctorId);
    if (linked) return { doctor: linked, how: "linked" };
  }
  const reg = normalizeReg(rx.doctorSlmcNo);
  if (reg && !PLACEHOLDER_REGS.has(reg)) {
    const byReg = doctors.find(d => normalizeReg(d.slmcNo) === reg);
    if (byReg) return { doctor: byReg, how: "registration" };
  }
  const name = normalizeName(rx.doctorName);
  if (name.length >= 3) {
    const byName = doctors.filter(d => normalizeName(d.name) === name);
    if (byName.length === 1) return { doctor: byName[0], how: "name" };
  }
  return { doctor: null, how: null };
}

export function searchDoctors(doctors, query) {
  const q = query.trim().toLowerCase();
  if (!q) return doctors;
  const reg = normalizeReg(query);
  return doctors.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.id.toLowerCase().includes(q) ||
    (reg && normalizeReg(d.slmcNo).includes(reg)) ||
    (d.phone || "").replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
    (d.specialty || "").toLowerCase().includes(q) ||
    (d.hospital || "").toLowerCase().includes(q)
  );
}
