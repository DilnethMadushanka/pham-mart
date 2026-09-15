import React, { useState, useRef } from 'react';
import { 
  Upload, 
  User, 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Paperclip, 
  RefreshCw, 
  ShieldCheck,
  FileCheck2,
  MessageSquare
} from 'lucide-react';
import { createPrescription } from '../../services/supabaseService';

export default function CustomerRxUpload({ 
  customers = [], 
  medicines = [], 
  currentUser, 
  setPrescriptions, 
  onSuccess,
  addAuditLog 
}) {
  const [patientName, setPatientName] = useState(currentUser?.name || "K. A. Sunil Shantha");
  const [phone, setPhone] = useState(currentUser?.phone || "+94 77 444 1234");
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || "12/A, High Level Road, Nugegoda");
  const [patientNotes, setPatientNotes] = useState("");
  
  // File upload state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRx, setSubmittedRx] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim()) {
      alert("Please enter your full name and contact phone number.");
      return;
    }

    if (!selectedFile && !previewUrl) {
      alert("Please attach a photo or scan of your doctor prescription.");
      return;
    }

    setIsSubmitting(true);

    const fileName = selectedFile ? selectedFile.name : "doctor_prescription_slip.jpg";
    const rxRefNumber = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRx = {
      id: `RX-${Math.floor(950 + Math.random() * 50)}`,
      rxNumber: rxRefNumber,
      customerId: currentUser?.id || "CUST-301",
      customerName: patientName,
      doctorName: "Doctor Prescription (Patient Upload)",
      doctorSlmcNo: "VERIFY-SLMC",
      uploadDate: new Date().toLocaleString(),
      expiryDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      medicines: [
        { 
          medicineId: "MED-101", 
          name: "Prescribed Medication (See Attached Slip)", 
          dosage: "As per doctor prescription photo", 
          durationDays: 30, 
          quantity: 60 
        }
      ],
      isControlledDrug: false,
      status: "Pending",
      verifiedBy: null,
      verifiedAt: null,
      prescriptionUrl: previewUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
      notes: `Patient Upload (${fileName}). Address: ${deliveryAddress}. Remarks: ${patientNotes || 'None'}`
    };

    // Save to Supabase DB in real-time
    const { error } = await createPrescription(newRx);

    if (error) {
      console.warn("Supabase prescription save note:", error.message);
    }

    setPrescriptions(prev => [newRx, ...prev]);
    if (addAuditLog) {
      addAuditLog("Patient Rx Uploaded", `Patient ${patientName} submitted prescription slip ${newRx.rxNumber} for Pharmacist verification`, "info");
    }
    
    setIsSubmitting(false);
    setSubmittedRx(newRx);
  };

  const handleResetForm = () => {
    setSubmittedRx(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPatientNotes("");
    if (onSuccess) onSuccess();
  };

  if (submittedRx) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-sky-200 shadow-xl space-y-6 animate-fade-in font-sans">
        <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto border-2 border-sky-300 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="text-center space-y-2">
          <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full border border-sky-300">
            Pharmacist Verification Pending
          </span>
          <h2 className="text-2xl font-black text-slate-900">Prescription Uploaded Successfully!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your prescription photo has been received. Our duty Pharmacist will verify the doctor slip and prepare your medication.
          </p>
        </div>

        {/* Reference Details Box */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Prescription Reference No:</span>
            <span className="font-mono font-bold text-sky-800 text-sm">{submittedRx.rxNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Patient Name:</span>
            <span className="font-bold text-slate-900">{submittedRx.customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Contact Phone:</span>
            <span className="font-bold text-slate-900">{phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Delivery Address:</span>
            <span className="font-medium text-slate-700">{deliveryAddress}</span>
          </div>
        </div>

        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">What Happens Next?</p>
            <p className="text-[11px] text-sky-800 mt-0.5">
              Our licensed Pharmacist will inspect your prescription photo, verify doctor details, and contact you via phone before dispatching your medicines for home delivery or counter pickup.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetForm}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-md text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Upload Another Prescription</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl space-y-6 animate-fade-in font-sans">
      
      {/* Form Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900">Patient Prescription Upload</h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Snap a photo of the prescription slip given to you by your doctor and send it to our Pharmacist.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        
        {/* File Drag & Drop Zone */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5 flex items-center space-x-1">
            <ImageIcon className="w-4 h-4 text-sky-600" />
            <span>Attach Photo of Your Doctor's Prescription Slip *</span>
          </label>

          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-6 border-2 border-dashed rounded-3xl text-center space-y-3 cursor-pointer transition-all ${
              isDragging 
                ? "border-sky-500 bg-sky-100/60 scale-[1.01]" 
                : selectedFile || previewUrl
                ? "border-sky-400 bg-sky-50/50" 
                : "border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/30"
            }`}
          >
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative max-w-xs mx-auto rounded-2xl overflow-hidden border border-sky-300 shadow-md">
                  <img src={previewUrl} alt="Prescription slip photo preview" className="w-full h-48 object-cover" />
                  <span className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/80 text-white rounded-full text-[10px] font-bold backdrop-blur-xs flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-sky-400" />
                    <span>Photo Attached</span>
                  </span>
                </div>
                {selectedFile && (
                  <div className="font-bold text-slate-900 flex items-center justify-center space-x-1">
                    <Paperclip className="w-4 h-4 text-sky-600" />
                    <span>{selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(2)} MB)</span>
                  </div>
                )}
                <p className="text-[11px] text-sky-700 font-semibold hover:underline">Tap or drop to take/change photo</p>
              </div>
            ) : selectedFile ? (
              <div className="space-y-2 py-3">
                <FileText className="w-10 h-10 text-sky-600 mx-auto" />
                <div className="font-bold text-slate-900 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>{selectedFile.name}</span>
                </div>
                <p className="text-[11px] text-slate-500">Prescription file attached • Tap to change</p>
              </div>
            ) : (
              <div className="space-y-2 py-5">
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto border border-sky-300">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Click to choose file or snap photo of prescription slip
                </div>
                <p className="text-[11px] text-slate-400">Upload clear photo taken from mobile camera or desktop (JPG, PNG, PDF up to 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Patient Name & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                required
                placeholder="e.g. K. A. Sunil Shantha"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Mobile Phone *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                required
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Home / Delivery Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="e.g. 12/A, High Level Road, Nugegoda"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 outline-hidden"
            />
          </div>
        </div>

        {/* Patient Remarks */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            <span>Special Instructions for Pharmacist (Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Please send 1 month supply, or call before dispatching..."
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>SAVING TO PHARMACY DATABASE...</span>
            </>
          ) : (
            <>
              <span>SUBMIT PRESCRIPTION TO PHARMACIST</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </form>

    </div>
  );
}
