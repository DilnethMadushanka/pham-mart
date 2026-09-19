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
  Pill
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
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRx, setSubmittedRx] = useState(null);

  const handleAddQuickMedicine = () => {
    if (!selectedQuickMedicine) return;
    const medObj = medicines.find(m => m.id === selectedQuickMedicine || m.name === selectedQuickMedicine);
    const itemName = medObj ? medObj.name : selectedQuickMedicine;
    
    setCustomTypedItems(prev => [
      ...prev,
      {
        medicineId: medObj?.id || `MED-CUSTOM-${Date.now()}`,
        name: itemName,
        dosage: medObj?.dosage || "As requested",
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
      alert("Please enter your full name and contact mobile phone number.");
      return;
    }

    const hasPhoto = selectedFile || previewUrl;
    const hasTypedItems = customTypedItems.length > 0 || typedMedicinesText.trim().length > 0;

    if (!hasPhoto && !hasTypedItems) {
      alert("Please EITHER attach a doctor prescription photo OR type in the required medicine names.");
      return;
    }

    setIsSubmitting(true);

    const fileName = selectedFile ? selectedFile.name : (hasPhoto ? "doctor_prescription_slip.jpg" : "None");
    const rxRefNumber = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Compile medicines array
    let compiledMedicines = [...customTypedItems];
    if (typedMedicinesText.trim()) {
      compiledMedicines.push({
        medicineId: `MED-TYPED-${Date.now()}`,
        name: `Typed Order: ${typedMedicinesText.trim()}`,
        dosage: "As requested by patient",
        quantity: 1,
        durationDays: 30
      });
    }

    if (compiledMedicines.length === 0) {
      compiledMedicines = [
        { 
          medicineId: "MED-101", 
          name: "Prescribed Medication (See Attached Photo Slip)", 
          dosage: "As per doctor prescription photo", 
          durationDays: 30, 
          quantity: 60 
        }
      ];
    }

    const orderTypeLabel = hasPhoto && hasTypedItems 
      ? "Photo Slip + Typed Medicines" 
      : hasPhoto 
      ? "Doctor Slip Photo Upload" 
      : "Typed Medicine Custom Order";

    const newRx = {
      id: `RX-${Math.floor(950 + Math.random() * 50)}`,
      rxNumber: rxRefNumber,
      customerId: currentUser?.id || "CUST-301",
      customerName: patientName,
      doctorName: hasPhoto ? "Doctor Prescription (Patient Photo)" : "Patient Direct Medicine Order",
      doctorSlmcNo: hasPhoto ? "VERIFY-SLMC" : "DIRECT-ORDER",
      uploadDate: new Date().toLocaleString(),
      expiryDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      medicines: compiledMedicines,
      isControlledDrug: false,
      status: "Pending",
      orderType: orderTypeLabel,
      verifiedBy: null,
      verifiedAt: null,
      prescriptionUrl: previewUrl || (hasPhoto ? "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop" : null),
      notes: `Order Type: ${orderTypeLabel}. Address: ${deliveryAddress}. Remarks: ${patientNotes || 'None'}`
    };

    // Save to Supabase DB in real-time
    const { error } = await createPrescription(newRx);

    if (error) {
      console.warn("Supabase prescription save note:", error.message);
    }

    setPrescriptions(prev => [newRx, ...prev]);
    if (addAuditLog) {
      addAuditLog("Patient Order Submitted", `Patient ${patientName} submitted order ${newRx.rxNumber} (${orderTypeLabel}) for Pharmacist review`, "info");
    }
    
    setIsSubmitting(false);
    setSubmittedRx(newRx);
  };

  const handleResetForm = () => {
    setSubmittedRx(null);
    setSelectedFile(null);
    setPreviewUrl(null);
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
          <span className="px-3.5 py-1 bg-blue-100 text-blue-900 text-xs font-extrabold rounded-full border border-blue-300">
            Pharmacist Verification Pending
          </span>
          <h2 className="text-2xl font-black text-slate-900">Order & Prescription Submitted!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Your medicine request has been safely received. Our duty Pharmacist will review your order details and prepare your medication.
          </p>
        </div>

        {/* Reference Details Box */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Order Reference No:</span>
            <span className="font-mono font-black text-blue-800 text-sm">{submittedRx.rxNumber}</span>
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

          {/* Requested Items Summary */}
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold block uppercase text-[10px] tracking-wider">Requested Items:</span>
            {submittedRx.medicines.map((m, idx) => (
              <div key={idx} className="font-bold text-slate-800 flex justify-between bg-white p-2 rounded-lg border border-slate-200">
                <span>{m.name}</span>
                <span className="text-blue-700 font-black">{m.quantity} units</span>
              </div>
            ))}
          </div>
        </div>

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
          <span>Submit Another Order / Prescription</span>
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
              <h2 className="text-xl font-black text-slate-900">Order Medicines & Upload Prescription</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-extrabold border border-blue-200">
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
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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
              <label className="font-black text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                <Pencil className="w-4 h-4 text-blue-600" />
                <span>Type Required Medicine Names & Quantities</span>
              </label>
              <span className="text-[10.5px] font-extrabold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                Custom Order
              </span>
            </div>

            {/* Quick Picker Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedQuickMedicine}
                onChange={(e) => setSelectedQuickMedicine(e.target.value)}
                className="w-full sm:flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="">-- Select from Medicine Catalog --</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.dosage}) - Rs. {m.unitPrice}</option>
                ))}
              </select>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={quickQty}
                  onChange={(e) => setQuickQty(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-center"
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
                      <span className="text-slate-400 font-normal ml-2">({item.dosage})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-700 font-black">{item.quantity} units</span>
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
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
                  <p className="text-[10.5px] text-slate-400">Mobile camera photo or desktop image (JPG, PNG, PDF up to 10MB)</p>
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
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden text-xs"
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
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden text-xs"
              />
            </div>
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
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden text-xs"
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
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-xs"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer uppercase tracking-wide"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>SAVING TO PHARMACY DATABASE...</span>
            </>
          ) : (
            <>
              <span>SUBMIT ORDER TO PHARMACIST</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </form>

    </div>
  );
}
