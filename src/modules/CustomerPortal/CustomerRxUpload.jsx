import { createPrescription } from '../../services/supabaseService';

export default function CustomerRxUpload({ 
  customers, 
  medicines, 
  currentUser, 
  setPrescriptions, 
  onSuccess,
  addAuditLog 
}) {
  const [patientName, setPatientName] = useState(currentUser?.name || "K. A. Sunil Shantha");
  const [phone, setPhone] = useState(currentUser?.phone || "+94 77 444 1234");
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || "12/A, High Level Road, Nugegoda");
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || "");
  const [patientNotes, setPatientNotes] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("my_prescription_photo.jpg");
  const [isFileAttached, setIsFileAttached] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert("Please enter patient name and contact number.");
      return;
    }

    const med = medicines.find(m => m.id === selectedMedId);

    const newRx = {
      id: `RX-${Math.floor(950 + Math.random() * 50)}`,
      rxNumber: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: currentUser?.id || "CUST-301",
      customerName: patientName,
      doctorName: "Doctor Prescription (Attached File)",
      doctorSlmcNo: "VERIFY-SLMC",
      uploadDate: new Date().toLocaleString(),
      expiryDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      medicines: [
        { 
          medicineId: med?.id || "MED-101", 
          name: med?.name || "Prescribed Medication", 
          dosage: "As per doctor prescription photo", 
          durationDays: 30, 
          quantity: 60 
        }
      ],
      isControlledDrug: med?.controlledDrug || false,
      status: "Pending",
      verifiedBy: null,
      verifiedAt: null,
      notes: `Patient Upload (${uploadedFileName}). Address: ${deliveryAddress}. Notes: ${patientNotes || 'None'}`
    };

    // Save to Supabase DB
    await createPrescription(newRx);

    setPrescriptions(prev => [newRx, ...prev]);
    addAuditLog("Customer Rx Uploaded", `Customer ${patientName} submitted prescription ${newRx.rxNumber} for Pharmacist verification`, "info");
    
    alert(`Prescription submitted successfully!\n\nReference No: ${newRx.rxNumber}\nStatus: Under Review by Duty Pharmacist`);
    onSuccess();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-6 animate-fade-in">
      
      {/* Form Header */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
          <Upload className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Upload Doctor Prescription</h2>
          <p className="text-xs text-slate-500">Quick patient upload for Pharmacist review & home delivery</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Patient Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                required
                placeholder="e.g. K. A. Sunil Shantha"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                required
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Delivery Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="e.g. 12/A, High Level Road, Nugegoda"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </div>

        {/* Prescription Photo Attachment */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Attach Photo or Scan of Doctor Prescription *</label>
          <div className="p-6 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl text-center space-y-2 cursor-pointer hover:bg-emerald-50 transition-colors">
            <Image className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="font-bold text-slate-900 flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{uploadedFileName}</span>
            </div>
            <p className="text-[11px] text-slate-500">Tap to choose image file from mobile/desktop (JPG, PNG, PDF up to 10MB)</p>
          </div>
        </div>

        {/* Select Medication (Optional) */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Select Medicine Shown on Prescription</label>
          <select
            value={selectedMedId}
            onChange={(e) => setSelectedMedId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
          >
            {medicines.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.genericName}) - Rs. {m.unitPrice.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Patient Remarks / Notes */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Special Notes for Pharmacist (Optional)</label>
          <textarea
            rows={2}
            placeholder="e.g. Please send 1 month supply, or call before dispatching..."
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
        >
          <span>SUBMIT PRESCRIPTION TO PHARMACIST</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </form>

    </div>
  );
}
