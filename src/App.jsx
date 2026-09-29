import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NotificationDrawer from './components/NotificationDrawer';
import AuditLogModal from './components/AuditLogModal';
import AuthModal from './components/AuthModal';
import ToastNotification from './components/ToastNotification';

// Initial Datasets
import { 
  INITIAL_STAFF, 
  INITIAL_MEDICINES, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_AUDIT_LOGS 
} from './data/initialData';

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
  fetchStaffList, 
  fetchCustomers,
  fetchMedicines, 
  fetchSuppliers,
  fetchPurchaseOrders,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  fetchPrescriptions, 
  fetchTransactions, 
  fetchAuditLogs,
  saveAuditLog,
  subscribeToRealtimeChanges 
} from './services/supabaseService';
import { isStaffUser, assumableRoles, canAccessTab, defaultTab, can } from './lib/permissions';

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState("website"); // "website" | "enterprise"
  const [currentRole, setCurrentRole] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  // User Auth State with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("pharmart_current_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Application Data States
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Drawers & Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = "success") => {
    setToast({ title, message, type, duration: 3500 });
  };

  // Sync & Realtime Supabase Database Listeners
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const staffData = await fetchStaffList();
        if (staffData && staffData.length > 0) setStaffList(staffData);

        const custData = await fetchCustomers();
        if (custData && custData.length > 0) setCustomers(custData);

        const medData = await fetchMedicines();
        if (medData && medData.length > 0) setMedicines(medData);

        const supplierData = await fetchSuppliers();
        if (supplierData && supplierData.length > 0) setSuppliers(supplierData);

        const poData = await fetchPurchaseOrders();
        if (poData && poData.length > 0) setPurchaseOrders(poData);

        const rxData = await fetchPrescriptions();
        if (rxData && rxData.length > 0) setPrescriptions(rxData);

        const txData = await fetchTransactions();
        if (txData && txData.length > 0) setTransactions(txData);

        const logData = await fetchAuditLogs();
        if (logData && logData.length > 0) setAuditLogs(logData);
      } catch (err) {
        console.warn("Supabase database initial load note:", err);
      }
    }

    loadSupabaseData();

    // Subscribe to Realtime Postgres Table Changes
    const unsubStaff = subscribeToRealtimeChanges('staff', () => fetchStaffList().then(res => res && setStaffList(res)));
    const unsubCust = subscribeToRealtimeChanges('customers', () => fetchCustomers().then(res => res && setCustomers(res)));
    const unsubMeds = subscribeToRealtimeChanges('medicines', () => fetchMedicines().then(res => res && setMedicines(res)));
    const unsubSuppliers = subscribeToRealtimeChanges('suppliers', () => fetchSuppliers().then(res => res && setSuppliers(res)));
    const unsubPO = subscribeToRealtimeChanges('purchase_orders', () => fetchPurchaseOrders().then(res => res && setPurchaseOrders(res)));
    const unsubRx = subscribeToRealtimeChanges('prescriptions', () => fetchPrescriptions().then(res => res && setPrescriptions(res)));
    const unsubTx = subscribeToRealtimeChanges('transactions', () => fetchTransactions().then(res => res && setTransactions(res)));
    const unsubLogs = subscribeToRealtimeChanges('audit_logs', () => fetchAuditLogs().then(res => res && setAuditLogs(res)));

    return () => {
      unsubStaff();
      unsubCust();
      unsubMeds();
      unsubSuppliers();
      unsubPO();
      unsubRx();
      unsubTx();
      unsubLogs();
    };
  }, []);

  // Supplier CRUD Handlers
  const handleAddSupplier = async (supplierData) => {
    setSuppliers(prev => [supplierData, ...prev]);
    const { data } = await createSupplier(supplierData);
    if (data && data[0]) {
      setSuppliers(prev => prev.map(s => s.id === supplierData.id ? { ...s, id: data[0].id } : s));
    }
  };

  const handleUpdateSupplier = async (id, updateData) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updateData } : s));
    await updateSupplier(id, updateData);
  };

  const handleDeleteSupplier = async (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    await deleteSupplier(id);
  };

  // Audit Logger Utility
  const addAuditLog = (action, details, severity = "info") => {
    const newLog = {
      id: `LOG-${Math.floor(600 + Math.random() * 400)}`,
      timestamp: new Date().toLocaleString(),
      user: currentUser ? currentUser.name : "Guest",
      role: currentRole || currentUser?.role || "Guest",
      action: action,
      details: details,
      severity: severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLog(newLog);
  };

  // Resolve the signed-in staff member against the staff directory, so a stale or edited
  // saved session cannot grant a role the account does not hold (or an inactive account access).
  const staffRecord = currentUser && currentUser.userType === "staff"
    ? staffList.find(s => s.id === currentUser.id)
    : null;
  const sessionUser = staffRecord
    ? (staffRecord.status === "Inactive" ? null : { ...currentUser, role: staffRecord.role })
    : currentUser;
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

  const handleLoginSuccess = (userData) => {
    // Never keep the password in app state or browser storage.
    const { password: _password, ...safeUser } = userData;
    setCurrentUser(safeUser);
    try {
      localStorage.setItem("pharmart_current_user", JSON.stringify(safeUser));
    } catch (e) {
      console.warn("Could not save user session:", e);
    }

    setIsAuthModalOpen(false);
    showToast("Signed In Successfully", `Welcome to PHARMART Pharmacy, ${safeUser.name}!`, "success");

    if (isStaffUser(safeUser)) {
      setCurrentRole(safeUser.role);
      setActiveTab(defaultTab(safeUser.role));
      setViewMode("enterprise");
    } else {
      setCustomers(prev => [userData, ...prev.filter(c => c.id !== userData.id && c.email !== userData.email)]);
      setViewMode("website");
    }

    addAuditLog("User Login", `Authenticated successfully as ${safeUser.name} (${safeUser.role})`, "success");
  };

  const handleLogout = () => {
    addAuditLog("User Logout", `Signed out user session: ${currentUser?.name}`, "info");
    setCurrentUser(null);
    setCurrentRole(null);
    setActiveTab(null);
    try {
      localStorage.removeItem("pharmart_current_user");
    } catch (e) {
      console.warn("Could not clear user session:", e);
    }
    setViewMode("website");
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
  const ninetyDaysFromNow = new Date(Date.now() + 90 * 86400000);
  const expiredCount = medicines.filter(m => m.expiryDate && new Date(m.expiryDate) <= ninetyDaysFromNow).length;
  const pendingRxCount = prescriptions.filter(p => p.status === "Pending").length;
  const unreadCount = lowStockCount + expiredCount + pendingRxCount;

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

      {/* Main Content Area */}
      {!inConsole ? (
        /* PUBLIC CUSTOMER WEBSITE & E-PHARMACY STORE */
        <main id="main" className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CustomerStorefront 
            medicines={medicines}
            customers={customers}
            prescriptions={prescriptions}
            setPrescriptions={setPrescriptions}
            currentUser={sessionUser}
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

          <main id="main" className="flex-1 min-w-0">
            {tab === "analytics" && (
              <AnalyticsDashboard 
                medicines={medicines}
                transactions={transactions}
                prescriptions={prescriptions}
              />
            )}

            {tab === "pos" && (
              <POSTerminal 
                medicines={medicines}
                setMedicines={setMedicines}
                customers={customers}
                setCustomers={setCustomers}
                prescriptions={prescriptions}
                transactions={transactions}
                setTransactions={setTransactions}
                currentRole={role}
                currentUser={sessionUser}
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
                onAddSupplier={handleAddSupplier}
                onUpdateSupplier={handleUpdateSupplier}
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
                currentRole={role}
                currentUser={sessionUser}
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
        staffList={staffList}
        customers={customers}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        medicines={medicines}
        prescriptions={prescriptions}
        onNavigate={(target) => { handleViewModeChange("enterprise"); goToTab(target); }}
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

    </div>
  );
}
