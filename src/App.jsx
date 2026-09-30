import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NotificationDrawer from './components/NotificationDrawer';
import AuditLogModal from './components/AuditLogModal';
import AuthModal from './components/AuthModal';
import ToastNotification from './components/ToastNotification';
import DialogHost from './components/DialogHost';

// Customer Public Portal
import CustomerStorefront from './modules/CustomerPortal/CustomerStorefront';

// Internal Enterprise Modules
import StaffList from './modules/UserManagement/StaffList';
import MedicineList from './modules/InventoryManagement/MedicineList';
import PrescriptionVerification from './modules/CustomerPrescription/PrescriptionVerification';
import CustomerList from './modules/CustomerPrescription/CustomerList';
import POSTerminal from './modules/POSBilling/POSTerminal';
import AnalyticsDashboard from './modules/AnalyticsReporting/AnalyticsDashboard';

import {
  fetchSessionUser,
  loadData,
  logout,
  addAuditLog as saveAuditLog,
  saveSupplier,
  deleteSupplier,
  subscribeToDataChanges
} from './services/supabaseService';
import { getSessionToken, setSessionToken } from './lib/session';
import { notifyError, onToast } from './lib/notify';
import { isStaffUser, assumableRoles, canAccessTab, defaultTab, can } from './lib/permissions';
import { expiryAlerts } from './lib/expiry';

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState("website"); // "website" | "enterprise"
  const [currentRole, setCurrentRole] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  // The signed-in user always comes from the server session, never from browser storage.
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Application data (loaded from the database; each role only receives what it may see)
  const [staffList, setStaffList] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [salesReturns, setSalesReturns] = useState([]);
  const [inventoryFocus, setInventoryFocus] = useState(null);
  const clearInventoryFocus = useCallback(() => setInventoryFocus(null), []);
  const [dataError, setDataError] = useState(null);

  // Drawers & Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((title, message, type = "success") => {
    setToast({ title, message, type });
  }, []);

  useEffect(() => onToast(({ title, message, type }) => showToast(title, message, type)), [showToast]);

  const applyData = useCallback((data) => {
    if (data.staff) setStaffList(data.staff);
    if (data.medicines) setMedicines(data.medicines);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.purchase_orders) setPurchaseOrders(data.purchase_orders);
    if (data.customers) setCustomers(data.customers);
    if (data.prescriptions) setPrescriptions(data.prescriptions);
    if (data.transactions) setTransactions(data.transactions);
    if (data.audit_logs) setAuditLogs(data.audit_logs);
    if (data.doctors) setDoctors(data.doctors);
    if (data.medicine_batches) setBatches(data.medicine_batches);
    if (data.stock_movements) setStockMovements(data.stock_movements);
    if (data.sales_returns) setSalesReturns(data.sales_returns);
  }, []);

  const refresh = useCallback(async (tables = null) => {
    const { data, error } = await loadData(tables);
    if (error) {
      setDataError(error.message);
      return;
    }
    setDataError(null);
    applyData(data);
  }, [applyData]);

  const clearPrivateData = useCallback(() => {
    setStaffList([]);
    setSuppliers([]);
    setPurchaseOrders([]);
    setCustomers([]);
    setPrescriptions([]);
    setTransactions([]);
    setAuditLogs([]);
    setDoctors([]);
    setBatches([]);
    setStockMovements([]);
    setSalesReturns([]);
  }, []);

  const endSession = useCallback((message) => {
    setSessionToken(null);
    setCurrentUser(null);
    setCurrentRole(null);
    setActiveTab(null);
    setViewMode("website");
    clearPrivateData();
    if (message) showToast("Signed out", message, "info");
  }, [showToast, clearPrivateData]);

  // Re-check the session with the server (for example after an account is deactivated).
  const recheckSession = useCallback(async () => {
    if (!getSessionToken()) return;
    const { data, error } = await fetchSessionUser();
    if (error) return;
    if (!data) {
      endSession("Your session has ended. Please sign in again.");
    } else {
      setCurrentUser(data);
    }
  }, [endSession]);

  // Initial load: restore the session from its token, then load the data it may see.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getSessionToken()) {
        const { data, error } = await fetchSessionUser();
        if (cancelled) return;
        if (data) {
          setCurrentUser(data);
          if (isStaffUser(data)) {
            setCurrentRole(data.role);
            setViewMode("enterprise");
          }
        } else if (!error) {
          setSessionToken(null);
        }
      }
      if (!cancelled) await refresh();
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  // Live updates: refetch only the tables that changed, batched briefly.
  const pendingTables = useRef(new Set());
  useEffect(() => {
    let timer = null;
    const unsubscribe = subscribeToDataChanges((table) => {
      pendingTables.current.add(table);
      clearTimeout(timer);
      timer = setTimeout(() => {
        const tables = Array.from(pendingTables.current);
        pendingTables.current.clear();
        if (tables.includes("staff") || tables.includes("customers")) recheckSession();
        // Doctor records show how many prescriptions link to them.
        if (tables.includes("prescriptions") && !tables.includes("doctors")) tables.push("doctors");
        // Supplier price lists are sent with the suppliers.
        if (tables.includes("supplier_prices") && !tables.includes("suppliers")) tables.push("suppliers");
        refresh(tables);
      }, 400);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh, recheckSession]);

  // Supplier CRUD Handlers (return the saved record, or null on failure)
  const handleSaveSupplier = async (supplierData) => {
    const { data, error } = await saveSupplier(supplierData);
    if (error) {
      notifyError(error, "Supplier not saved");
      return null;
    }
    setSuppliers(prev => supplierData.id
      ? prev.map(s => s.id === data.id ? data : s)
      : [data, ...prev]);
    if (supplierData.id) {
      setMedicines(prev => prev.map(m => m.supplierId === data.id ? { ...m, supplierName: data.name } : m));
    }
    return data;
  };

  const handleDeleteSupplier = async (id) => {
    const { error } = await deleteSupplier(id);
    if (error) {
      notifyError(error, "Supplier not removed");
      return false;
    }
    setSuppliers(prev => prev.filter(s => s.id !== id));
    return true;
  };

  // Audit trail: the server records who did it from the session, so it can't be spoofed.
  const addAuditLog = useCallback((action, details, severity = "info") => {
    saveAuditLog(action, details, severity).then(({ error }) => {
      if (error) console.warn("Audit log not saved:", error.message);
    });
  }, []);

  const sessionUser = currentUser;
  const isStaff = isStaffUser(sessionUser);
  const rolesForUser = assumableRoles(sessionUser);
  const role = isStaff ? (rolesForUser.includes(currentRole) ? currentRole : sessionUser.role) : null;
  const tab = role && canAccessTab(role, activeTab) ? activeTab : defaultTab(role);
  const inConsole = viewMode === "enterprise" && isStaff;

  const goToTab = (nextTab) => {
    if (!role || !canAccessTab(role, nextTab)) {
      showToast("Access restricted", "Your role does not have access to that screen.", "error");
      return;
    }
    setActiveTab(nextTab);
  };

  const handleViewModeChange = (targetMode) => {
    if (targetMode === "enterprise" && !isStaff) {
      showToast("Access Restricted", "The Enterprise Console is reserved for authorized staff. Please sign in with staff credentials.", "error");
      setIsAuthModalOpen(true);
      return;
    }
    setViewMode(targetMode);
  };

  const handleLoginSuccess = async ({ token, user }) => {
    setSessionToken(token);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast("Signed In Successfully", `Welcome to PHARMART Pharmacy, ${user.name}!`, "success");

    if (isStaffUser(user)) {
      setCurrentRole(user.role);
      setActiveTab(defaultTab(user.role));
      setViewMode("enterprise");
    } else {
      setViewMode("website");
    }
    await refresh();
  };

  const handleLogout = async () => {
    await logout();
    endSession();
    await refresh();
  };

  const handleRoleSwitch = (newRole) => {
    if (newRole === "Customer") {
      setViewMode("website");
      return;
    }
    // Staff can only preview roles at or below their own.
    if (!rolesForUser.includes(newRole)) {
      showToast("Access restricted", `Your account cannot switch to ${newRole}.`, "error");
      return;
    }

    setCurrentRole(newRole);
    addAuditLog("Role Switch", `Switched active workstation view mode to ${newRole}`, "info");
  };

  // Notification Counts
  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const expiredCount = expiryAlerts(batches, medicines).length;
  const pendingRxCount = prescriptions.filter(p => p.status === "Pending").length;
  const unreadCount = isStaff ? lowStockCount + expiredCount + pendingRxCount : 0;

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:shadow-lg focus:text-sm focus:font-semibold focus:text-[#0B2545]">
        Skip to content
      </a>

      {/* Top Header Navbar */}
      <Navbar
        currentRole={role}
        availableRoles={rolesForUser}
        setCurrentRole={handleRoleSwitch}
        viewMode={inConsole ? "enterprise" : "website"}
        setViewMode={handleViewModeChange}
        currentUser={sessionUser}
        isStaff={isStaff}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        unreadNotificationCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuditLogs={can(role, "reports_view") ? () => setIsAuditLogsOpen(true) : undefined}
      />

      {dataError && (
        <div role="alert" className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <span><strong className="font-semibold">Couldn't load live data.</strong> {dataError}</span>
            <button onClick={() => refresh()} className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold hover:bg-amber-100">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!inConsole ? (
        /* PUBLIC CUSTOMER WEBSITE & E-PHARMACY STORE */
        <main id="main" className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CustomerStorefront
            medicines={medicines}
            prescriptions={prescriptions}
            setPrescriptions={setPrescriptions}
            currentUser={sessionUser}
            onRequestSignIn={() => setIsAuthModalOpen(true)}
            addAuditLog={addAuditLog}
          />
        </main>
      ) : (
        /* INTERNAL PHARMACY ENTERPRISE MANAGEMENT CONSOLE */
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">

          <Sidebar
            activeTab={tab}
            setActiveTab={goToTab}
            currentRole={role}
            lowStockCount={lowStockCount}
            pendingRxCount={pendingRxCount}
            expiredCount={expiredCount}
          />

          <main id="main" className="flex-1 min-w-0 pb-24 md:pb-0">
            {tab === "analytics" && (
              <AnalyticsDashboard
                medicines={medicines}
                transactions={transactions}
                prescriptions={prescriptions}
                salesReturns={salesReturns}
                batches={batches}
                purchaseOrders={purchaseOrders}
              />
            )}

            {tab === "pos" && (
              <POSTerminal
                medicines={medicines}
                setMedicines={setMedicines}
                customers={customers}
                setCustomers={setCustomers}
                prescriptions={prescriptions}
                setPrescriptions={setPrescriptions}
                transactions={transactions}
                setTransactions={setTransactions}
                setBatches={setBatches}
                salesReturns={salesReturns}
                setSalesReturns={setSalesReturns}
                canProcessReturns={can(role, "returns_process")}
                addAuditLog={addAuditLog}
              />
            )}

            {tab === "inventory" && (
              <MedicineList
                medicines={medicines}
                setMedicines={setMedicines}
                purchaseOrders={purchaseOrders}
                setPurchaseOrders={setPurchaseOrders}
                suppliers={suppliers}
                setSuppliers={setSuppliers}
                batches={batches}
                setBatches={setBatches}
                stockMovements={stockMovements}
                setStockMovements={setStockMovements}
                canApproveOrders={can(role, "po_approve")}
                transactions={transactions}
                focusSection={inventoryFocus}
                onFocusHandled={clearInventoryFocus}
                onSaveSupplier={handleSaveSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                canEdit={can(role, "inventory_edit")}
                addAuditLog={addAuditLog}
              />
            )}

            {tab === "prescriptions" && (
              <PrescriptionVerification
                prescriptions={prescriptions}
                setPrescriptions={setPrescriptions}
                customers={customers}
                medicines={medicines}
                doctors={doctors}
                setDoctors={setDoctors}
                canManageDoctors={role === "Owner/Admin"}
                canApprove={can(role, "prescription_approve")}
                addAuditLog={addAuditLog}
              />
            )}

            {tab === "customers" && (
              <CustomerList
                customers={customers}
                setCustomers={setCustomers}
                prescriptions={prescriptions}
                transactions={transactions}
                canDelete={can(role, "customer_delete")}
                addAuditLog={addAuditLog}
              />
            )}

            {tab === "staff" && (
              <StaffList
                staffList={staffList}
                setStaffList={setStaffList}
                currentUser={sessionUser}
                addAuditLog={addAuditLog}
              />
            )}
          </main>

        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        medicines={medicines}
        batches={batches}
        prescriptions={prescriptions}
        onNavigate={(target) => {
          const [tabId, section] = target.split(":");
          handleViewModeChange("enterprise");
          goToTab(tabId);
          if (tabId === "inventory" && section) setInventoryFocus(section);
        }}
      />

      {/* Audit Trail Logs Modal */}
      <AuditLogModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={auditLogs}
      />

      {/* Floating Modern Toast Notification */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
      />

      <DialogHost />

    </div>
  );
}
