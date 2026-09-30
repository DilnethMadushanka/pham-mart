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
  MessageSquare,
  Pencil,
  PlusCircle,
  Trash2,
  Pill,
  Stethoscope
} from 'lucide-react';
import { submitPrescription } from '../../services/supabaseService';
import { notify, notifyError } from '../../lib/notify';

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

// Phone photos are several MB; shrink them to a sharp but small JPEG before upload.
async function compressImage(file) {
  const source = await readAsDataUrl(file);
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = source;
  });
  const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export default function CustomerRxUpload({ 
  medicines = [], 
  currentUser, 
  setPrescriptions, 
  onSuccess,
  onRequestSignIn
}) {
  const [patientName, setPatientName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || "");
  const [patientNotes, setPatientNotes] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorSlmcNo, setDoctorSlmcNo] = useState("");
  
  // Submission mode: "photo" | "typed" | "both"
  const [orderMethod, setOrderMethod] = useState("both"); // Default "both" gives maximum flexibility!

  // Typed medicine list state
  const [typedMedicinesText, setTypedMedicinesText] = useState("");
  const [selectedQuickMedicine, setSelectedQuickMedicine] = useState("");
  const [quickQty, setQuickQty] = useState(1);
  const [customTypedItems, setCustomTypedItems] = useState([]);

  // File upload state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRx, setSubmittedRx] = useState(null);

  const handleAddQuickMedicine = () => {
    if (!selectedQuickMedicine) return;
    const medObj = medicines.find(m => m.id === selectedQuickMedicine);
    if (!medObj) return;
    
    setCustomTypedItems(prev => [
      ...prev,
      {
        medicineId: medObj.id,
        name: medObj.name,
        dosage: medObj.dosage || medObj.genericName || "",
        quantity: quickQty,
        durationDays: 30
      }
    ]);
    setSelectedQuickMedicine("");
    setQuickQty(1);
  };

  const handleRemoveTypedItem = (index) => {
    setCustomTypedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      notify("File not supported", "Attach a photo (JPG, PNG, WEBP) or a PDF of the prescription.", "error");
      return;
    }
    if ((isPdf && file.size > MAX_PDF_BYTES) || (isImage && file.size > MAX_IMAGE_BYTES)) {
      notify("File too large", isPdf ? "PDFs must be under 5 MB." : "Photos must be under 15 MB.", "error");
      return;
    }
    setIsPreparingFile(true);
    try {
      const dataUrl = isImage ? await compressImage(file) : await readAsDataUrl(file);
      setSelectedFile(file);
      setFileDataUrl(dataUrl);
      setPreviewUrl(isImage ? dataUrl : null);
    } catch {
      notify("Couldn't read that file", "Please try another photo or PDF.", "error");
    } finally {
      setIsPreparingFile(false);
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
    if (isSubmitting || isPreparingFile) return;
    if (!patientName.trim() || !phone.trim()) {
      notify("Details needed", "Please enter your full name and a mobile number.", "error");
      return;
    }

    const usesTyped = orderMethod === "typed" || orderMethod === "both";
    const usesPhoto = orderMethod === "photo" || orderMethod === "both";
    const file = usesPhoto ? fileDataUrl : null;

    const compiledMedicines = usesTyped ? [...customTypedItems] : [];
    if (usesTyped && typedMedicinesText.trim()) {
      compiledMedicines.push({
        medicineId: null,
        name: typedMedicinesText.trim(),
        dosage: "As requested by patient",
        quantity: 1
      });
    }

    if (!file && compiledMedicines.length === 0) {
      notify("Nothing to send", "Attach a prescription photo or list the medicines you need.", "error");
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await submitPrescription({
      customerName: patientName,
      contactPhone: phone,
      deliveryAddress,
      notes: patientNotes,
      doctorName: doctorName.trim() || null,
      doctorSlmcNo: doctorSlmcNo.trim() || null,
      medicines: compiledMedicines
    }, file);
    setIsSubmitting(false);

    if (error) {
      notifyError(error, "Order not sent");
      return;
    }

    if (currentUser && setPrescriptions) {
      setPrescriptions(prev => [data, ...prev.filter(p => p.id !== data.id)]);
    }
    setSubmittedRx(data);
  };

  const handleResetForm = () => {
    setSubmittedRx(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileDataUrl(null);
    setPatientNotes("");
    setTypedMedicinesText("");
    setCustomTypedItems([]);
    if (onSuccess) onSuccess();
  };

  if (submittedRx) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-blue-200 shadow-xl space-y-6 animate-fade-in font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-blue-100 text-blue-900 text-xs font-semibold rounded-full border border-blue-300">
            Pharmacist Verification Pending
          </span>
          <h2 className="text-2xl font-semibold text-slate-900">Order & Prescription Submitted!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Your medicine request has been safely received. Our duty Pharmacist will review your order details and prepare your medication.
          </p>
        </div>

        {/* Reference Details Box */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Order Reference No:</span>
            <span className="font-mono font-semibold text-blue-800 text-sm">{submittedRx.rxNumber}</span>
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
            <span className="font-medium text-slate-700">{deliveryAddress || "Pickup at pharmacy"}</span>
          </div>

          {/* Requested Items Summary */}
          {submittedRx.medicines.length > 0 && (
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold block uppercase text-[10px] tracking-wider">Requested Items:</span>
            {submittedRx.medicines.map((m, idx) => (
              <div key={idx} className="font-bold text-slate-800 flex justify-between bg-white p-2 rounded-lg border border-slate-200">
                <span>{m.name}</span>
                <span className="text-blue-700 font-semibold">{m.quantity} units</span>
              </div>
            ))}
          </div>
          )}
        </div>

        {!currentUser && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3">
            <span>Keep your reference number. The pharmacist will call you on {phone}. Sign in before your next order to track it online.</span>
            <button
              type="button"
              onClick={onRequestSignIn}
              className="px-3.5 py-2 bg-white border border-amber-300 rounded-xl font-semibold hover:bg-amber-100"
            >
              Sign in
            </button>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">What Happens Next?</p>
            <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
              Our licensed Pharmacist will inspect your prescription photo / requested medicine names, confirm dosage details, and contact you via phone before dispatching your order.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetForm}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{currentUser ? "View my orders" : "Back to the store"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-xl space-y-6 animate-fade-in font-sans">
      
      {/* Form Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-slate-900">Order Medicines & Upload Prescription</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-semibold border border-blue-200">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Upload a doctor prescription slip photo OR type in your required medicine names directly.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection Pills */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setOrderMethod("both")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            orderMethod === "both"
              ? "bg-white text-blue-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Pill className="w-4 h-4 text-blue-600" />
          <span>Photo + Typed Medicines</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderMethod("typed")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            orderMethod === "typed"
              ? "bg-white text-blue-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Pencil className="w-4 h-4 text-blue-600" />
          <span>Type Medicines Only</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderMethod("photo")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            orderMethod === "photo"
              ? "bg-white text-blue-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>Upload Photo Only</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        
        {/* 1. Type Required Medicines Section (Available in 'typed' and 'both' mode) */}
        {(orderMethod === "typed" || orderMethod === "both") && (
          <div className="bg-blue-50/60 p-5 rounded-3xl border border-blue-200/80 space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                <Pencil className="w-4 h-4 text-blue-600" />
                <span>Type Required Medicine Names & Quantities</span>
              </label>
              <span className="text-[10.5px] font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                Custom Order
              </span>
            </div>

            {/* Quick Picker Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedQuickMedicine}
                onChange={(e) => setSelectedQuickMedicine(e.target.value)}
                className="w-full sm:flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              >
                <option value="">-- Select from Medicine Catalog --</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name}{m.genericName ? ` (${m.genericName})` : ""} - Rs. {Number(m.unitPrice).toFixed(2)}</option>
                ))}
              </select>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={quickQty}
                  onChange={(e) => setQuickQty(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-center"
                  placeholder="Qty"
                />

                <button
                  type="button"
                  onClick={handleAddQuickMedicine}
                  disabled={!selectedQuickMedicine}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl flex items-center space-x-1 shadow-sm cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Added Typed Items List */}
            {customTypedItems.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500">Selected Items ({customTypedItems.length}):</span>
                {customTypedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-xs font-bold text-slate-800">
                    <div>
                      <span>{item.name}</span>
                      {item.dosage && <span className="text-slate-400 font-normal ml-2">({item.dosage})</span>}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-700 font-semibold">{item.quantity} units</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTypedItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Or Free Text Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Or Type Custom Medicine Names / Instructions manually:
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Paracetamol 500mg (2 strips), Cetirizine 10mg (1 box), Vitamin C 500mg..."
                value={typedMedicinesText}
                onChange={(e) => setTypedMedicinesText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              />
            </div>
          </div>
        )}

        {/* 2. File Drag & Drop Zone (Available in 'photo' and 'both' mode) */}
        {(orderMethod === "photo" || orderMethod === "both") && (
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Attach Photo of Doctor's Prescription Slip {orderMethod === "photo" ? "*" : "(Optional)"}</span>
              </span>
              {orderMethod === "both" && (
                <span className="text-[10px] font-bold text-slate-400">Optional if medicines typed above</span>
              )}
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
              className={`p-5 border-2 border-dashed rounded-3xl text-center space-y-2 cursor-pointer transition-all ${
                isDragging 
                  ? "border-blue-500 bg-blue-100/60 scale-[1.01]" 
                  : selectedFile || previewUrl
                  ? "border-blue-400 bg-blue-50/50" 
                  : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30"
              }`}
            >
              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative max-w-xs mx-auto rounded-2xl overflow-hidden border border-blue-300 shadow-md">
                    <img src={previewUrl} alt="Prescription slip photo preview" className="w-full h-44 object-cover" />
                    <span className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/80 text-white rounded-full text-[10px] font-bold backdrop-blur-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      <span>Photo Attached</span>
                    </span>
                  </div>
                  {selectedFile && (
                    <div className="font-bold text-slate-900 flex items-center justify-center space-x-1 text-xs">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span>{selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                  <p className="text-[11px] text-blue-700 font-semibold hover:underline">Tap or drop to change photo</p>
                </div>
              ) : selectedFile ? (
                <div className="space-y-2 py-2">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                  <div className="font-bold text-slate-900 flex items-center justify-center space-x-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Prescription file attached • Tap to change</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto border border-blue-300">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Click to choose file or snap photo of prescription slip
                  </div>
                  <p className="text-[10.5px] text-slate-400">{isPreparingFile ? "Preparing photo..." : "Phone camera photo, image, or PDF up to 5 MB"}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patient Name & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type="text"
                required
                placeholder="e.g. K. A. Sunil Shantha"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Mobile Phone *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type="text"
                required
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden text-xs"
              />
            </div>
          </div>
        </div>

        {/* Prescribing doctor (helps the pharmacist match the doctor database) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Doctor's Name (Optional)</label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="As written on the slip"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Doctor's SLMC Number (Optional)</label>
            <input
              type="text"
              placeholder="e.g. SLMC-10234"
              value={doctorSlmcNo}
              onChange={(e) => setDoctorSlmcNo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold font-mono focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden text-xs"
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Home / Delivery Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text"
              placeholder="e.g. 12/A, High Level Road, Nugegoda"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden text-xs"
            />
          </div>
        </div>

        {/* Patient Remarks */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Special Instructions for Pharmacist (Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Please send 1 month supply, or call before dispatching..."
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden text-xs"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isPreparingFile}
          className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#2563EB]/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Sending to the pharmacist...</span>
            </>
          ) : (
            <>
              <span>Send to pharmacist</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </form>

    </div>
  );
}
