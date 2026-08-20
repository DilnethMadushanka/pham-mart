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
import BaselineKPITable from './modules/AnalyticsReporting/BaselineKPITable';
import ArchitectureAssessment from './modules/AnalyticsReporting/ArchitectureAssessment';

import { 
  fetchStaffList, 
  fetchCustomers,
  fetchMedicines, 
  fetchPrescriptions, 
  fetchTransactions, 
  fetchAuditLogs,
  saveAuditLog,
  subscribeToRealtimeChanges 
} from './services/supabaseService';

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState("website"); // "website" | "enterprise"
  const [currentRole, setCurrentRole] = useState("Owner/Admin");
  const [activeTab, setActiveTab] = useState("analytics");

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
  const [suppliers] = useState(INITIAL_SUPPLIERS);
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
    const unsubRx = subscribeToRealtimeChanges('prescriptions', () => fetchPrescriptions().then(res => res && setPrescriptions(res)));
    const unsubTx = subscribeToRealtimeChanges('transactions', () => fetchTransactions().then(res => res && setTransactions(res)));
    const unsubLogs = subscribeToRealtimeChanges('audit_logs', () => fetchAuditLogs().then(res => res && setAuditLogs(res)));

    return () => {
      unsubStaff();
      unsubCust();
      unsubMeds();
      unsubRx();
      unsubTx();
      unsubLogs();
    };
  }, []);

  // Audit Logger Utility
  const addAuditLog = (action, details, severity = "info") => {
    const newLog = {
      id: `LOG-${Math.floor(600 + Math.random() * 400)}`,
      timestamp: new Date().toLocaleString(),
      user: currentUser ? currentUser.name : currentRole,
      role: currentUser ? currentUser.role : currentRole,
      action: action,
      details: details,
      severity: severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLog(newLog);
  };

  const handleViewModeChange = (targetMode) => {
    if (targetMode === "enterprise") {
      const isStaff = currentUser && (currentUser.userType === "staff" || currentUser.role !== "Customer");
      if (!isStaff) {
        showToast("Access Restricted", "The Enterprise Console is reserved for authorized staff. Please sign in with staff credentials.", "error");
        setIsAuthModalOpen(true);
        return;
      }
    }
    setViewMode(targetMode);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem("pharmart_current_user", JSON.stringify(userData));
    } catch (e) {
      console.warn("Could not save user session:", e);
    }

    setIsAuthModalOpen(false);
    showToast("Signed In Successfully", `Welcome to PHARMART Pharmacy, ${userData.name}!`, "success");
    
    if (userData.userType === "customer" || userData.role === "Customer") {
      setCustomers(prev => [userData, ...prev.filter(c => c.id !== userData.id && c.email !== userData.email)]);
      setViewMode("website");
    } else if (userData.userType === "staff" || userData.role !== "Customer") {
      setCurrentRole(userData.role);
      setViewMode("enterprise");
      // Auto-set initial allowed tab for role
      if (userData.role === "Cashier") {
        setActiveTab("pos");
      } else if (userData.role === "Pharmacist") {
        setActiveTab("prescriptions");
      } else {
        setActiveTab("analytics");
      }
    }

    addAuditLog("User Login", `Authenticated successfully as ${userData.name} (${userData.role})`, "success");
  };

  const handleLogout = () => {
    addAuditLog("User Logout", `Signed out user session: ${currentUser?.name}`, "info");
    setCurrentUser(null);
    try {
      localStorage.removeItem("pharmart_current_user");
    } catch (e) {
      console.warn("Could not clear user session:", e);
    }
    setViewMode("website");
  };

  const handleRoleSwitch = (newRole) => {
    // Only allow switching to a role if current staff has appropriate permissions
    const isStaff = currentUser && (currentUser.userType === "staff" || currentUser.role !== "Customer");
    if (!isStaff) return;

    setCurrentRole(newRole);
    addAuditLog("Role Switch", `Switched active workstation view mode to ${newRole}`, "info");

    if (newRole === "Cashier" && activeTab !== "pos" && activeTab !== "inventory") {
      setActiveTab("pos");
    } else if (newRole === "Pharmacist" && activeTab === "staff") {
      setActiveTab("prescriptions");
    }
  };

  // Notification Counts
  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const expiredCount = medicines.filter(m => new Date(m.expiryDate) <= new Date("2026-09-30")).length;
  const pendingRxCount = prescriptions.filter(p => p.status === "Pending").length;
  const unreadCount = lowStockCount + expiredCount + pendingRxCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar 
        currentRole={currentRole}
        setCurrentRole={handleRoleSwitch}
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        unreadNotificationCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
      />

      {/* Main Content Area */}
      {viewMode === "website" ? (
        /* PUBLIC CUSTOMER WEBSITE & E-PHARMACY STORE */
        <div className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
          <CustomerStorefront 
            medicines={medicines}
            customers={customers}
            prescriptions={prescriptions}
            setPrescriptions={setPrescriptions}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSwitchToEnterprise={() => setViewMode("enterprise")}
            addAuditLog={addAuditLog}
          />
        </div>
      ) : (
        /* INTERNAL PHARMACY ENTERPRISE MANAGEMENT CONSOLE */
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
          
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
            lowStockCount={lowStockCount}
            pendingRxCount={pendingRxCount}
            expiredCount={expiredCount}
          />

          <main className="flex-1 min-w-0">
            {activeTab === "analytics" && (
              <AnalyticsDashboard 
                medicines={medicines}
                transactions={transactions}
                prescriptions={prescriptions}
              />
            )}

            {activeTab === "pos" && (
              <POSTerminal 
                medicines={medicines}
                setMedicines={setMedicines}
                customers={customers}
                prescriptions={prescriptions}
                transactions={transactions}
                setTransactions={setTransactions}
                currentRole={currentRole}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === "inventory" && (
              <MedicineList 
                medicines={medicines}
                setMedicines={setMedicines}
                purchaseOrders={purchaseOrders}
                setPurchaseOrders={setPurchaseOrders}
                suppliers={suppliers}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === "prescriptions" && (
              <PrescriptionVerification 
                prescriptions={prescriptions}
                setPrescriptions={setPrescriptions}
                customers={customers}
                medicines={medicines}
                currentRole={currentRole}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === "staff" && (
              <StaffList 
                staffList={staffList}
                setStaffList={setStaffList}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === "kpis" && (
              <BaselineKPITable />
            )}

            {activeTab === "architecture" && (
              <ArchitectureAssessment />
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
        onNavigate={(tab) => { setViewMode("enterprise"); setActiveTab(tab); }}
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
