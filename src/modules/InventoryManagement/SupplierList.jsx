import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Edit3, 
  Trash2, 
  Package, 
  Truck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building
} from 'lucide-react';
import AddSupplierModal from './AddSupplierModal';

export default function SupplierList({ 
  suppliers, 
  setSuppliers, 
  medicines = [],
  purchaseOrders = [],
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  addAuditLog 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const filteredSuppliers = suppliers.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) ||
           (s.contactPerson && s.contactPerson.toLowerCase().includes(term)) ||
           (s.phone && s.phone.includes(term)) ||
           (s.email && s.email.toLowerCase().includes(term));
  });

  const handleSaveSupplier = (supplierData) => {
    if (editingSupplier) {
      if (onUpdateSupplier) {
        onUpdateSupplier(supplierData.id, supplierData);
      } else {
        setSuppliers(prev => prev.map(s => s.id === supplierData.id ? supplierData : s));
      }
      if (addAuditLog) {
        addAuditLog("Supplier Record Updated", `Updated details for supplier: ${supplierData.name}`, "info");
      }
    } else {
      const newSup = {
        ...supplierData,
        id: supplierData.id || `SUP-${Math.floor(10 + Math.random() * 90)}`
      };
      if (onAddSupplier) {
        onAddSupplier(newSup);
      } else {
        setSuppliers(prev => [newSup, ...prev]);
      }
      if (addAuditLog) {
        addAuditLog("New Supplier Registered", `Registered new wholesale supplier: ${newSup.name}`, "success");
      }
    }
    setIsAddModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (supplier) => {
    if (window.confirm(`Are you sure you want to remove supplier "${supplier.name}"?`)) {
      if (onDeleteSupplier) {
        onDeleteSupplier(supplier.id);
      } else {
        setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
      }
      if (addAuditLog) {
        addAuditLog("Supplier Removed", `Deleted supplier record: ${supplier.name}`, "warning");
      }
    }
  };

  const avgLeadTime = suppliers.length > 0 
    ? (suppliers.reduce((acc, s) => acc + (s.leadTimeDays || 3), 0) / suppliers.length).toFixed(1)
    : "3.0";

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Enterprise Supply Chain
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Suppliers & Distributors
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-2xl leading-relaxed font-medium">
              Manage pharmaceutical manufacturers, lead-time SLAs, order fulfillment contacts, and wholesale contracts.
            </p>
          </div>

          <button
            onClick={() => { setEditingSupplier(null); setIsAddModalOpen(true); }}
            className="flex items-center space-x-2 px-6 py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Register New Supplier</span>
          </button>
        </div>
      </div>

      {/* Top Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Suppliers</span>
            <div className="text-3xl font-black text-slate-900 mt-1 group-hover:text-sky-600 transition-colors">
              {suppliers.length}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs font-bold text-sky-600">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>100% Active Distributors</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100 group-hover:scale-110 transition-transform">
            <Building2 className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Delivery Lead Time</span>
            <div className="text-3xl font-black text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">
              {avgLeadTime} <span className="text-sm font-bold text-slate-500">Days</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Standard Logistics SLA
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 group-hover:scale-110 transition-transform">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tracked Purchase Orders</span>
            <div className="text-3xl font-black text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
              {purchaseOrders.length}
            </div>
            <div className="text-xs font-bold text-indigo-600 mt-1">
              Supplier Orders Processed
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 group-hover:scale-110 transition-transform">
            <Truck className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search supplier name, contact person, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-extrabold">{filteredSuppliers.length}</span> of {suppliers.length} Suppliers
        </div>

      </div>

      {/* Supplier Grid Cards */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">No Suppliers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No wholesale suppliers matched your search query "{searchTerm}". Try a different keyword or add a new supplier.
          </p>
          <button
            onClick={() => { setSearchTerm(""); setIsAddModalOpen(true); }}
            className="px-5 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-sky-700 transition-colors cursor-pointer"
          >
            Add New Supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            const suppliedMedsCount = medicines.filter(m => 
              m.supplierId === supplier.id || 
              m.supplier_id === supplier.id || 
              (m.supplierName && m.supplierName.toLowerCase() === supplier.name.toLowerCase()) || 
              (m.supplier_name && m.supplier_name.toLowerCase() === supplier.name.toLowerCase())
            ).length;

            const supplierPOsCount = purchaseOrders.filter(po => 
              po.supplierId === supplier.id || 
              po.supplier_id === supplier.id || 
              (po.supplierName && po.supplierName.toLowerCase() === supplier.name.toLowerCase()) || 
              (po.supplier_name && po.supplier_name.toLowerCase() === supplier.name.toLowerCase())
            ).length;

            return (
              <div 
                key={supplier.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Hover Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Card Top Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 font-mono font-black text-xs border border-sky-200/80 shadow-2xs">
                        {supplier.id}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <Clock className="w-3 h-3 mr-1 text-emerald-600" />
                        Lead: {supplier.leadTimeDays || 3} Days
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => { setEditingSupplier(supplier); setIsAddModalOpen(true); }}
                        title="Edit Supplier"
                        className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier)}
                        title="Delete Supplier"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Supplier Company Name - Full, bold, unclipped */}
                  <div className="mb-4">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-sky-600 transition-colors break-words">
                      {supplier.name}
                    </h3>
                  </div>

                  {/* Contact Information Details Box */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2.5 border border-slate-100 text-xs">
                    
                    {supplier.contactPerson ? (
                      <div className="flex items-center space-x-2.5">
                        <User className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-bold text-slate-800">{supplier.contactPerson}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2.5 text-slate-400 font-medium">
                        <User className="w-4 h-4 shrink-0" />
                        <span>No contact person assigned</span>
                      </div>
                    )}

                    {supplier.phone ? (
                      <div className="flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`tel:${supplier.phone}`} className="font-mono text-slate-700 font-semibold hover:text-sky-600">
                          {supplier.phone}
                        </a>
                      </div>
                    ) : null}

                    {supplier.email ? (
                      <div className="flex items-center space-x-2.5 truncate">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`mailto:${supplier.email}`} className="text-sky-600 hover:underline font-medium truncate">
                          {supplier.email}
                        </a>
                      </div>
                    ) : null}

                    {supplier.address ? (
                      <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200/60">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-[11.5px] leading-relaxed font-medium">{supplier.address}</span>
                      </div>
                    ) : null}

                  </div>
                </div>

                {/* Card Bottom Metrics */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                      <Package className="w-4 h-4 text-sky-500" />
                      <span>{suppliedMedsCount} Medicines</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                      <Truck className="w-4 h-4 text-indigo-500" />
                      <span>{supplierPOsCount} Orders</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingSupplier(null); }}
        onSave={handleSaveSupplier}
        supplierToEdit={editingSupplier}
      />

    </div>
  );
}
