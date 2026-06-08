import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import staffService from '../../services/staffService';
import customerService from '../../services/customerService';
import stockService from '../../services/stockService';
import supplierService from '../../services/supplierService';
import jobCardService from '../../services/jobCardService';
import jobLogService from '../../services/jobLogService';
import categoryService from '../../services/categoryService';
import dashboardService from '../../services/dashboardService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Activity, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Bell,
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Loader2,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  ArrowRight,
  User as UserIcon,
  Pencil,
  Package,
  AlertTriangle,
  Trash2,
  DollarSign,
  TrendingDown,
  Layers,
  PlusCircle,
  MinusCircle,
  Truck,
  ClipboardList,
  FileDown,
  History,
  Clock,
  Wrench,
  RotateCw,
  Car,
  ClipboardCheck,
  Timer,
  CheckSquare,
  Minus,
  Briefcase,
  Calendar,
  Receipt,
  ShoppingBag,
  Tag,
  TrendingUp,
  User
} from 'lucide-react';
import authService from '../../services/authService';
import serviceTypeService from '../../services/serviceTypeService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { BRANDING } from '../../config/branding';

const getLocalISOString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
};

const formatCurrency = (amount) => {
  if (amount == null) return 'Rs. 0.00';
  return 'Rs. ' + Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [staffList, setStaffList] = useState([]);
  const [showAddStaff, setShowAddStaff] = useState(false);

  
  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', firstName: '', lastName: '', password: '', idNo: '', address: '', role: 'STAFF'
  });

  const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token || user.accessToken}` };
  };
  
  // Edit Staff State
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [editStaffData, setEditStaffData] = useState({});
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Customer Management State
  const [customerList, setCustomerList] = useState([]);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({});
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  
  const [customerFormData, setCustomerFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', address: '', idNo: ''
  });
  
  // Inventory Management State
  const [stockList, setStockList] = useState([]);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [editingStockId, setEditingStockId] = useState(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddData, setQuickAddData] = useState({ itemId: '', quantity: '', hsCode: '', currencyType: '', unitCostForeign: '', exchangeRate: '', freightCost: '', shippingCost: '', bankCharges: '', clearanceFees: '', dutyFees: '', additionalExpenses: '', landedCost: '', unitPrice: '', sellingPrice: '', supplierId: '' });
  const [showQuickReduceModal, setShowQuickReduceModal] = useState(false);
  const [quickReduceData, setQuickReduceData] = useState({ itemId: '', quantity: '', reason: '' });
  const [selectedBatchDetail, setSelectedBatchDetail] = useState(null);

  // Landed cost calculation removed per user request
  const initialStockData = {
    name: '', partNumber: '', hsCode: '', quantity: '', unitPrice: '', lowStockThreshold: 5, supplierId: '', categoryId: '',
    currencyType: 'USD', unitCostForeign: '', exchangeRate: '', freightCost: '', shippingCost: '', bankCharges: '',
    clearanceFees: '', dutyFees: '', additionalExpenses: '', landedCost: '', sellingPrice: ''
  };
  const [addStockData, setAddStockData] = useState(initialStockData);
  const [editStockData, setEditStockData] = useState(initialStockData);

  const [stockSearch, setStockSearch] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [inventoryAnalytics, setInventoryAnalytics] = useState([]);

  const exportInventoryAuditToPDF = () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const title = logTab === 'stock_in' ? 'Inventory Stock In Log' : 
                    logTab === 'bill_log' ? 'Sales & Billing Log' : 
                    'Inventory Stock Out Log';
      const timestamp = new Date().toLocaleString();

      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text(`${BRANDING.name} MANAGEMENT`, 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105);
      doc.text(title, 14, 30);
      
      doc.setFontSize(8);
      doc.text(`Generated on: ${timestamp}`, 14, 36);

      const tableColumn = ["Date", "Time", "Details", "Part #", "Type", "Qty", "Unit Price", "Total", "Supplier"];
      const tableRows = filteredTransactions.map(tx => {
        if (tx.isGroup) {
          const serviceList = tx.services?.map(s => s.serviceName).join(', ') || 'No services';
          const partList = tx.items?.map(i => i.stockItem?.name).join(', ') || 'No parts';
          return [
            new Date(tx.timestamp).toLocaleDateString(),
            new Date(tx.timestamp).toLocaleTimeString(),
            `JOB #${tx.jobId}\nSERVICES: ${serviceList}\nPARTS: ${partList}`,
            'GROUP',
            'ACTIVITY',
            tx.quantity,
            '-',
            `Rs. ${parseFloat(tx.totalAmount || 0).toLocaleString()}`,
            'INTERNAL'
          ];
        }
        return [
          new Date(tx.timestamp).toLocaleDateString(),
          new Date(tx.timestamp).toLocaleTimeString(),
          tx.stockItem?.name || '-',
          tx.stockItem?.partNumber || '-',
          tx.transactionType,
          tx.quantity,
          `Rs. ${parseFloat(tx.unitPrice || 0).toLocaleString()}`,
          `Rs. ${parseFloat(tx.totalAmount || 0).toLocaleString()}`,
          tx.supplier?.companyName || 'INTERNAL'
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: {
          5: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'right' }
        }
      });

      doc.save(`${title.toLowerCase().replace(/ /g, '_')}_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to generate PDF report.");
    } finally {
      setExportLoading(false);
    }
  };

  const generateCustomerReport = (log) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    
    // Attempt to find the rich job data from our state
    const job = jobList.find(j => j.id == log.jobId);
    
    // Header section
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 45, 'F');

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(BRANDING.name, pageW / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(BRANDING.tagline, pageW / 2, 26, { align: 'center' });
    doc.text(`${BRANDING.address}  |  Tel: ${BRANDING.phone}`, pageW / 2, 32, { align: 'center' });
    doc.text(`${BRANDING.email}  |  ${BRANDING.websiteUrl}`, pageW / 2, 37, { align: 'center' });

    // Report Title
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLING INVOICE', pageW / 2, 55, { align: 'center' });

    // Customer & Job Details
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    const startY = 65;
    doc.setFont('helvetica', 'bold');
    doc.text('BILL DETAILS', pageW / 2, startY);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, startY + 2, 90, startY + 2);
    doc.line(pageW / 2, startY + 2, pageW - 14, startY + 2);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${log.customerName || 'N/A'}`, 14, startY + 8);
    doc.text(`Phone: ${job?.customer?.phone || 'N/A'}`, 14, startY + 14);
    doc.text(`Bill #: ${log.jobId || log.id || 'N/A'}`, 14, startY + 20);

    doc.text(`Bill ID: #${log.jobId || 'N/A'}`, pageW / 2, startY + 8);
    doc.text(`Date: ${new Date(log.timestamp).toLocaleDateString()}`, pageW / 2, startY + 14);
    doc.text(`Status: ${job?.status || 'COMPLETED'}`, pageW / 2, startY + 20);

    let currentY = startY + 30;

    // Items Table
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('PARTS & MATERIALS', 14, currentY);

    const itemRows = [];
    if (job?.items) {
      job.items.forEach(i => {
        const unitPrice = parseFloat(i.priceAtTime || 0);
        const qty = i.quantity || 0;
        const total = unitPrice * qty;
        itemRows.push([
          i.stockItem?.name || i.itemName || 'Unknown Item', 
          qty, 
          `Rs. ${unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 
          `Rs. ${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`
        ]);
      });
    } else {
      // Fallback
      const iMatch = (log.details || '').match(/Items: (.*?)(?=\n|Total:|$)/);
      if (iMatch) {
        iMatch[1].split('),').forEach(i => {
          const m = i.trim().match(/^(.+?)\s*\(x(\d+)\)$/);
          if (m) itemRows.push([m[1].trim(), m[2].trim(), '-', '-']);
        });
      }
    }

    autoTable(doc, {
      head: [['Item Name', 'Qty', 'Unit Price', 'Total']],
      body: itemRows.length > 0 ? itemRows : [['No parts used', '-', '-', '-']],
      startY: currentY + 4,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 20 }, 
        2: { halign: 'right', cellWidth: 35 }, 
        3: { halign: 'right', cellWidth: 35 } 
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 12;

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(pageW - 90, currentY, 76, 25, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('GRAND TOTAL:', pageW - 84, currentY + 10);
    
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    const finalTotal = job?.totalAmount || log.details?.match(/Total: Rs\. ([\d,.]+)/)?.[1] || '0.00';
    doc.text(`Rs. ${parseFloat(finalTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}`, pageW - 84, currentY + 18);

    // Footer
    const footerY = 275;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, footerY - 4, pageW - 14, footerY - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Thank you for choosing ${BRANDING.name}!`, pageW / 2, footerY, { align: 'center' });
    doc.text(`Report generated on: ${new Date().toLocaleString()}`, pageW / 2, footerY + 5, { align: 'center' });

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Billing_Invoice_${log.jobId || log.id}_${dateStr}.pdf`);
  };

  // Supplier Management State
  const [supplierList, setSupplierList] = useState([]);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const initialSupplierData = {
    companyName: '', contactPerson: '', email: '', phone: '', address: '', active: true
  };
  const [addSupplierData, setAddSupplierData] = useState(initialSupplierData);
  const [editSupplierData, setEditSupplierData] = useState(initialSupplierData);
  const [supplierSearch, setSupplierSearch] = useState('');
  
  // Category State
  const [categoryList, setCategoryList] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [expandedStockRows, setExpandedStockRows] = useState(new Set());
  const [rowBatches, setRowBatches] = useState({}); // { itemId: [batches] }
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  
  // Transaction State
  const [transactionList, setTransactionList] = useState([]);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL'); // ALL | ADD | REDUCE
  const [transactionDateFrom, setTransactionDateFrom] = useState('');
  const [transactionDateTo, setTransactionDateTo] = useState('');
  const [transactionSupplierFilter, setTransactionSupplierFilter] = useState('ALL');
  
  // Batch State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedItemBatches, setSelectedItemBatches] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState('');
  
  // Service Management State
  const [serviceList, setServiceList] = useState([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const initialServiceData = {
    name: '', description: '', basePrice: '', duration: '', active: true
  };
  const [addServiceData, setAddServiceData] = useState(initialServiceData);
  const [editServiceData, setEditServiceData] = useState(initialServiceData);
  
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });
  // Stale-data tracking: only re-fetch if data is older than 30s on tab switch
  const lastFetchedRef = React.useRef({});
  const contentAreaRef = React.useRef(null);
  const [staffSearch, setStaffSearch] = useState('');

  // Job Card / Work Management State
  const [jobList, setJobList] = useState([]);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');
  const initialJobData = {
    customerId: '',
    startTime: getLocalISOString(),
    endTime: '',
    services: [], // Array of { serviceTypeId: id, priceAtTime: val, name: val }
    items: [],    // Array of { stockItemId: id, quantity: val, priceAtTime: val, name: val }
    status: 'WAITING'
  };
  const [addJobData, setAddJobData] = useState(initialJobData);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editJobData, setEditJobData] = useState(initialJobData);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [partSearchQuery, setPartSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Custom Dialog Modal State (replaces window.confirm/alert)
  const [dialogState, setDialogState] = useState(null);
  const dialogResolveRef = useRef(null);

  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      dialogResolveRef.current = resolve;
      setDialogState({
        type: 'confirm',
        title: options.title || 'Confirm Action',
        message,
        variant: options.variant || 'danger',
        confirmText: options.confirmText || 'Yes, Confirm',
        cancelText: options.cancelText || 'Cancel',
      });
    });
  };

  const showAlert = (message, options = {}) => {
    return new Promise((resolve) => {
      dialogResolveRef.current = resolve;
      setDialogState({
        type: 'alert',
        title: options.title || 'Notice',
        message,
        variant: options.variant || 'info',
      });
    });
  };

  const handleDialogConfirm = () => {
    if (dialogResolveRef.current) dialogResolveRef.current(true);
    setDialogState(null);
  };

  const handleDialogCancel = () => {
    if (dialogResolveRef.current) dialogResolveRef.current(false);
    setDialogState(null);
  };
  const [jobDateFilter, setJobDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statsData, setStatsData] = useState(null);

  // Money Management / Finance State
  const [expensesData, setExpensesData] = useState(() => {
    const saved = localStorage.getItem('mind_spareparts_monthly_expenses');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedFinanceMonth, setSelectedFinanceMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newExpenseField, setNewExpenseField] = useState('Monthly Expenses');
  const [customExpenseName, setCustomExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Performance Optimization: Deferred values for search inputs
  const deferredJobSearch = useDeferredValue(jobSearch);
  const deferredTransactionSearch = useDeferredValue(transactionSearch);
  const deferredStaffSearch = useDeferredValue(staffSearch);
  const deferredServiceSearch = useDeferredValue(serviceSearch);
  const deferredCustomerSearch = useDeferredValue(customerSearch);

  const updateItemFifoPrice = async (idx, qty, type = 'add', currentItems = null) => {
    // Read the stockItemId from the snapshot we have at call time
    const snapshot = currentItems || (type === 'add' ? addJobData : editJobData).items;
    const item = snapshot[idx];
    if (!item || !item.stockItemId || qty <= 0) return;

    const setter = type === 'add' ? setAddJobData : setEditJobData;

    try {
      const res = await stockService.previewFifoCost(item.stockItemId, qty);
      // total is the true FIFO cost for `qty` units across all batches.
      // avgPrice * qty == total, so the bill formula (priceAtTime * qty) stays correct.
      const avgPrice = res.data.total / qty;
      const allocations = res.data.allocations || [];
      // Functional updater: always merges into the *latest* state, not the stale closure.
      setter(prev => {
        const updatedItems = [...prev.items];
        if (!updatedItems[idx]) return prev;
        updatedItems[idx] = { ...updatedItems[idx], priceAtTime: avgPrice, quantity: qty, allocations };
        return { ...prev, items: updatedItems };
      });
    } catch (err) {
      console.error("Failed to preview FIFO cost", err);
      // On failure still commit the quantity change so the UI doesn't freeze
      setter(prev => {
        const updatedItems = [...prev.items];
        if (!updatedItems[idx]) return prev;
        updatedItems[idx] = { ...updatedItems[idx], quantity: qty };
        return { ...prev, items: updatedItems };
      });
    }
  };

  // Refs for click-outside detection
  const customerDropdownRef = useRef(null);
  const serviceDropdownRef = useRef(null);
  const partDropdownRef = useRef(null);

  // Unified Log State
  const [jobLogs, setJobLogs] = useState([]);
  const [logTab, setLogTab] = useState('stock_in'); // Default to Stock In log view

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getStats();
      setStatsData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };


  // Analytics Data Computation
  // Analytics Data Computation
  const analyticsData = useMemo(() => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));
      
      const todayJobs = (jobList || []).filter(job => {
        if (!job.createdAt) return false;
        return new Date(job.createdAt).toDateString() === now.toDateString();
      });

      // Default structure to prevent crashes before data loads
      const defaults = {
        chartData: [],
        topItems: [],
        topServices: [],
        topCustomers: [],
        todayRevenue: todayJobs.reduce((sum, j) => sum + (parseFloat(j.totalAmount) || 0), 0),
        totalRevenue: (jobList || []).reduce((sum, j) => sum + (parseFloat(j.totalAmount) || 0), 0),
        activeJobs: (jobList || []).filter(j => j.status !== 'PAID' && j.status !== 'CANCELLED').length,
        totalCustomers: customerList?.length || 0,
        totalStaff: staffList?.length || 0,
        totalServices: serviceList?.length || 0,
        totalInventoryValue: 0,
        remainingStockValue: 0,
        estimatedSellingValue: 0,
        estimatedFutureProfit: 0,
        monthlyRevenue: 0,
        monthlyInventoryProfit: 0,
        totalFreightCost: 0,
        totalShippingCost: 0,
        totalBankCharges: 0,
        totalClearanceFees: 0,
        totalDutyFees: 0,
        totalAdditionalExpenses: 0,
        analyticsTotalRemainingValue: (inventoryAnalytics || []).reduce((s, r) => s + parseFloat(r.remainingValue || 0), 0),
        analyticsTotalFutureProfit: (inventoryAnalytics || []).reduce((s, r) => s + parseFloat(r.estimatedFutureProfit || 0), 0),
        analyticsTotalProfitEarned: (inventoryAnalytics || []).reduce((s, r) => s + parseFloat(r.totalProfit || 0), 0),
        lowStockCount: 0,
        outOfStockCount: 0,
        recentActivity: (jobList || []).slice(0, 5),
        weekStart: startOfWeek.toLocaleDateString(),
        weekEnd: endOfWeek.toLocaleDateString()
      };

      if (!statsData) return defaults;

      return {
        ...defaults,
        chartData: (statsData.chartData || []).map(d => {
          const dateStr = d.date || '';
          let displayDate = dateStr;
          const dt = new Date(dateStr);
          if (!isNaN(dt.getTime())) {
            displayDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } else {
            const currentYear = new Date().getFullYear();
            const dt2 = new Date(`${dateStr} ${currentYear}`);
            if (!isNaN(dt2.getTime())) {
              displayDate = dt2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }
          return { ...d, displayDate };
        }),
        topItems: statsData.topItems || [],
        topServices: statsData.topServices || [],
        topCustomers: statsData.topCustomers || [],
        todayRevenue: statsData.todayRevenue || defaults.todayRevenue,
        totalRevenue: statsData.totalRevenue || defaults.totalRevenue,
        activeJobs: statsData.activeJobs || defaults.activeJobs,
        totalInventoryValue: statsData.totalInventoryValue || 0,
        remainingStockValue: statsData.remainingStockValue || 0,
        estimatedSellingValue: statsData.estimatedSellingValue || 0,
        estimatedFutureProfit: statsData.estimatedFutureProfit || 0,
        monthlyRevenue: statsData.monthlyRevenue || 0,
        monthlyInventoryProfit: statsData.monthlyInventoryProfit || 0,
        totalFreightCost: statsData.totalFreightCost || 0,
        totalShippingCost: statsData.totalShippingCost || 0,
        totalBankCharges: statsData.totalBankCharges || 0,
        totalClearanceFees: statsData.totalClearanceFees || 0,
        totalDutyFees: statsData.totalDutyFees || 0,
        totalAdditionalExpenses: statsData.totalAdditionalExpenses || 0,
        lowStockCount: statsData.lowStockCount || 0,
        outOfStockCount: statsData.outOfStockCount || 0,
        recentActivity: statsData.recentActivity || defaults.recentActivity,
        weekStart: statsData.chartData?.[0]?.date || defaults.weekStart,
        weekEnd: statsData.chartData?.[(statsData.chartData?.length || 1) - 1]?.date || defaults.weekEnd,
      };
    } catch (err) {
      console.error("CRITICAL: Analytics computation failed", err);
      // Return basic structure to prevent white screen
      return {
        chartData: [], todayRevenue: 0, totalRevenue: 0, activeJobs: 0, totalCustomers: 0, totalStaff: 0,
        topItems: [], topCustomers: [], recentActivity: [], weekStart: '', weekEnd: '',
        analyticsTotalRemainingValue: 0, analyticsTotalFutureProfit: 0, analyticsTotalProfitEarned: 0,
        totalInventoryValue: 0, remainingStockValue: 0, estimatedSellingValue: 0, estimatedFutureProfit: 0
      };
    }
  }, [jobList, statsData, stockList, customerList, staffList, serviceList, inventoryAnalytics]);

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setCustomerSearchQuery('');
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setServiceSearchQuery('');
      }
      if (partDropdownRef.current && !partDropdownRef.current.contains(event.target)) {
        setPartSearchQuery('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditStaffChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setEditStaffData({ ...editStaffData, [name]: cleaned });
    } else if (name === 'enabled') {
      setEditStaffData({ ...editStaffData, [name]: e.target.checked });
    } else {
      setEditStaffData({ ...editStaffData, [name]: value });
    }
  };

  const handleEditCustomerChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setEditCustomerData({ ...editCustomerData, [name]: cleaned });
    } else if (name === 'enabled') {
      setEditCustomerData({ ...editCustomerData, [name]: e.target.checked });
    } else {
      setEditCustomerData({ ...editCustomerData, [name]: value });
    }
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setCustomerFormData({ ...customerFormData, [name]: cleaned });
    } else {
      setCustomerFormData({ ...customerFormData, [name]: value });
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      showAlert('Phone number must be exactly 10 digits.', { title: 'Error', variant: 'danger' });
      return;
    }
    setLoading(true);
    try {
      await staffService.createStaff(formData);
      const roleName = formData.role === 'ADMIN' ? 'Admin' : 'Staff';
      showAlert(`${roleName} added successfully!`, { title: 'Success', variant: 'success' });
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', idNo: '', username: '', address: '', role: 'STAFF' });
      fetchStaff(); // Refresh list after adding
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add staff.', { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (customerFormData.phone.length !== 10) {
      showAlert('Phone number must be exactly 10 digits.', { title: 'Error', variant: 'danger' });
      return;
    }
    setLoading(true);
    try {
      await authService.signup(customerFormData);
      showAlert('Customer added successfully!', { title: 'Success', variant: 'success' });
      setCustomerFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', address: '', idNo: '' });
      fetchCustomers();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add customer.', { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };


  
  const fetchStaff = async () => {
    try {
      const res = await staffService.getAllStaff();

      setStaffList(res.data);
    } catch (err) {
      console.error("DEBUG: Failed to fetch staff:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerService.getAllCustomers();
      const data = Array.isArray(res.data) ? res.data : [];
      setCustomerList(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const openEditStaff = (staff) => {
    setEditingStaffId(staff.userId);
    setEditStaffData({
      firstName: staff.firstName || '',
      lastName: staff.lastName || '',
      phone: staff.phone || '',
      email: staff.email || '',
      address: staff.address || '',
      idNo: staff.idNo || '',
      password: '',
      enabled: staff.enabled ?? staff.active ?? staff.isActive ?? true,
      role: staff.role || staff.userRole || 'ROLE_STAFF'
    });
    setUpdateMsg({ type: '', text: '' });
    setShowEditStaff(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateMsg({ type: '', text: '' });
    try {
      console.log("DEBUG: Updating staff with data:", editStaffData);
      const res = await staffService.updateStaff(editingStaffId, editStaffData);
      console.log("DEBUG: Update response:", res.data);
      setUpdateMsg({ type: 'success', text: 'Team member updated successfully!' });
      await fetchStaff();
      setTimeout(() => { 
        console.log("DEBUG: Closing edit modal");
        setShowEditStaff(false); 
        setUpdateMsg({ type: '', text: '' }); 
      }, 1000);
    } catch (err) {
      console.error("DEBUG: Update failed:", err);
      const msg = err.response?.data?.message || err.message || 'Update failed. Please try again.';
      setUpdateMsg({ type: 'error', text: msg });
      console.error('Staff update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditCustomer = (customer) => {
    setEditingCustomerId(customer.id);
    setEditCustomerData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      address: customer.address || '',
      password: '',
      enabled: customer.user?.enabled ?? customer.user?.active ?? customer.user?.isActive ?? true
    });
    setUpdateMsg({ type: '', text: '' });
    setShowEditCustomer(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateMsg({ type: '', text: '' });
    try {
      await customerService.updateCustomer(editingCustomerId, editCustomerData);
      setUpdateMsg({ type: 'success', text: 'Customer updated successfully!' });
      await fetchCustomers();
      setTimeout(() => { 
        setShowEditCustomer(false); 
        setUpdateMsg({ type: '', text: '' }); 
      }, 1000);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Update failed. Please try again.';
      setUpdateMsg({ type: 'error', text: errMsg });
      console.error('Customer update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, type) => {
    const ok = await showConfirm(`This will permanently delete this ${type} and all associated data. This cannot be undone.`, { title: `Delete ${type}`, variant: 'danger', confirmText: 'Yes, Delete' });
    if (ok) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8080/api/auth/users/${userId}`, { headers: getAuthHeader() });
        await showAlert(`${type} deleted successfully.`, { title: 'Deleted', variant: 'success' });
        if (type === 'Staff') fetchStaff();
        else fetchCustomers();
        setShowEditStaff(false);
        setShowEditCustomer(false);
      } catch (err) {
        await showAlert(err.response?.data?.message || 'Delete failed.', { title: 'Error', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await staffService.toggleStaffStatus(id, !currentStatus);
      fetchStaff(); // Refresh list
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };


  const fetchInventoryAnalytics = async () => {
    try {
      const res = await stockService.getInventoryAnalytics();
      setInventoryAnalytics(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch inventory analytics:', err);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await stockService.getAllStockItems();

      
      // Auto-seed sample data if empty
      if (res.data.length === 0) {
        setStockList([]);
      } else {
        setStockList(res.data);
      }

      // Refresh batches for any currently expanded rows so the UI stays in sync
      if (expandedStockRows && expandedStockRows.size > 0) {
        const updatedBatches = {};
        await Promise.all(Array.from(expandedStockRows).map(async (itemId) => {
           try {
             const bRes = await stockService.getBatches(itemId);
             updatedBatches[itemId] = bRes.data;
           } catch(err) {}
        }));
        setRowBatches(prev => ({ ...prev, ...updatedBatches }));
      }
    } catch (err) {
      console.error("Failed to fetch stock:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setMsg({ type: 'error', text: `Failed to load inventory: ${errorMsg}` });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await supplierService.getAllSuppliers();
      
      if (res.data.length === 0) {
        console.log("Seeding initial supplier data...");
        const sampleSuppliers = [
          { companyName: 'Global Auto Parts', contactPerson: 'John Smith', email: 'sales@globalauto.com', phone: '0112345678', address: '123 Industrial Ave, Colombo', active: true },
          { companyName: 'Elite Lubricants Co.', contactPerson: 'Sarah Wilson', email: 'sarah@elitelube.com', phone: '0118765432', address: '45 Refinery Rd, Sapugaskanda', active: true },
          { companyName: 'Precision Brake Systems', contactPerson: 'Mike Ross', email: 'mike@precisionbrakes.com', phone: '0115554444', address: '88 Engineering Way, Kandy', active: true },
          { companyName: 'Swift Battery Solutions', contactPerson: 'David Miller', email: 'contact@swiftbattery.lk', phone: '0119998888', address: '12 Energy St, Colombo', active: true }
        ];

        for (const supplier of sampleSuppliers) {
          await supplierService.createSupplier(supplier);
        }
        
        const seededRes = await supplierService.getAllSuppliers();
        setSupplierList(seededRes.data);
      } else {
        setSupplierList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategoryList(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      await categoryService.createCategory({ name: newCategoryName });
      setNewCategoryName('');
      setShowAddCategoryModal(false);
      await fetchCategories();
    } catch (err) {
      await showAlert('Failed to add category.', { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    setLoading(true);
    try {
      await categoryService.updateCategory(id, { name: editingCategoryName });
      setEditingCategoryId(null);
      await fetchCategories();
      await fetchStock();
    } catch (err) {
      await showAlert('Failed to update category.', { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const ok = await showConfirm(
      `Are you sure you want to delete the category "${name}"? Stock items in this category will not be deleted, but their category will be set to N/A.`,
      { title: 'Delete Category', variant: 'danger', confirmText: 'Yes, Delete' }
    );
    if (!ok) return;
    setLoading(true);
    try {
      await categoryService.deleteCategory(id);
      await fetchCategories();
      await fetchStock();
    } catch (err) {
      await showAlert('Failed to delete category.', { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await stockService.getAllTransactions();
      setTransactionList(Array.isArray(res.data) ? res.data : []);
      lastFetchedRef.current.transactions = Date.now();
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const fetchJobLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await jobLogService.getAllLogs();
      setJobLogs(Array.isArray(res.data) ? res.data : []);
      lastFetchedRef.current.jobLogs = Date.now();
    } catch (err) {
      console.error("Failed to fetch job logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        console.log("DEBUG: Starting global dashboard initialization...");
        // 1. Fetch small static lists first
        await Promise.allSettled([
          fetchCategories(),
          fetchStaff(),
          fetchSuppliers()
        ]);
        
        // 2. Fetch customers (needed for job seeding)
        await fetchCustomers();
        
        // 3. Fetch logs and stats
        await Promise.allSettled([
          fetchStats(),
          fetchTransactions(),
          fetchJobLogs()
        ]);

        // 4. Fetch inventory and jobs (prerequisites ready)
        await fetchStock();
        await fetchJobs();
        
        console.log("DEBUG: Dashboard initialization complete.");
      } catch (err) {
        console.error("DEBUG: Initialization failed", err);
        setMsg({ type: 'error', text: 'Failed to load dashboard data. Please refresh.' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const STALE_MS = 30_000; // Only refetch if data is older than 30 seconds
    const now = Date.now();
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'work') {
      if (!lastFetchedRef.current.jobs || now - lastFetchedRef.current.jobs > STALE_MS) fetchJobs();
    }
    if (activeTab === 'inventory') {
      if (!lastFetchedRef.current.stock || now - lastFetchedRef.current.stock > STALE_MS) fetchStock();
      fetchInventoryAnalytics();
    }
    if (activeTab === 'audit') {
      if (!lastFetchedRef.current.transactions || now - lastFetchedRef.current.transactions > STALE_MS) fetchTransactions();
      if (!lastFetchedRef.current.jobLogs || now - lastFetchedRef.current.jobLogs > STALE_MS) fetchJobLogs();
    }
  }, [activeTab]);



  const [servicesLoading, setServicesLoading] = useState(false);

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      console.log("DEBUG: Initializing service fetch...");
      const res = await serviceTypeService.getAllServiceTypes();
      const data = Array.isArray(res.data) ? res.data : [];
      console.log(`DEBUG: Found ${data.length} services in database.`);
      
      if (data.length === 0) {
        console.log("DEBUG: Seeding samples since DB is empty...");
        const samples = [
          { name: 'Full Body Wash', description: 'Complete exterior and interior cleaning', basePrice: 2500, duration: 60, active: true },
          { name: 'Oil Change', description: 'Premium oil replacement and filter check', basePrice: 8500, duration: 45, active: true }
        ];
        for (const s of samples) {
          await serviceTypeService.createServiceType(s).catch(e => console.error("Seed item failed", e));
        }
        const fresh = await serviceTypeService.getAllServiceTypes();
        setServiceList(Array.isArray(fresh.data) ? fresh.data : []);
      } else {
        setServiceList(data);
      }
    } catch (err) {
      console.error("DEBUG: Global fetch error:", err);
      setMsg({ type: 'error', text: 'Database sync failed. Please check backend.' });
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      console.log("DEBUG: Fetching all job cards...");
      const res = await jobCardService.getAllJobs();
      const data = Array.isArray(res.data) ? res.data : [];
      console.log(`DEBUG: Found ${data.length} jobs in database.`);
      
      setJobList(data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
      setMsg({ type: 'error', text: 'Failed to sync work management data. Please check connection.' });
    } finally {
      setJobsLoading(false);
      lastFetchedRef.current.jobs = Date.now();
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = getLocalISOString();
      const selectedCustomer = addJobData.customerId || '__walkin__';
      const isWalkin = selectedCustomer === '__walkin__';
      // Format data for backend
      const payload = {
        vehicleNumber: addJobData.vehicleNumber || 'N/A',
        customer: isWalkin ? null : { id: selectedCustomer },
        startTime: addJobData.startTime || now,
        endTime: addJobData.endTime || now,
        services: addJobData.services.map(s => ({
          serviceType: { id: s.serviceTypeId },
          priceAtTime: s.priceAtTime,
          serviceName: s.name
        })),
        items: addJobData.items.map(i => ({
          stockItem: { id: i.stockItemId },
          quantity: i.quantity,
          priceAtTime: i.priceAtTime,
          itemName: i.name
        })),
        status: 'WAITING'
      };

      // Ensure seconds are included for Spring LocalDateTime if missing
      if (payload.startTime && payload.startTime.length === 16) payload.startTime += ":00";
      if (payload.endTime && payload.endTime.length === 16) payload.endTime += ":00";

      await jobCardService.createJob(payload);
      showAlert('Bill Created Successfully!', { title: 'Success', variant: 'success' });
      setAddJobData(initialJobData);
      setShowAddJobModal(false);
      fetchJobs();
      fetchStock(); // Always refresh stock after adding a job (might reserve items)
    } catch (err) {
      console.error("Assign work error:", err.response?.data || err);
      const detail = err.response?.data?.message || err.message || 'Check all fields.';
      showAlert(`Failed to create bill: ${detail}`, { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openEditJob = (job) => {
    setEditingJobId(job.id);
    setEditJobData({
      customerId: job.customer?.id || '__walkin__',
      vehicleNumber: job.vehicleNumber,
      startTime: job.startTime ? job.startTime.slice(0, 16) : getLocalISOString(),
      endTime: job.endTime ? job.endTime.slice(0, 16) : '',
      services: job.services?.map(s => ({
        serviceTypeId: s.serviceType?.id,
        priceAtTime: s.priceAtTime,
        name: s.serviceName,
        duration: s.serviceType?.duration || 0
      })) || [],
      items: job.items?.map(i => ({
        stockItemId: i.stockItem?.id,
        quantity: i.quantity,
        priceAtTime: i.priceAtTime,
        name: i.itemName
      })) || [],
      status: job.status
    });
    setUpdateMsg({ type: '', text: '' });
    setShowEditJobModal(true);
  };

  const handleEditJob = async (e) => {
    e.preventDefault();
    if (!editJobData.customerId) {
      setUpdateMsg({ type: 'error', text: 'Failed to update: Please select a customer or choose Walk-in.' });
      return;
    }
    setLoading(true);
    try {
      const isWalkin = editJobData.customerId === '__walkin__';
      const payload = {
        vehicleNumber: editJobData.vehicleNumber || 'N/A',
        customer: isWalkin ? null : { id: editJobData.customerId },
        startTime: editJobData.startTime || null,
        endTime: editJobData.endTime || null,
        services: editJobData.services.map(s => ({
          serviceType: { id: s.serviceTypeId },
          priceAtTime: s.priceAtTime,
          serviceName: s.name
        })),
        items: editJobData.items.map(i => ({
          stockItem: { id: i.stockItemId },
          quantity: i.quantity,
          priceAtTime: i.priceAtTime,
          itemName: i.name
        })),
        status: editJobData.status
      };

      if (payload.startTime && payload.startTime.length === 16) payload.startTime += ":00";
      if (payload.endTime && payload.endTime.length === 16) payload.endTime += ":00";

      await jobCardService.updateJob(editingJobId, payload);
      setUpdateMsg({ type: 'success', text: 'Job Card Updated Successfully!' });
      fetchJobs();
      fetchStock();
      setTimeout(() => {
        setShowEditJobModal(false);
        setUpdateMsg({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      console.error("Update job error:", err);
      const data = err.response?.data;
      const detail = data?.message || data?.error || (typeof data === 'string' ? data : JSON.stringify(data)) || err.message;
      setUpdateMsg({ type: 'error', text: `Failed: ${detail}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJobStatus = async (id, status) => {
    // Optimistic UI update
    const oldJobs = [...jobList];
    setJobList(prev => prev.map(job => job.id === id ? { ...job, status } : job));

    try {
      await jobCardService.updateJobStatus(id, status);
    } catch (err) {
      console.error("Failed to update job status", err);
      setJobList(oldJobs); // Revert on error
      setMsg({ type: 'error', text: 'Status update failed.' });
      return;
    }

    fetchJobs();
    fetchStock(); 
    fetchTransactions();
    fetchJobLogs();
  };

  const calculateJobEndTime = (services, target = 'add', customStartTime = null) => {
    if (!services || services.length === 0) return;
    const totalMinutes = services.reduce((acc, s) => acc + (s.duration || 0), 0);
    if (totalMinutes === 0) return;

    const data = target === 'add' ? addJobData : editJobData;
    const setter = target === 'add' ? setAddJobData : setEditJobData;

    const startTimeStr = customStartTime || data.startTime || getLocalISOString();
    const start = new Date(startTimeStr);
    
    if (!isNaN(start.getTime())) {
      const end = new Date(start.getTime() + totalMinutes * 60000);
      setter(prev => ({ ...prev, endTime: getLocalISOString(end) }));
    }
  };

  const handleDateTimeChange = (field, type, value, target = 'add') => {
    const data = target === 'add' ? addJobData : editJobData;
    const setter = target === 'add' ? setAddJobData : setEditJobData;

    const currentFull = data[field] || getLocalISOString();
    const [date, time] = currentFull.split('T');
    let newFull = '';
    if (type === 'date') newFull = `${value}T${time}`;
    else newFull = `${date}T${value}`;
    
    setter(prev => ({ ...prev, [field]: newFull }));
    if (field === 'startTime') {
      calculateJobEndTime(data.services, target, newFull);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await serviceTypeService.createServiceType(addServiceData);
      setMsg({ type: 'success', text: 'Service added successfully!' });
      setAddServiceData(initialServiceData);
      setShowAddServiceModal(false);
      // Give the DB a moment then fetch
      setTimeout(() => fetchServices(), 500);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add service.' });
    } finally {
      setLoading(false);
    }
  };

  const openEditService = (service) => {
    setEditingServiceId(service.id);
    setEditServiceData({
      name: service.name,
      description: service.description || '',
      basePrice: service.basePrice,
      duration: service.duration,
      active: service.active
    });
    setUpdateMsg({ type: '', text: '' });
    setShowEditServiceModal(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await serviceTypeService.updateServiceType(editingServiceId, editServiceData);
      setUpdateMsg({ type: 'success', text: 'Service updated successfully!' });
      fetchServices();
      setTimeout(() => { 
        setShowEditServiceModal(false); 
        setUpdateMsg({ type: '', text: '' }); 
      }, 1000);
    } catch (err) {
      setUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    const ok = await showConfirm('Are you sure you want to delete this service? This action cannot be undone.', { title: 'Delete Service', variant: 'danger', confirmText: 'Yes, Delete' });
    if (ok) {
      try {
        await serviceTypeService.deleteServiceType(id);
        fetchServices();
      } catch (err) {
        await showAlert('Failed to delete service.', { title: 'Error', variant: 'danger' });
      }
    }
  };

  const handleToggleServiceStatus = async (service) => {
    try {
      await serviceTypeService.updateServiceType(service.id, {
        ...service,
        active: !service.active
      });
      fetchServices();
    } catch (err) {
      console.error("Failed to toggle service status", err);
    }
  };

  const handleViewBatches = async (item) => {
    setLoading(true);
    setSelectedItemName(item.name);
    try {
      const res = await stockService.getBatches(item.id);
      setSelectedItemBatches(res.data);
      setShowBatchModal(true);
    } catch (err) {
      console.error("Failed to fetch batches", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const staffRole = s.role || s.userRole || 'ROLE_STAFF';
    const matchesRole = roleFilter === 'ALL' || staffRole === roleFilter;
    
    const query = staffSearch.toLowerCase().trim();
    if (!query) return matchesRole;
    
    const firstName = (s.firstName || '').toLowerCase();
    const lastName = (s.lastName || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const phone = (s.phone || '').toLowerCase();
    const idNo = (s.idNo || '').toLowerCase();
    const username = (s.username || '').toLowerCase();

    const matchesSearch = firstName.includes(query) || 
      lastName.includes(query) ||
      `${firstName} ${lastName}`.includes(query) ||
      email.includes(query) || 
      phone.includes(query) ||
      idNo.includes(query) ||
      username.includes(query);

    return matchesSearch && matchesRole;
  });

  const filteredCustomers = customerList.filter(c => {
    const query = customerSearch.toLowerCase().trim();
    if (!query) return true;

    const firstName = (c.firstName || '').toLowerCase();
    const lastName = (c.lastName || '').toLowerCase();
    const email = (c.user?.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const idNo = (c.idNo || '').toLowerCase();

    const matchesSearch = firstName.includes(query) || 
      lastName.includes(query) ||
      `${firstName} ${lastName}`.includes(query) ||
      email.includes(query) || 
      phone.includes(query) ||
      idNo.includes(query);

    const isCustomer = c.user?.role === 'ROLE_CUSTOMER' || !c.user?.role;
    return matchesSearch && isCustomer;
  });

  const filteredSuppliers = useMemo(() => {
    return supplierList.filter(s => {
      const query = supplierSearch.toLowerCase().trim();
      if (!query) return true;

      const companyName = (s.companyName || '').toLowerCase();
      const contactPerson = (s.contactPerson || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();

      return companyName.includes(query) || 
        contactPerson.includes(query) || 
        email.includes(query) || 
        phone.includes(query);
    });
  }, [supplierList, supplierSearch]);

  const handleAddStockChange = (e) => {
    const { name, value } = e.target;
    setAddStockData({ ...addStockData, [name]: value });
  };

  const handleEditStockChange = (e) => {
    const { name, value } = e.target;
    setEditStockData({ ...editStockData, [name]: value });
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    
    try {
      // 1. Create the base item (with qty 0 first to ensure complex batch is handled via add-stock)
      const itemData = {
        name: addStockData.name,
        partNumber: addStockData.partNumber,
        hsCode: addStockData.hsCode,
        quantity: 0,
        unitPrice: parseFloat(addStockData.unitPrice) || 0,
        lowStockThreshold: parseInt(addStockData.lowStockThreshold) || 5,
        supplier: addStockData.supplierId ? { id: parseInt(addStockData.supplierId) } : null,
        category: addStockData.categoryId ? { id: parseInt(addStockData.categoryId) } : null
      };
      
      await stockService.createStockItem(itemData);
      
      showAlert('Inventory item definition created successfully!', { title: 'Success', variant: 'success' });
      setAddStockData(initialStockData);
      fetchStock();
      setShowAddStockModal(false);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add item.', { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openEditStock = (item) => {
    setEditingStockId(item.id);
    setEditStockData({
      name: item.name,
      partNumber: item.partNumber,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lowStockThreshold: item.lowStockThreshold || 5,
      supplierId: item.supplier?.id || '',
      categoryId: item.category?.id || '',
      remarks: item.remarks || '',
      location: item.location || ''
    });
    setUpdateMsg({ type: '', text: '' });
    setShowEditStockModal(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateMsg({ type: '', text: '' });
    try {
      const dataToSend = {
        ...editStockData,
        supplier: editStockData.supplierId ? { id: parseInt(editStockData.supplierId) } : null,
        category: editStockData.categoryId ? { id: parseInt(editStockData.categoryId) } : null
      };
      await stockService.updateStockItem(editingStockId, dataToSend);
      setUpdateMsg({ type: 'success', text: 'Item updated successfully!' });
      fetchStock();
      setTimeout(() => { 
        setShowEditStockModal(false); 
        setUpdateMsg({ type: '', text: '' }); 
      }, 1000);
    } catch (err) {
      setUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!quickAddData.itemId || !quickAddData.quantity || !quickAddData.sellingPrice) return;
    
    setLoading(true);
    setUpdateMsg({ type: '', text: '' });
    
    try {
      const priceVal = parseFloat(quickAddData.sellingPrice);
      const payload = {
        quantity: parseInt(quickAddData.quantity, 10),
        unitPrice: priceVal,
        supplierId: quickAddData.supplierId ? parseInt(quickAddData.supplierId) : null,
        hsCode: null,
        currencyType: null,
        unitCostForeign: null,
        exchangeRate: null,
        freightCost: null,
        shippingCost: null,
        bankCharges: null,
        clearanceFees: null,
        dutyFees: null,
        additionalExpenses: null,
        landedCost: priceVal,
        sellingPrice: priceVal,
      };
      
      await stockService.addStock(quickAddData.itemId, payload);
      
      // Invalidate batch cache for this item
      setRowBatches(prev => {
        const newBatches = { ...prev };
        delete newBatches[quickAddData.itemId];
        return newBatches;
      });
      
      // Re-fetch batches if row is currently expanded
      if (expandedStockRows.has(quickAddData.itemId)) {
        stockService.getBatches(quickAddData.itemId).then(res => {
          setRowBatches(prev => ({ ...prev, [quickAddData.itemId]: res.data }));
        }).catch(err => console.error("Failed to re-fetch batches", err));
      }

      fetchStock();
      fetchTransactions();
      showAlert('Stock added successfully!', { title: 'Success', variant: 'success' });
      setShowQuickAddModal(false);
      setQuickAddData({ itemId: '', quantity: '', hsCode: '', currencyType: '', unitCostForeign: '', exchangeRate: '', freightCost: '', shippingCost: '', bankCharges: '', clearanceFees: '', dutyFees: '', additionalExpenses: '', landedCost: '', unitPrice: '', sellingPrice: '', supplierId: '' });
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add stock.', { title: 'Error', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReduceSubmit = async (e) => {
    e.preventDefault();
    if (!quickReduceData.itemId || !quickReduceData.quantity) return;
    
    setLoading(true);
    setUpdateMsg({ type: '', text: '' });
    
    try {
      const payload = {
        quantity: parseInt(quickReduceData.quantity, 10),
        reason: quickReduceData.reason || 'Manual Reduction'
      };
      
      await stockService.reduceStock(quickReduceData.itemId, payload);
      setUpdateMsg({ type: 'success', text: 'Stock reduced successfully using FIFO.' });
      
      // Invalidate batch cache for this item
      setRowBatches(prev => {
        const newBatches = { ...prev };
        delete newBatches[quickReduceData.itemId];
        return newBatches;
      });
      
      // Re-fetch batches if row is currently expanded
      if (expandedStockRows.has(quickReduceData.itemId)) {
        stockService.getBatches(quickReduceData.itemId).then(res => {
          setRowBatches(prev => ({ ...prev, [quickReduceData.itemId]: res.data }));
        }).catch(err => console.error("Failed to re-fetch batches", err));
      }

      fetchStock();
      fetchTransactions();
      setTimeout(() => { 
        setShowQuickReduceModal(false); 
        setUpdateMsg({ type: '', text: '' });
        setQuickReduceData({ itemId: '', quantity: '', reason: '' });
      }, 1000);
    } catch (err) {
      setUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reduce stock.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = async (itemId) => {
    const newExpanded = new Set(expandedStockRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      // Fetch batches if not already loaded for this session
      if (!rowBatches[itemId]) {
        try {
          const res = await stockService.getBatches(itemId);
          setRowBatches(prev => ({ ...prev, [itemId]: res.data }));
        } catch (err) {
          console.error("Failed to fetch batches for row", err);
        }
      }
    }
    setExpandedStockRows(newExpanded);
  };

  const getMonthlySalesForItem = (itemId) => {
    const salesByMonth = {}; // Key: "YYYY-MM", Value: { monthStr: "YYYY-MM", sold: 0, revenue: 0, profit: 0 }
    const item = stockList.find(s => s.id === itemId);
    if (!item) return [];

    const batches = rowBatches[itemId] || [];
    const batchLandedCosts = {};
    batches.forEach(b => {
      batchLandedCosts[b.id] = parseFloat(b.landedCost || b.unitPrice || 0);
    });

    jobList.forEach(job => {
      if (job.status !== 'PAID' || !job.endTime) return;

      const date = new Date(job.endTime);
      if (isNaN(date.getTime())) return;
      
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      (job.items || []).forEach(ji => {
        const currentItemId = ji.stockItem?.id || ji.stockItemId;
        if (currentItemId !== itemId) return;

        const qty = ji.quantity || 0;
        const price = ji.priceAtTime || 0;
        const subtotal = price * qty;

        let landedCost = parseFloat(item.unitPrice || 0);
        if (ji.stockBatchId && batchLandedCosts[ji.stockBatchId] !== undefined) {
          landedCost = batchLandedCosts[ji.stockBatchId];
        } else if (batches.length > 0) {
          landedCost = parseFloat(batches[0].landedCost || batches[0].unitPrice || 0);
        }

        const profit = (price - landedCost) * qty;

        if (!salesByMonth[yearMonth]) {
          salesByMonth[yearMonth] = {
            monthStr: yearMonth,
            sold: 0,
            landedCost: 0,
            revenue: 0,
            profit: 0
          };
        }

        salesByMonth[yearMonth].sold += qty;
        salesByMonth[yearMonth].landedCost += landedCost * qty;
        salesByMonth[yearMonth].revenue += subtotal;
        salesByMonth[yearMonth].profit += profit;
      });
    });

    return Object.values(salesByMonth).sort((a, b) => b.monthStr.localeCompare(a.monthStr));
  };

  const PREDEFINED_EXPENSE_FIELDS = useMemo(() => [], []);

  const getMonthGrossProfit = (monthStr) => {
    let totalProfit = 0;
    
    // Pre-calculate batch details
    const batchDetails = {};
    Object.keys(rowBatches).forEach(itemId => {
      (rowBatches[itemId] || []).forEach(b => {
        batchDetails[b.id] = b;
      });
    });

    (jobList || []).forEach(job => {
      if (job.status !== 'PAID' || !job.endTime) return;
      const date = new Date(job.endTime);
      if (isNaN(date.getTime())) return;
      const jobMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (jobMonth !== monthStr) return;

      (job.items || []).forEach(ji => {
        const qty = ji.quantity || 0;
        const price = ji.priceAtTime || 0;
        
        const itemId = ji.stockItem?.id || ji.stockItemId;
        const item = stockList.find(s => s.id === itemId);
        
        let landedCost = parseFloat(item?.landedCost || item?.unitPrice || 0);
        let sellingPrice = price;

        let batch = null;
        if (ji.stockBatchId && batchDetails[ji.stockBatchId]) {
          batch = batchDetails[ji.stockBatchId];
        } else {
          const batches = rowBatches[itemId] || [];
          if (batches.length > 0) {
            batch = batches[0];
          }
        }

        if (batch) {
          landedCost = parseFloat(batch.landedCost || batch.unitPrice || 0);
          if (batch.sellingPrice !== undefined && batch.sellingPrice !== null) {
            sellingPrice = parseFloat(batch.sellingPrice);
          } else if (price > 0) {
            sellingPrice = price;
          } else {
            sellingPrice = landedCost;
          }
        }

        totalProfit += (sellingPrice - landedCost) * qty;
      });
    });
    
    return totalProfit;
  };

  const getMonthRevenue = (monthStr) => {
    let totalRevenue = 0;
    (jobList || []).forEach(job => {
      if (job.status !== 'PAID' || !job.endTime) return;
      const date = new Date(job.endTime);
      if (isNaN(date.getTime())) return;
      const jobMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (jobMonth !== monthStr) return;
      (job.items || []).forEach(ji => {
        totalRevenue += (ji.priceAtTime || 0) * (ji.quantity || 0);
      });
    });
    return totalRevenue;
  };

  const getOverallFinanceSummary = () => {
    const allMonths = new Set();
    
    // 1. Collect all months from job endTimes
    (jobList || []).forEach(job => {
      if (job.status !== 'PAID' || !job.endTime) return;
      const date = new Date(job.endTime);
      if (!isNaN(date.getTime())) {
        allMonths.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
    });

    // 2. Collect all months from expensesData
    Object.keys(expensesData || {}).forEach(m => allMonths.add(m));

    // 3. Add current month if not present
    const d = new Date();
    allMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);

    let overallGrossProfit = 0;
    let overallExpenses = 0;

    allMonths.forEach(m => {
      overallGrossProfit += getMonthGrossProfit(m);

      // Expenses
      const monthExpensesList = expensesData[m] || [];
      const monthExpTotal = monthExpensesList.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      overallExpenses += monthExpTotal;
    });

    const overallNet = overallGrossProfit - overallExpenses;

    return {
      overallGrossProfit,
      overallExpenses,
      overallNet
    };
  };

  const currentMonthExpenses = useMemo(() => {
    const list = expensesData[selectedFinanceMonth] || [];
    const OLD_STANDARD_NAMES = [
      "Monthly Expenses", "GD Ferdinand Salary", "Com Bank Loan 5Mn", "S Wickramasinghe", 
      "Other Loan Instalments", "N T M Wickramage", "Housing Loan", "Vehicle Maintanance", 
      "LP", "Cheque Payment", "Employment Salary", "Duty", "Clearance", 
      "Vihicle lease", "Vehicle Lease", "Fuel Allowance", "Building Rent 1st Floor"
    ];
    return list.filter(exp => !(OLD_STANDARD_NAMES.includes(exp.name) && (exp.amount === 0 || exp.amount === '0' || !exp.amount)));
  }, [expensesData, selectedFinanceMonth]);

  const handleUpdateExpense = (index, value) => {
    const updated = [...currentMonthExpenses];
    
    if (updated[index]) {
      updated[index].amount = value === '' ? '' : parseFloat(value) || 0;
    }
    
    const newExpensesData = {
      ...expensesData,
      [selectedFinanceMonth]: updated
    };
    setExpensesData(newExpensesData);
    localStorage.setItem('mind_spareparts_monthly_expenses', JSON.stringify(newExpensesData));
  };

  const handleAddExpenseField = (e) => {
    e.preventDefault();
    const currentList = currentMonthExpenses;
    
    const fieldName = customExpenseName.trim();
    if (!fieldName) {
      alert("Please enter a valid expense name.");
      return;
    }

    const amountVal = parseFloat(newExpenseAmount) || 0;

    if (currentList.some(exp => exp.name.toLowerCase() === fieldName.toLowerCase())) {
      alert(`The expense field "${fieldName}" already exists for this month.`);
      return;
    }

    const updated = [...currentList, { name: fieldName, amount: amountVal }];
    const newExpensesData = {
      ...expensesData,
      [selectedFinanceMonth]: updated
    };
    
    setExpensesData(newExpensesData);
    localStorage.setItem('mind_spareparts_monthly_expenses', JSON.stringify(newExpensesData));
    
    setCustomExpenseName('');
    setNewExpenseAmount('');
  };

  const handleDeleteExpenseField = async (index) => {
    const ok = await showConfirm('Are you sure you want to delete this expense field?', { title: 'Delete Expense Field', variant: 'danger', confirmText: 'Yes, Delete' });
    if (ok) {
      const currentList = currentMonthExpenses;
      const updated = currentList.filter((_, idx) => idx !== index);
      const newExpensesData = { ...expensesData, [selectedFinanceMonth]: updated };
      setExpensesData(newExpensesData);
      localStorage.setItem('mind_spareparts_monthly_expenses', JSON.stringify(newExpensesData));
    }
  };

  const handleClearAllExpenses = async () => {
    const ok = await showConfirm('Are you sure you want to clear all expenses for this month?', { title: 'Clear Expenses', variant: 'warning', confirmText: 'Yes, Clear All' });
    if (ok) {
      const newExpensesData = { ...expensesData, [selectedFinanceMonth]: [] };
      setExpensesData(newExpensesData);
      localStorage.setItem('mind_spareparts_monthly_expenses', JSON.stringify(newExpensesData));
    }
  };

  const handleResetInventory = async () => {
    const ok = await showConfirm('This will PERMANENTLY DELETE all inventory items, stock history, and batches. This cannot be undone.', { title: '⚠️ Reset All Inventory', variant: 'danger', confirmText: 'Yes, Delete Everything' });
    if (ok) {
      setLoading(true);
      try {
        await stockService.deleteAllStock();
        fetchStock();
        fetchTransactions();
        await showAlert('Inventory has been completely reset.', { title: 'Done', variant: 'success' });
      } catch (err) {
        await showAlert('Failed to reset inventory.', { title: 'Error', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    }
  };

  const exportTransactionsToPDF = () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF();

      // Dark header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 38, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(BRANDING.name, 14, 15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Inventory Audit Report', 14, 24);
      doc.text('Generated: ' + new Date().toLocaleString(), 14, 32);

      let yPos = 46;

      // Filter summary
      const filterParts = [];
      if (transactionTypeFilter !== 'ALL') filterParts.push('Type: ' + transactionTypeFilter);
      if (transactionDateFrom) filterParts.push('From: ' + transactionDateFrom);
      if (transactionDateTo) filterParts.push('To: ' + transactionDateTo);
      if (transactionSearch) filterParts.push('Search: ' + transactionSearch);
      if (transactionSupplierFilter !== 'ALL') {
        const sup = supplierList.find(s => s.id?.toString() === transactionSupplierFilter);
        filterParts.push('Supplier: ' + (sup?.companyName || 'None'));
      }
      if (filterParts.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'bold');
        doc.text('Filters: ', 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(filterParts.join(' | '), 32, yPos);
        yPos += 10;
      }

      // Summary stat boxes
      const totalAdded = filteredTransactions.filter(t => t.transactionType === 'ADD').reduce((s, t) => s + (t.quantity || 0), 0);
      const totalReduced = filteredTransactions.filter(t => t.transactionType === 'REDUCE').reduce((s, t) => s + (t.quantity || 0), 0);
      const totalValue = filteredTransactions.reduce((s, t) => s + (parseFloat(t.totalAmount) || 0), 0);

      doc.setFillColor(240, 253, 244);
      doc.rect(14, yPos, 55, 20, 'F');
      doc.setFillColor(255, 241, 242);
      doc.rect(74, yPos, 55, 20, 'F');
      doc.setFillColor(239, 246, 255);
      doc.rect(134, yPos, 62, 20, 'F');

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(String(totalAdded), 41, yPos + 10, { align: 'center' });
      doc.setTextColor(220, 38, 38);
      doc.text(String(totalReduced), 101, yPos + 10, { align: 'center' });
      doc.setTextColor(37, 99, 235);
      doc.text('Rs.' + totalValue.toFixed(2), 165, yPos + 10, { align: 'center' });

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text('TOTAL ADDED', 41, yPos + 17, { align: 'center' });
      doc.text('TOTAL REDUCED', 101, yPos + 17, { align: 'center' });
      doc.text('TOTAL VALUE', 165, yPos + 17, { align: 'center' });

      yPos += 26;

      const columns = ['DATE', 'TIME', 'ITEM', 'TYPE', 'QTY', 'UNIT PRICE', 'TOTAL', 'SUPPLIER', 'BY', 'NOTE'];
      const rows = filteredTransactions.map(tx => [
        tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '-',
        tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        tx.isGroup ? `Batch: ${tx.items.length} Parts` : (tx.stockItem?.name || 'N/A'),
        tx.isGroup ? 'JOB BATCH' : (tx.transactionType || '-'),
        String(tx.quantity ?? '-'),
        tx.isGroup ? 'Batch Total' : (tx.unitPrice != null ? 'Rs.' + parseFloat(tx.unitPrice).toFixed(2) : '-'),
        tx.totalAmount != null ? 'Rs.' + parseFloat(tx.totalAmount).toFixed(2) : '-',
        tx.isGroup ? `JOB #${tx.jobId}` : (tx.supplier?.companyName || 'INTERNAL'),
        tx.performedBy || 'System',
        tx.note || '-'
      ]);

      // Call autoTable directly
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
        bodyStyles: { fontSize: 7, cellPadding: 2 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 14 },
          2: { cellWidth: 28 },
          3: { cellWidth: 14, halign: 'center' },
          4: { cellWidth: 10, halign: 'center' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 20, halign: 'right' },
          7: { cellWidth: 20 },
          8: { cellWidth: 18 },
          9: { cellWidth: 20 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === 'ADD') {
              data.cell.styles.textColor = [5, 150, 105];
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.raw === 'REDUCE') {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        margin: { left: 14, right: 14 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(160);
        doc.text(
          BRANDING.name + ' | Inventory Audit | Page ' + i + ' of ' + pageCount + ' | Confidential',
          105,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      doc.save('Inventory_Audit_' + new Date().toISOString().slice(0, 10) + '.pdf');
    } catch (err) {
      console.error('PDF Export failed:', err);
      showAlert('PDF export failed: ' + err.message, { title: 'Export Error', variant: 'danger' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteStock = async (id) => {
    const ok = await showConfirm('Are you sure you want to delete this inventory item? All batch data will also be removed.', { title: 'Delete Inventory Item', variant: 'danger', confirmText: 'Yes, Delete' });
    if (ok) {
      try {
        await stockService.deleteStockItem(id);
        fetchStock();
      } catch (err) {
        await showAlert(err.response?.data?.message || 'Delete failed.', { title: 'Error', variant: 'danger' });
      }
    }
  };

  const handleAddSupplierChange = (e) => {
    const { name, value } = e.target;
    setAddSupplierData({ ...addSupplierData, [name]: value });
  };

  const handleEditSupplierChange = (e) => {
    const { name, value } = e.target;
    setEditSupplierData({ ...editSupplierData, [name]: value });
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supplierService.createSupplier(addSupplierData);
      setMsg({ type: 'success', text: 'Supplier added successfully!' });
      setAddSupplierData(initialSupplierData);
      fetchSuppliers();
      setShowAddSupplierModal(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to add supplier.' });
    } finally {
      setLoading(false);
    }
  };

  const openEditSupplier = (supplier) => {
    setEditingSupplierId(supplier.id);
    setEditSupplierData({
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      active: supplier.active
    });
    setUpdateMsg({ type: '', text: '' });
    setShowEditSupplierModal(true);
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supplierService.updateSupplier(editingSupplierId, editSupplierData);
      setUpdateMsg({ type: 'success', text: 'Supplier updated successfully!' });
      fetchSuppliers();
      setTimeout(() => { 
        setShowEditSupplierModal(false); 
        setUpdateMsg({ type: '', text: '' }); 
      }, 1000);
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    const ok = await showConfirm('Are you sure you want to delete this supplier? This action cannot be undone.', { title: 'Delete Supplier', variant: 'danger', confirmText: 'Yes, Delete' });
    if (ok) {
      try {
        await supplierService.deleteSupplier(id);
        fetchSuppliers();
        setShowEditSupplierModal(false);
      } catch (err) {
        await showAlert('Failed to delete supplier.', { title: 'Error', variant: 'danger' });
      }
    }
  };

  const filteredStock = useMemo(() => {
    return stockList.filter(item => {
      const q = stockSearch.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(q) || 
                            item.partNumber.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'ALL' || item.category?.id?.toString() === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.id - b.id);
  }, [stockList, stockSearch, categoryFilter]);

  const filteredTransactions = useMemo(() => {
    // Build O(1) job lookup map — avoids O(n) find() inside every transaction
    const jobMap = new Map(jobList.map(j => [j.id, j]));

    const rawFiltered = transactionList.filter(tx => {
      const q = deferredTransactionSearch.toLowerCase();
      if (q) {
        const matchesSearch =
          tx.stockItem?.name?.toLowerCase().includes(q) ||
          tx.stockItem?.partNumber?.toLowerCase().includes(q) ||
          tx.supplier?.companyName?.toLowerCase().includes(q) ||
          tx.note?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (logTab === 'stock_in' && tx.transactionType !== 'ADD') return false;
      if (logTab === 'stock_out' && tx.transactionType !== 'REDUCE' && tx.transactionType !== 'SALE' && tx.transactionType !== 'RESTORE') return false;

      if (transactionSupplierFilter !== 'ALL' && (!tx.supplier || String(tx.supplier.id) !== transactionSupplierFilter)) return false;

      if (transactionDateFrom || transactionDateTo) {
        const date = new Date(tx.timestamp);
        if (transactionDateFrom && date < new Date(transactionDateFrom)) return false;
        if (transactionDateTo && date > new Date(transactionDateTo)) return false;
      }

      if (logTab === 'stock_out' && tx.jobId) {
        const job = jobMap.get(Number(tx.jobId));
        if (job?.status === 'CANCELLED') return false;
      }

      return true;
    });

    // Grouping for stock_out tab
    const groups = [];
    const jobGroupMap = new Map();

    rawFiltered.forEach(tx => {
      if (tx.jobId && logTab === 'stock_out') {
        const jobId = Number(tx.jobId);
        if (!jobGroupMap.has(jobId)) {
          const relatedJob = jobMap.get(jobId);
          const newGroup = {
            id: `group-${jobId}-${new Date(tx.timestamp).getTime()}`,
            jobId: tx.jobId,
            timestamp: tx.timestamp,
            transactionType: tx.transactionType,
            note: tx.note,
            isGroup: true,
            items: [],
            services: relatedJob?.services || [],
            totalAmount: 0,
            quantity: 0
          };
          jobGroupMap.set(jobId, newGroup);
          groups.push(newGroup);
        }
        const group = jobGroupMap.get(jobId);
        group.items.push(tx);
        group.totalAmount += parseFloat(tx.totalAmount || 0);
        group.quantity += tx.quantity || 0;
      } else {
        groups.push({ ...tx, isGroup: false });
      }
    });

    return groups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [transactionList, deferredTransactionSearch, logTab, transactionSupplierFilter, transactionDateFrom, transactionDateTo, jobList]);

  const workStats = useMemo(() => {
    const today = new Date().toDateString();
    let waiting = 0, paidToday = 0, revenueToday = 0;
    
    for (let i = 0; i < jobList.length; i++) {
      const j = jobList[i];
      if (j.status === 'WAITING') waiting++;
      if (j.status === 'PAID' && j.startTime && new Date(j.startTime).toDateString() === today) {
        paidToday++;
        revenueToday += (j.totalAmount || 0);
      }
    }
    
    return [
      { label: 'Waiting', value: waiting, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50', id: 'WAITING' },
      { label: 'Today Paid', value: paidToday, icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', id: 'PAID' },
      { label: 'Today Revenue', value: 'Rs.' + revenueToday.toLocaleString(), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', id: 'ALL' },
    ];
  }, [jobList]);

  const filteredJobs = useMemo(() => {
    const q = deferredJobSearch.toLowerCase().trim();
    const filtered = jobList.filter(j => {
      const billId = `bill #${j.id}`;
      const cName = (j.customer ? `${j.customer.firstName || ''} ${j.customer.lastName || ''}` : '').toLowerCase();
      
      const matchesSearch = billId.includes(q) || cName.includes(q) || j.id.toString() === q;
      const matchesStatus = jobStatusFilter === 'ALL' || j.status === jobStatusFilter;
      const matchesDate = !jobDateFilter || (j.startTime && new Date(j.startTime).toISOString().split('T')[0] === jobDateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
    return filtered.sort((a,b) => new Date(b.startTime) - new Date(a.startTime));
  }, [jobList, deferredJobSearch, jobStatusFilter, jobDateFilter]);

  // ===== PAGINATION =====
  const PAGE_SIZE = 20;
  const [stockPage, setStockPage]       = useState(1);
  const [txPage, setTxPage]             = useState(1);
  const [jobLogPage, setJobLogPage]     = useState(1);
  const [jobPage, setJobPage]           = useState(1);
  const [staffPage, setStaffPage]       = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [supplierPage, setSupplierPage] = useState(1);

  // Reset pages whenever the underlying filter changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setStockPage(1); },    [stockSearch, categoryFilter]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setTxPage(1); },       [logTab, deferredTransactionSearch, transactionSupplierFilter, transactionDateFrom, transactionDateTo]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setJobLogPage(1); },   [logTab]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setJobPage(1); },      [deferredJobSearch, jobStatusFilter, jobDateFilter]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setStaffPage(1); },    [staffSearch, roleFilter]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setCustomerPage(1); }, [customerSearch]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSupplierPage(1); }, [supplierSearch]);

  useEffect(() => {
    // Scroll to top whenever the tab, sub-tab, or pagination changes
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab, logTab, jobPage, staffPage, customerPage, supplierPage, stockPage, txPage, jobLogPage]);

  // Paginated slices
  const paginatedStock       = useMemo(() => filteredStock.slice((stockPage - 1) * PAGE_SIZE, stockPage * PAGE_SIZE), [filteredStock, stockPage]);
  const paginatedTransactions = useMemo(() => filteredTransactions.slice((txPage - 1) * PAGE_SIZE, txPage * PAGE_SIZE), [filteredTransactions, txPage]);
  const paginatedJobLogs     = useMemo(() => jobLogs.slice((jobLogPage - 1) * PAGE_SIZE, jobLogPage * PAGE_SIZE), [jobLogs, jobLogPage]);
  const paginatedJobs        = useMemo(() => filteredJobs.slice((jobPage - 1) * PAGE_SIZE, jobPage * PAGE_SIZE), [filteredJobs, jobPage]);
  const paginatedStaff       = useMemo(() => filteredStaff.slice((staffPage - 1) * PAGE_SIZE, staffPage * PAGE_SIZE), [filteredStaff, staffPage]);
  const paginatedCustomers   = useMemo(() => filteredCustomers.slice((customerPage - 1) * PAGE_SIZE, customerPage * PAGE_SIZE), [filteredCustomers, customerPage]);
  const paginatedSuppliers   = useMemo(() => filteredSuppliers.slice((supplierPage - 1) * PAGE_SIZE, supplierPage * PAGE_SIZE), [filteredSuppliers, supplierPage]);

  // Memoize grouped inventory — avoids inline reduce on every render
  const groupedPaginatedStock = useMemo(() =>
    Object.entries(
      paginatedStock.reduce((acc, item) => {
        const catName = item.category?.name || 'Uncategorized';
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(item);
        return acc;
      }, {})
    ),
    [paginatedStock]
  );

  /** Renders a compact pagination bar. */
  const renderPagination = (total, page, setPage, pageSize = PAGE_SIZE) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;
    const start = (page - 1) * pageSize + 1;
    const end   = Math.min(page * pageSize, total);
    // Build a compact window of page numbers
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing <span className="text-slate-700 font-black">{start}–{end}</span> of <span className="text-slate-700 font-black">{total}</span> records
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-black"
          >‹</button>
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-300 text-xs font-bold">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all border ${
                  page === p
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'text-slate-500 border-transparent hover:border-slate-200 hover:bg-white hover:text-slate-900'
                }`}
              >{p}</button>
            )
          )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-black"
          >›</button>
        </div>
      </div>
    );
  };
  // ===== END PAGINATION =====

  const topCustomers = useMemo(() => {
    const freqMap = {};
    jobList.forEach(job => {
      if (job.status !== 'CANCELLED' && job.customerId) {
        freqMap[job.customerId] = (freqMap[job.customerId] || 0) + 1;
      }
    });
    return [...customerList]
      .filter(c => (c.user?.enabled ?? c.user?.active ?? c.user?.isActive ?? true) === true)
      .sort((a, b) => (freqMap[b.id] || 0) - (freqMap[a.id] || 0))
      .slice(0, 5);
  }, [customerList, jobList]);

  const filteredCustomerDropdown = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return topCustomers;
    return customerList
      .filter(c => (c.user?.enabled ?? c.user?.active ?? c.user?.isActive ?? true) === true)
      .filter(c => (c.firstName + ' ' + (c.lastName || '')).toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.idNo || '').toLowerCase().includes(q))
      .slice(0, 5);
  }, [customerList, customerSearchQuery, topCustomers]);


  const topSellingItems = useMemo(() => {
    const salesMap = {};
    jobList.forEach(job => {
      if (job.status !== 'CANCELLED' && job.items) {
        job.items.forEach(ji => {
          const itemId = ji.stockItem?.id || ji.stockItemId;
          if (itemId) {
            salesMap[itemId] = (salesMap[itemId] || 0) + (ji.quantity || 0);
          }
        });
      }
    });

    return [...stockList]
      .sort((a, b) => {
        const salesA = salesMap[a.id] || 0;
        const salesB = salesMap[b.id] || 0;
        if (salesB !== salesA) return salesB - salesA;
        return (b.quantity || 0) - (a.quantity || 0);
      })
      .slice(0, 5);
  }, [stockList, jobList]);

  const filteredPartDropdown = useMemo(() => {
    const q = partSearchQuery.toLowerCase().trim();
    if (!q) return topSellingItems;
    return stockList
      .filter(it => (it.name || '').toLowerCase().includes(q) || (it.partNumber || '').toLowerCase().includes(q))
      .slice(0, 5);
  }, [stockList, partSearchQuery, topSellingItems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0, duration: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-100 selection:text-blue-700 relative">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40
        w-72 border-r border-slate-200 bg-white flex flex-col shadow-xl
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-slate-900 leading-none">{BRANDING.name}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mt-0.5">Inventory Central</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'staff', icon: Users, label: 'Team Management' },
            { id: 'customers', icon: UserIcon, label: 'Customer Management' },
            { id: 'suppliers', icon: Truck, label: 'Supplier Management' },
            { id: 'inventory', icon: Package, label: 'Inventory Management' },
            { id: 'work', icon: Briefcase, label: 'Bill Management' },
            { id: 'audit', icon: ClipboardList, label: 'Logs' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'text-white bg-blue-600 shadow-lg shadow-blue-600/20'
                  : 'hover:bg-slate-50 text-slate-500 font-bold'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 text-white/70 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center font-black text-blue-700 text-sm">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-900 truncate">{user?.name || user?.username}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-black transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-white min-w-0">

        {/* Header */}
        <header className="h-16 md:h-20 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          {/* Hamburger - mobile only */}
          <button
            className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 mr-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          <div className="flex-1" />


        </header>

        {/* Content Area */}
        <div ref={contentAreaRef} className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 space-y-8 bg-white relative">
          
          {/* Global Notification Banner */}
          <AnimatePresence>
            {msg.text && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] min-w-[320px] max-w-md p-4 rounded-2xl shadow-2xl border flex items-center gap-4 backdrop-blur-xl ${
                  msg.type === 'error' 
                  ? 'bg-red-50/90 border-red-100 text-red-600' 
                  : 'bg-emerald-50/90 border-emerald-100 text-emerald-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.type === 'error' ? 'bg-red-100' : 'bg-emerald-100'
                }`}>
                  {msg.type === 'error' ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-1">System Feedback</p>
                  <p className="text-sm font-black tracking-tight leading-tight">{msg.text}</p>
                </div>
                <button onClick={() => setMsg({ type: '', text: '' })} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 rotate-45 opacity-40" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -10 }}
                className="space-y-12"
              >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <motion.div variants={itemVariants}>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">System Pulse</h2>
                  <p className="text-slate-500 mt-2 md:mt-3 font-bold text-sm md:text-lg tracking-tight">Real-time performance analytics for <span className="text-blue-600">{BRANDING.name}</span>.</p>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Monthly Revenue", value: 'Rs. ' + (analyticsData.monthlyRevenue || 0).toLocaleString(), growth: 'Last 30d', icon: Activity, color: 'blue', accent: 'bg-blue-600' },
                  { label: 'Stock Value (COGS)', value: 'Rs. ' + (analyticsData.remainingStockValue || 0).toLocaleString(), growth: 'Asset', icon: Package, color: 'indigo', accent: 'bg-indigo-600' },
                  { label: 'Stock Value (Retail)', value: 'Rs. ' + (analyticsData.estimatedSellingValue || 0).toLocaleString(), growth: 'Market', icon: Layers, color: 'blue', accent: 'bg-blue-500' },
                  { label: 'Low Stock Items', value: (analyticsData.lowStockCount || 0).toString(), growth: 'Alert', icon: AlertTriangle, color: 'amber', accent: 'bg-amber-500' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm ${
                        stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                        stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${stat.growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {stat.growth}
                      </span>
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-slate-900 tracking-tighter break-words leading-tight">{stat.value}</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 truncate">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <motion.div 
                  variants={itemVariants}
                  className="md:col-span-2 lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100/50"
                >
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h4 className="font-black text-2xl text-slate-900 tracking-tighter">Revenue Performance</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Last 7 Days Growth</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Total Bill (Rs)</span>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.chartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)', padding: '12px'}}
                          itemStyle={{fontSize: '12px', fontWeight: 900, color: '#1e293b'}}
                          labelStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px'}}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100/50 flex flex-col justify-between relative overflow-hidden group">
                   <div>
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black text-2xl text-slate-900 tracking-tighter">Popular Parts</h4>
                       <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">This Week</div>
                     </div>
                     <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-8">
                       {analyticsData.weekStart ? (isNaN(new Date(analyticsData.weekStart).getTime()) ? (isNaN(new Date(analyticsData.weekStart + " " + new Date().getFullYear()).getTime()) ? analyticsData.weekStart : new Date(analyticsData.weekStart + " " + new Date().getFullYear()).toLocaleDateString()) : new Date(analyticsData.weekStart).toLocaleDateString()) : '---'} — {analyticsData.weekEnd ? (isNaN(new Date(analyticsData.weekEnd).getTime()) ? (isNaN(new Date(analyticsData.weekEnd + " " + new Date().getFullYear()).getTime()) ? analyticsData.weekEnd : new Date(analyticsData.weekEnd + " " + new Date().getFullYear()).toLocaleDateString()) : new Date(analyticsData.weekEnd).toLocaleDateString()) : '---'}
                     </p>
                     <div className="space-y-4">
                        {analyticsData.topItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-5 p-3 rounded-[1.5rem] hover:bg-slate-50 transition-all group/item">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                              i === 0 ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400 group-hover/item:bg-slate-200'
                            }`}>
                              {i === 0 ? '🏆' : i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-black text-slate-900 tracking-tight truncate">{item.name}</p>
                              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Top Choice #{i+1}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[16px] font-black text-slate-900 leading-none">{item.qty}</p>
                              <p className="text-[8px] font-black uppercase text-slate-400 mt-1">Sold</p>
                            </div>
                          </div>
                        ))}
                        {analyticsData.topItems.length === 0 && <p className="text-slate-400 text-xs font-bold italic py-10 text-center">No inventory movement this week.</p>}
                     </div>
                   </div>
                   <button onClick={() => setActiveTab('inventory')} className="mt-8 w-full py-4 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Inventory Hub</button>
                </motion.div>
              </div>


            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div 
              key="staff"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Add Staff Card */}
              <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                    {formData.role === 'ADMIN' ? 'Add Admin' : 'Add Staff'}
                  </h3>
                  <div className="bg-slate-100 rounded-full p-1 flex">
                    <button type="button" onClick={() => setFormData({...formData, role: 'STAFF'})} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${formData.role === 'STAFF' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>STAFF</button>
                    <button type="button" onClick={() => setFormData({...formData, role: 'ADMIN'})} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${formData.role === 'ADMIN' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>ADMIN</button>
                  </div>
                </div>
                <form onSubmit={handleAddStaff} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">First Name</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. John" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Name</label>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                    </div>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. Doe" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Username</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. johndoe123" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Phone</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="text" name="phone" required value={formData.phone} onChange={handleChange} maxLength="10" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="10-digit number" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email</label>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                    </div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. john@example.com" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">NIC / ID No</label>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                    </div>
                    <input type="text" name="idNo" value={formData.idNo} onChange={handleChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. 123456789V" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Address</label>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                    </div>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="Full address" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Password</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="Create a strong password" />
                  </div>

                  {msg.text && (
                    <div className={`p-4 rounded-xl text-[13px] font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all mt-4 shadow-lg shadow-slate-900/20">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
                  </button>
                </form>
              </motion.div>

              {/* Staff Directory */}
              <motion.div variants={itemVariants} className="xl:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">Staff Directory</h3>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                      {['ALL', 'ROLE_ADMIN', 'ROLE_STAFF'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black whitespace-nowrap transition-all ${
                            roleFilter === role 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {role === 'ALL' ? 'ALL' : role.replace('ROLE_', '')}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search staff..." 
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        className="bg-transparent text-sm font-bold outline-none placeholder:text-slate-500 w-full sm:w-48" 
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-4 px-4">USER</th>
                        <th className="py-4 px-4">CONTACT</th>
                        <th className="py-4 px-4">STATUS</th>
                        <th className="py-4 px-4 text-right">EDIT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStaff.map((staff, index) => {
                        const isStaffEnabled = staff.enabled ?? staff.active ?? staff.isActive ?? true;
                        const staffRole = staff.role || staff.userRole || 'ROLE_STAFF';
                        
                        return (
                          <tr key={staff.userId || staff.id || `staff-key-${index}`} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${!isStaffEnabled ? 'opacity-60' : ''}`}>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full ${staffRole === 'ROLE_ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                                  {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0) || ''}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 text-sm">{staff.firstName} {staff.lastName}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${staffRole === 'ROLE_ADMIN' ? 'text-indigo-500' : 'text-slate-400'}`}>
                                    {staffRole.replace('ROLE_', '')}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-slate-500 font-medium">{staff.email}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{staff.phone}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isStaffEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {isStaffEnabled ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button onClick={() => openEditStaff(staff)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors ml-auto border border-slate-100">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      
                      {paginatedStaff.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                <Users className="w-8 h-8 text-slate-200" />
                              </div>
                              <p className="text-slate-400 font-bold text-sm tracking-tight">No team members found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(filteredStaff.length, staffPage, setStaffPage)}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div 
              key="customers"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -10 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-8"
            >
              {/* Add Customer Card */}
              <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">Add Customer</h3>
                </div>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">First Name</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="text" name="firstName" required value={customerFormData.firstName} onChange={handleCustomerFormChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. Jane" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Name</label>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                    </div>
                    <input type="text" name="lastName" value={customerFormData.lastName} onChange={handleCustomerFormChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. Smith" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Phone</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="text" name="phone" required value={customerFormData.phone} onChange={handleCustomerFormChange} maxLength="10" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="10-digit number" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">NIC / ID No</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="text" name="idNo" required value={customerFormData.idNo} onChange={handleCustomerFormChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. 123456789V" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email</label>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                    </div>
                    <input type="email" name="email" value={customerFormData.email} onChange={handleCustomerFormChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="e.g. jane@example.com" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Address</label>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                    </div>
                    <input type="text" name="address" value={customerFormData.address} onChange={handleCustomerFormChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="Full address" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Password</label>
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                    </div>
                    <input type="password" name="password" required value={customerFormData.password} onChange={handleCustomerFormChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="Create a strong password" />
                  </div>

                  {msg.text && (
                    <div className={`p-4 rounded-xl text-[13px] font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all mt-4 shadow-lg shadow-slate-900/20">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
                  </button>
                </form>
              </motion.div>

              {/* Customer Directory */}
              <motion.div variants={itemVariants} className="xl:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">Customer Directory</h3>
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm w-full md:w-auto">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search customers..." 
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none placeholder:text-slate-500 w-full md:w-48" 
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-4 px-4">USER</th>
                        <th className="py-4 px-4">CONTACT</th>
                        <th className="py-4 px-4">STATUS</th>
                        <th className="py-4 px-4 text-right">EDIT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCustomers.map((customer, index) => {
                        const isCustomerEnabled = customer.user?.enabled ?? customer.user?.active ?? customer.user?.isActive ?? true;
                        
                        return (
                          <tr key={customer.id || customer.user?.id || `cust-key-${index}`} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${!isCustomerEnabled ? 'opacity-60' : ''}`}>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0) || ''}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 text-sm">{customer.firstName} {customer.lastName}</span>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">CUSTOMER</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-slate-500 font-medium">{customer.user?.email}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{customer.phone}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isCustomerEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {isCustomerEnabled ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button onClick={() => openEditCustomer(customer)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors ml-auto border border-slate-100">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      
                      {paginatedCustomers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                <Users className="w-8 h-8 text-slate-200" />
                              </div>
                              <p className="text-slate-400 font-bold text-sm tracking-tight">No customers found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(filteredCustomers.length, customerPage, setCustomerPage)}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'suppliers' && (
            <motion.div 
              key="suppliers"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Supplier Management</h2>
                  <p className="text-slate-500 font-medium">Manage your business partners and supply chain.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search suppliers..." 
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none placeholder:text-slate-500 w-full" 
                    />
                  </div>
                  <button onClick={() => setShowAddSupplierModal(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap">
                    <Truck className="w-4 h-4" />
                    <span>Add Supplier</span>
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-4 px-4">COMPANY</th>
                        <th className="py-4 px-4">CONTACT PERSON</th>
                        <th className="py-4 px-4">EMAIL / PHONE</th>
                        <th className="py-4 px-4">STATUS</th>
                        <th className="py-4 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSuppliers.map((supplier, index) => (
                        <tr key={supplier.id || `supp-key-${index}`} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${!supplier.active ? 'opacity-60' : ''}`}>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                <Truck className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 text-sm">{supplier.companyName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600">{supplier.contactPerson}</td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-slate-900 font-bold">{supplier.email}</div>
                            <div className="text-xs text-slate-400 font-medium">{supplier.phone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${supplier.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {supplier.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button onClick={() => openEditSupplier(supplier)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors border border-slate-100 ml-auto">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paginatedSuppliers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No suppliers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(filteredSuppliers.length, supplierPage, setSupplierPage)}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              {/* Inventory Header & Controls */}
              <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Inventory Hub</h2>
                  <p className="text-slate-500 font-medium">Smart analytics and quick adjustments for stock levels.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                  <div className="flex-1 min-w-[140px] flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none w-full cursor-pointer appearance-none"
                    >
                      <option value="ALL">All Categories</option>
                      {categoryList.map(cat => (
                        <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search parts..." 
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none placeholder:text-slate-500 w-full" 
                    />
                  </div>

                  <div className="flex w-full sm:w-auto gap-2">
                    <button onClick={() => setActiveTab('audit')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold transition-all border border-slate-200 whitespace-nowrap">
                      <ClipboardList className="w-4 h-4" />
                      <span className="hidden sm:inline">Stock Log</span>
                    </button>
                    <button onClick={() => setShowQuickAddModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap">
                      <Layers className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Stock</span>
                    </button>
                    <button onClick={() => setShowAddStockModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap">
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Item</span>
                    </button>
                  </div>
                </div>
              </motion.div>



              {/* Smart Metrics Dashboard */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
                {[
                  {
                    label: 'Item Count',
                    value: (stockList || []).length.toString(),
                    icon: Layers,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                  },
                  {
                    label: 'Full Value',
                    value: 'Rs. ' + (analyticsData.remainingStockValue || 0).toLocaleString(undefined, {minimumFractionDigits: 2}),
                    icon: DollarSign,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50'
                  },
                  {
                    label: 'Low Stock',
                    value: analyticsData.lowStockCount || 0,
                    icon: AlertTriangle,
                    color: 'text-amber-500',
                    bg: 'bg-amber-50'
                  }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
                      <h4 className="text-lg font-black text-slate-900 mt-0.5 break-words leading-tight">{stat.value}</h4>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Inventory Intelligence Master Table */}
              <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden mb-10">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">Inventory Master</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Stock, Sales & Valuation</p>
                  </div>

                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="py-4 px-4 sm:px-6">PART SPECIFICATIONS</th>
                        <th className="py-4 px-3">LOCATION / REMARKS</th>
                        <th className="py-4 px-3">STOCK STATUS</th>
                        <th className="py-4 px-3 text-right">PRICE (RS.)</th>
                        <th className="py-4 px-4 sm:px-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedPaginatedStock.map(([categoryName, items]) => (
                        <React.Fragment key={categoryName}>
                          <tr className="bg-slate-50/40">
                            <td colSpan="5" className="py-3 px-8">
                              <div className="flex items-center gap-3">
                                <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{categoryName}</span>
                                <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{items.length} Parts</span>
                              </div>
                            </td>
                          </tr>
                          {items.map((item, index) => {
                            const isLowStock = item.quantity <= item.lowStockThreshold && item.quantity > 0;
                            const isOutOfStock = item.quantity === 0;
                            const isExpanded = expandedStockRows.has(item.id);
                            const analytic = inventoryAnalytics.find(a => a.itemId === item.id) || {};
                            
                            return (
                              <React.Fragment key={item.id || `stock-master-${index}`}>
                                <tr className={`border-b border-slate-50 hover:bg-slate-50/50 transition-all ${isExpanded ? 'bg-slate-50/30' : ''}`}>
                                  <td className="py-5 px-4 sm:px-6">
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => toggleRowExpansion(item.id)}
                                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-900 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                      <div className="flex flex-col">
                                        <span className="font-black text-slate-900 text-[14px] tracking-tight">{item.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">{item.partNumber}</span>
                                          {item.hsCode && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">HS: {item.hsCode}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-5 px-3 max-w-[180px]">
                                    <div className="flex flex-col gap-1">
                                      {item.location && (
                                        <div className="flex items-start gap-1.5">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-0.5 shrink-0">📍</span>
                                          <span className="text-[11px] font-semibold text-slate-700 leading-tight">{item.location}</span>
                                        </div>
                                      )}
                                      {item.remarks && (
                                        <div className="flex items-start gap-1.5">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 mt-0.5 shrink-0">📝</span>
                                          <span className="text-[11px] text-slate-500 italic leading-tight">{item.remarks}</span>
                                        </div>
                                      )}
                                      {!item.location && !item.remarks && (
                                        <span className="text-[10px] text-slate-300">—</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-5 px-3">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                                          {isOutOfStock ? 'Empty' : isLowStock ? 'Low Stock' : 'Good'}
                                        </span>
                                        <span className="text-xs font-black text-slate-900">{item.quantity} units</span>
                                      </div>
                                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                        <div className={`h-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((item.quantity / (item.lowStockThreshold * 2 + 1)) * 100, 100)}%` }} />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-5 px-3 text-right">
                                    <span className="text-sm font-black text-slate-900">Rs. {parseFloat(item.unitPrice || 0).toLocaleString()}</span>
                                  </td>
                                  <td className="py-5 px-4 sm:px-6 text-right">
                                    <div className="flex items-center justify-end gap-2.5">
                                      <button onClick={() => {
                                        setQuickAddData({ itemId: item.id, quantity: '', hsCode: '', currencyType: '', unitCostForeign: '', exchangeRate: '', freightCost: '', shippingCost: '', bankCharges: '', clearanceFees: '', dutyFees: '', additionalExpenses: '', landedCost: '', unitPrice: item.unitPrice || '', sellingPrice: item.unitPrice || '', supplierId: item.supplier?.id || '' });
                                        setShowQuickAddModal(true);
                                      }} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all border border-slate-100 hover:border-emerald-600 group">
                                        <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                      </button>
                                      <button onClick={() => {
                                        setQuickReduceData({ itemId: item.id, quantity: '', reason: '' });
                                        setShowQuickReduceModal(true);
                                      }} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-all border border-slate-100 hover:border-rose-600 group">
                                        <MinusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                      </button>

                                      <button onClick={() => openEditStock(item)} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-100 hover:border-blue-600 group">
                                        <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.tr
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="bg-slate-50/60"
                                    >
                                      <td colSpan="5" className="p-0 overflow-hidden">
                                        <div className="p-6 md:pl-20 md:pr-12">
                                           <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                                                 <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Batch Inventory Ledger (FIFO)</span>
                                              </div>
                                              <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                   <thead className="bg-slate-50/30 border-b border-slate-100">
                                                      <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <th className="py-3 px-6">ENTRY DATE</th>
                                                        <th className="py-3 px-4">SUPPLIER</th>
                                                        <th className="py-3 px-4 text-right">PRICE (RS.)</th>
                                                        <th className="py-3 px-6 text-right">REMAINING QTY</th>
                                                        <th className="py-3 px-4 text-center">ACTION</th>
                                                      </tr>
                                                   </thead>
                                                   <tbody className="divide-y divide-slate-50">
                                                      {(rowBatches[item.id] || []).map((batch, bi) => {
                                                        return (
                                                          <tr key={batch.id || bi} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-3 px-6 text-[10px] font-black text-slate-600">
                                                              {new Date(batch.createdAt).toLocaleDateString()}
                                                              <span className="block text-[8px] font-bold text-slate-400">{new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </td>
                                                            <td className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase">{batch.supplier?.companyName || 'N/A'}</td>
                                                            <td className="py-3 px-4 text-right text-[10px] font-black text-slate-900">Rs. {(batch.sellingPrice || batch.unitPrice || 0).toLocaleString()}</td>
                                                            <td className="py-3 px-6 text-right">
                                                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${batch.currentQuantity === 0 ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                                                {batch.currentQuantity} / {batch.initialQuantity}
                                                              </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                              <button
                                                                type="button"
                                                                onClick={() => setSelectedBatchDetail(batch)}
                                                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-[9px] font-black uppercase tracking-wider transition-all"
                                                              >
                                                                View More
                                                              </button>
                                                            </td>
                                                          </tr>
                                                        );
                                                      })}
                                                      {(!rowBatches[item.id] || rowBatches[item.id].length === 0) && (
                                                        <tr><td colSpan="5" className="py-6 text-center text-[10px] font-bold text-slate-300 italic">No batch history found for this item.</td></tr>
                                                      )}
                                                   </tbody>
                                                </table>
                                              </div>
                                           </div>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  )}
                                </AnimatePresence>
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      ))}
                      {paginatedStock.length === 0 && (
                        <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold italic">No inventory records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(filteredStock.length, stockPage, setStockPage)}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div 
              key="audit"
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">System Audit Logs</h2>
                  <p className="text-slate-500 font-medium">Track every movement across the platform.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button onClick={() => setLogTab('stock_in')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${logTab === 'stock_in' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Stock In</button>
                  <button onClick={() => setLogTab('stock_out')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${logTab === 'stock_out' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Stock Out</button>
                  <button onClick={() => setLogTab('bill_log')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${logTab === 'bill_log' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Bill Log</button>
                </div>
              </div>
              
              {logTab !== 'bill_log' ? (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {logTab === 'stock_in' ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600"><PlusCircle className="w-8 h-8" /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Total Restocked</p>
                          <p className="text-3xl font-black text-emerald-700">{filteredTransactions.reduce((s, t) => s + (t.quantity || 0), 0)}<span className="text-sm font-bold ml-1 opacity-50">Units</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600"><MinusCircle className="w-8 h-8" /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Total Consumption</p>
                          <p className="text-3xl font-black text-blue-700">{filteredTransactions.reduce((s, t) => s + (t.quantity || 0), 0)}<span className="text-sm font-bold ml-1 opacity-50">Units</span></p>
                        </div>
                      </div>
                    )}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600"><DollarSign className="w-8 h-8" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Log Segment Value</p>
                        <p className="text-3xl font-black text-indigo-700">Rs. {filteredTransactions.reduce((s, t) => s + (parseFloat(t.totalAmount) || 0), 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-end gap-6">
                    <div className="flex-1 min-w-[300px] space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search Logs</label>
                      <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search item, supplier or note..." value={transactionSearch} onChange={(e) => setTransactionSearch(e.target.value)}
                          className="bg-transparent text-sm font-bold outline-none w-full" />
                      </div>
                    </div>
                    
                    {logTab === 'stock_in' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Supplier</label>
                        <select value={transactionSupplierFilter} onChange={(e) => setTransactionSupplierFilter(e.target.value)}
                          className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold outline-none cursor-pointer min-w-[180px]">
                          <option value="ALL">All Suppliers</option>
                          <option value="NONE">No Supplier</option>
                          {supplierList.map(s => <option key={s.id} value={String(s.id)}>{s.companyName}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">From</label>
                      <input type="date" value={transactionDateFrom} onChange={(e) => setTransactionDateFrom(e.target.value)}
                        className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">To</label>
                      <input type="date" value={transactionDateTo} onChange={(e) => setTransactionDateTo(e.target.value)}
                        className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold outline-none" />
                    </div>
                    
                    <button onClick={exportInventoryAuditToPDF} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all">
                      <FileDown className="w-4 h-4" /> Export PDF
                    </button>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <colgroup>
                          <col style={{width: '130px'}} />
                          <col />
                          <col style={{width: '120px'}} />
                          {logTab === "stock_out" && <col style={{width: '120px'}} />}
                          <col style={{width: '90px'}} />
                          <col style={{width: '140px'}} />
                          <col style={{width: '180px'}} />
                          <col style={{width: '120px'}} />
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                            <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Specification</th>
                            <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                             {logTab === "stock_out" && <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Status</th>}
                            <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                            <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                            <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity/Supplier</th>
                            <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {paginatedTransactions.map((tx) => {
                            const linkedJob = tx.jobId ? jobList.find(j => j.id == tx.jobId) : null;
                            const jobStatus = linkedJob?.status || null;
                            const isCancelled = jobStatus === 'CANCELLED';
                            return (
                            <React.Fragment key={tx.id}>
                              <tr className={`hover:bg-slate-50/50 transition-colors group ${
                                isCancelled ? 'bg-red-50/40 border-l-4 border-l-red-400' :
                                tx.isGroup ? 'bg-blue-50/20' : ''
                              }`}>
                                <td className="px-4 py-3.5">
                                  <p className={`text-sm font-black ${isCancelled ? 'text-red-400 line-through' : 'text-slate-900'}`}>{new Date(tx.timestamp).toLocaleDateString()}</p>
                                  <p className="text-[10px] font-bold text-slate-400">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                                </td>
                                <td className="px-4 py-3.5">
                                  {tx.isGroup ? (
                                    <div className="flex flex-col gap-2">
                                      <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCancelled ? 'text-red-400' : 'text-slate-400'}`}>Services Performed</p>
                                        <div className="flex flex-wrap gap-1">
                                          {((tx.services && tx.services.length > 0) || (linkedJob?.services && linkedJob.services.length > 0)) ? 
                                            (tx.services?.length > 0 ? tx.services : linkedJob.services).map((svc, idx) => (
                                              <span key={idx} className="text-[9px] font-bold bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded text-amber-600">
                                                {svc.serviceName}
                                              </span>
                                            )) : <span className="text-[9px] font-bold text-slate-300 italic">No services listed</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCancelled ? 'text-red-400' : 'text-slate-400'}`}>Inventory Parts ({tx.items.length})</p>
                                        <div className="flex flex-wrap gap-1">
                                          {tx.items.slice(0, 5).map((it, idx) => (
                                            <span key={idx} className="text-[9px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                                              {it.stockItem?.name}
                                            </span>
                                          ))}
                                          {tx.items.length > 5 && <span className="text-[9px] font-black text-blue-400">+{tx.items.length - 5} more</span>}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className={`text-sm font-black ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{tx.stockItem?.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400">#{tx.stockItem?.partNumber}</p>
                                    </>
                                  )}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                                    tx.transactionType === 'ADD' ? 'bg-emerald-50 text-emerald-600' : 
                                    tx.transactionType === 'RESTORE' ? 'bg-amber-50 text-amber-600' :
                                    tx.isGroup ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    {tx.isGroup ? 'JOB BATCH' : tx.transactionType === 'ADD' ? 'STOCK IN' : tx.transactionType === 'RESTORE' ? 'RESTORED' : 'STOCK OUT'}
                                  </span>
                                </td>
                                {logTab === "stock_out" && (
                                  <td className="px-4 py-3.5 whitespace-nowrap">
                                    {jobStatus ? (
                                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                                        jobStatus === 'CANCELLED' ? 'bg-red-700 text-white shadow-lg ring-2 ring-red-100' :
                                        jobStatus === 'PAID'  ? 'bg-emerald-50 text-emerald-600' :
                                                             'bg-slate-100 text-slate-500'
                                      }`}>
                                        {jobStatus === 'CANCELLED' ? '⚠ CANCELLED' : jobStatus}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-300 font-bold">—</span>
                                    )}
                                  </td>
                                )}
                                <td className="px-4 py-3.5 text-right font-black text-slate-900 whitespace-nowrap">
                                  {tx.transactionType === 'ADD' || tx.transactionType === 'RESTORE' ? '+' : '-'}{tx.quantity}
                                </td>
                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                  <p className={`text-sm font-black ${isCancelled ? 'text-red-600 font-black' : 'text-slate-900'}`}>Rs. {tx.totalAmount.toLocaleString()}</p>
                                  {!tx.isGroup && <p className="text-[10px] text-slate-400 font-bold">@ Rs. {parseFloat(tx.unitPrice || 0).toLocaleString()}</p>}
                                </td>
                                <td className="px-4 py-3.5">
                                  <p className="text-xs font-black text-slate-600">{tx.isGroup ? `JOB #${tx.jobId}` : (tx.supplier?.companyName || 'INTERNAL')}</p>
                                  <p className="text-[10px] font-medium text-slate-400 italic max-w-[200px] truncate">{tx.note || '-'}</p>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex flex-col gap-0.5">
                                    {(tx.performedBy || 'System').split(' ').map((word, idx) => (
                                      <span key={idx} className="inline-block px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest w-fit">
                                        {word}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                              {tx.isGroup && (
                                <tr>
                                  <td colSpan={logTab === "stock_out" ? 8 : 7} className="px-4 pb-4">
                                    <div className={`border rounded-2xl p-4 ml-8 space-y-2 ${
                                      isCancelled ? 'bg-red-50/50 border-red-100' : 'bg-white/50 border-slate-100'
                                    }`}>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Itemized Breakdown</p>
                                      {tx.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px]">
                                          <span className={`font-bold ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{it.stockItem?.name} (x{it.quantity})</span>
                                          <span className="font-black text-slate-400">Rs. {it.totalAmount.toLocaleString()}</span>
                                           </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {renderPagination(filteredTransactions.length, txPage, setTxPage)}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Sales & Billing Log</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Comprehensive Transaction History</p>
                      </div>
                      <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                        <History className="w-4 h-4" /> LIVE AUDIT
                      </div>
                    </div>
                    <div className="overflow-x-auto hidden md:block">
                      <table className="w-full text-left">
                        <colgroup>
                          <col style={{width: '120px'}} />
                          <col style={{width: '130px'}} />
                          <col style={{width: '110px'}} />
                          <col />
                          <col style={{width: '100px'}} />
                          <col style={{width: '140px'}} />
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date / Time</th>
                            <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                            <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Report</th>
                            <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {paginatedJobLogs.map((log) => {
                            const linkedJob = log.jobId ? jobList.find(j => j.id == log.jobId) : null;
                            const jobStatus = linkedJob?.status || (log.action === 'JOB_CANCELLED' ? 'CANCELLED' : log.action === 'JOB_PAID' ? 'PAID' : null);
                            const isCancelled = jobStatus === 'CANCELLED';
                            return (
                            <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors text-sm ${
                              isCancelled ? 'bg-red-50/40 border-l-4 border-l-red-400' : ''
                            }`}>
                              {/* Date / Time */}
                              <td className="px-4 py-3.5 align-top">
                                <p className={`text-xs font-black leading-tight ${isCancelled ? 'text-red-400' : 'text-slate-900'}`}>{new Date(log.timestamp).toLocaleDateString()}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                              </td>
                              {/* Action */}
                              <td className="px-4 py-3.5 align-top">
                                <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                                  log.action === 'DELETED' ? 'bg-red-50 text-red-600' :
                                  log.action === 'STOCK_OUT' ? 'bg-blue-600 text-white' :
                                  log.action === 'JOB_PAID' ? 'bg-emerald-600 text-white' :
                                  log.action === 'JOB_CANCELLED' ? 'bg-red-600 text-white' :
                                  log.action === 'STATUS_CHANGED' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                              </td>
                              {/* Job Status */}
                              <td className="px-4 py-3.5 align-top whitespace-nowrap">
                                {jobStatus ? (
                                  <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    jobStatus === 'CANCELLED' ? 'bg-red-700 text-white' :
                                    jobStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {jobStatus === 'CANCELLED' ? '⚠ CANCELLED' : jobStatus}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-300 font-bold">—</span>
                                )}
                              </td>
                              {/* Details */}
                              <td className="px-4 py-3.5 align-top">
                                <p className={`text-[11px] font-bold whitespace-pre-wrap leading-relaxed ${isCancelled ? 'text-red-400' : 'text-slate-600'}`}>
                                  <span className="text-blue-600 font-black">Bill #{log.jobId}: </span>
                                  {log.details}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Customer: <span className="text-slate-600 normal-case font-bold">{log.customerName}</span></p>
                              </td>
                              {/* Report */}
                              <td className="px-4 py-3.5 align-top">
                                {jobStatus === 'PAID' && (
                                  <button
                                    onClick={() => generateCustomerReport(log)}
                                    title={`Generate report for ${log.customerName}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-blue-100 hover:border-blue-600"
                                  >
                                    <FileDown className="w-3 h-3" /> PDF
                                  </button>
                                )}
                              </td>
                              {/* By */}
                              <td className="px-4 py-3.5 align-top">
                                <div className="flex flex-col gap-0.5">
                                  {(log.performedBy || 'System').split(' ').map((word, idx) => (
                                    <span key={idx} className="inline-block px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest w-fit">
                                      {word}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="block md:hidden p-4 space-y-4 bg-slate-50/30">
                      {paginatedJobLogs.map((log) => {
                        const linkedJob = log.jobId ? jobList.find(j => j.id == log.jobId) : null;
                        const jobStatus = linkedJob?.status || (log.action === 'JOB_CANCELLED' ? 'CANCELLED' : log.action === 'JOB_PAID' ? 'PAID' : null);
                        const isCancelled = jobStatus === 'CANCELLED';
                        return (
                          <div key={log.id} className={`p-4 space-y-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                            isCancelled ? 'bg-red-50/40 border-l-4 border-l-red-400' : ''
                          }`}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className={`text-xs font-black leading-tight ${isCancelled ? 'text-red-400' : 'text-slate-900'}`}>{new Date(log.timestamp).toLocaleDateString()}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                                  log.action === 'DELETED' ? 'bg-red-50 text-red-600' :
                                  log.action === 'STOCK_OUT' ? 'bg-blue-600 text-white' :
                                  log.action === 'JOB_PAID' ? 'bg-emerald-600 text-white' :
                                  log.action === 'JOB_CANCELLED' ? 'bg-red-600 text-white' :
                                  log.action === 'STATUS_CHANGED' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                                {jobStatus && (
                                  <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    jobStatus === 'CANCELLED' ? 'bg-red-700 text-white' :
                                    jobStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {jobStatus === 'CANCELLED' ? '⚠ CANCELLED' : jobStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100 space-y-1">
                              <p className={`text-[11px] font-bold whitespace-pre-wrap leading-relaxed ${isCancelled ? 'text-red-400' : 'text-slate-600'}`}>
                                <span className="text-blue-600 font-black">Bill #{log.jobId}: </span>
                                {log.details}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Customer: <span className="text-slate-600 normal-case font-bold">{log.customerName}</span></p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 border-t border-slate-50 gap-2">
                              <span className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                By {log.performedBy}
                              </span>
                              {jobStatus === 'PAID' && (
                                <button
                                  onClick={() => generateCustomerReport(log)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-blue-100"
                                >
                                  <FileDown className="w-3 h-3" /> PDF
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {renderPagination(jobLogs.length, jobLogPage, setJobLogPage)}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'services' && null}

          {activeTab === 'work' && (
            <motion.div 
              key="work"
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Bill Management</h2>
                  <p className="text-slate-500 font-medium">Create and track customer bills, inventory sales, and status.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-1.5 mr-1">
                    <button 
                      onClick={() => setJobDateFilter(new Date().toISOString().split('T')[0])}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        jobDateFilter === new Date().toISOString().split('T')[0] 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => setJobDateFilter('')}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        jobDateFilter === '' 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      All
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm w-full sm:w-auto">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input 
                      type={jobDateFilter ? "date" : "text"}
                      placeholder="Select Date"
                      onFocus={(e) => e.target.type = 'date'}
                      onBlur={(e) => { if (!jobDateFilter) e.target.type = 'text'; }}
                      value={jobDateFilter} 
                      onChange={(e) => setJobDateFilter(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none text-slate-600 cursor-pointer w-full" />
                    {jobDateFilter && (
                      <button onClick={() => setJobDateFilter('')} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search Bill # or Customer..." value={jobSearch} onChange={(e) => setJobSearch(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none placeholder:text-slate-500 w-full" />
                  </div>
                  <button onClick={() => {
                    const now = getLocalISOString();
                    setAddJobData({ ...initialJobData, startTime: now, endTime: now });
                    setShowAddJobModal(true);
                  }} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    <span>Create New Bill</span>
                  </button>
                </div>
              </div>

              {/* Work Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {workStats.map((stat, i) => (
                  <button key={i} onClick={() => setJobStatusFilter(stat.id)} className={`p-5 rounded-2xl border transition-all flex items-center gap-3 text-left ${jobStatusFilter === stat.id ? 'bg-blue-600 border-blue-600 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:border-blue-200'}`}>
                    <div className={`w-10 h-10 rounded-xl ${jobStatusFilter === stat.id ? 'bg-white/20 text-white' : `${stat.bg} ${stat.color}`} flex items-center justify-center flex-shrink-0`}><stat.icon className="w-5 h-5" /></div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${jobStatusFilter === stat.id ? 'text-blue-100' : 'text-slate-400'}`}>{stat.label}</p>
                      <p className={`text-xl font-black leading-none mt-1 ${jobStatusFilter === stat.id ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['ALL', 'WAITING', 'PAID', 'CANCELLED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setJobStatusFilter(status)}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      jobStatusFilter === status 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Bills List */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {paginatedJobs.length === 0 ? (
                  <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4"><Briefcase className="w-10 h-10 text-slate-200" /></div>
                    <p className="text-slate-400 font-bold">{jobList.length === 0 ? "No active jobs found." : "No jobs match your search/filter."}</p>
                    <button onClick={() => setShowAddJobModal(true)} className="mt-4 text-blue-600 font-black text-sm hover:underline">Assign a new job</button>
                  </div>
                ) : (
                  paginatedJobs.map(job => (
                    <div key={job.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                      {/* Bill ID Badge */}
                      <div className="absolute top-0 right-0 p-1">
                        <div className="bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl rounded-tr-xl tracking-[0.2em] uppercase">
                          SALE-{job.id}
                        </div>
                      </div>

                      <div className="p-7">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${
                              job.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 
                              job.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 
                              'bg-blue-50 text-blue-600 shadow-sm'
                            }`}>
                              <Receipt className="w-8 h-8" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-slate-900 tracking-tight">{`Bill #${job.id}`}</h4>
                                <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-widest">BILL</span>
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                <User className="w-3 h-3 text-slate-300" />
                                {job.customer?.firstName} {job.customer?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 pr-8">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                               job.status === 'PAID' ? 'bg-emerald-600 text-white' : 
                               job.status === 'CANCELLED' ? 'bg-red-600 text-white' : 
                               'bg-amber-400 text-white'
                             }`}>
                              {job.status}
                            </span>
                            <div className="flex gap-2">
                              <button onClick={() => openEditJob(job)} className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-100 shadow-sm" title="Edit Bill">
                                <Pencil className="w-4 h-4" />
                              </button>
                              {job.status === 'WAITING' && (
                                <button onClick={() => handleUpdateJobStatus(job.id, 'PAID')} className="bg-emerald-50 text-emerald-600 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-2xl p-5 mb-6 border border-slate-50">
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Tag className="w-3 h-3" /> Sales Breakdown
                            </p>
                            <div className="flex flex-col gap-2">
                              {job.items?.map(i => (
                                <div key={i.id} className="flex justify-between items-center group/item">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <span className="text-xs font-black text-slate-700">{i.itemName}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded">x{i.quantity}</span>
                                </div>
                              ))}
                              {job.items?.length === 0 && <span className="text-[10px] font-bold text-slate-300 italic">No parts added</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-6">
                             <div className="group/time cursor-help">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover/time:text-blue-500 transition-colors">Date Issued</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-xs font-black text-slate-600">{new Date(job.startTime).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-xs font-bold text-slate-500">{new Date(job.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-2xl font-black text-blue-600 tracking-tighter drop-shadow-sm">Rs. {(job.totalAmount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {renderPagination(filteredJobs.length, jobPage, setJobPage)}
            </motion.div>
          )}


          </AnimatePresence>
        </div>
      </main>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {showEditStaff && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditStaff(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            >
              {/* Modal Header */}
              <div className="bg-blue-600 p-5 sm:p-7 rounded-t-[2rem] sm:rounded-t-[2rem] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Edit Team Member</h3>
                    <p className="text-blue-100 text-xs font-medium">Update profile & credentials</p>
                  </div>
                </div>
                <button onClick={() => setShowEditStaff(false)}
                  className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleUpdateStaff} className="p-5 sm:p-7 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">First Name</label>
                      <input type="text" name="firstName" value={editStaffData.firstName} onChange={handleEditStaffChange} required
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Last Name</label>
                      <input type="text" name="lastName" value={editStaffData.lastName} onChange={handleEditStaffChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</label>
                    <input type="email" name="email" value={editStaffData.email} onChange={handleEditStaffChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Phone</label>
                      <input type="text" name="phone" value={editStaffData.phone} onChange={handleEditStaffChange} maxLength="10"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">NIC / ID No.</label>
                      <input type="text" name="idNo" value={editStaffData.idNo} onChange={handleEditStaffChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">New Password <span className="normal-case text-slate-300">(leave blank to keep)</span></label>
                    <input type="password" name="password" value={editStaffData.password} onChange={handleEditStaffChange} placeholder="Leave blank to keep"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Address</label>
                    <input type="text" name="address" value={editStaffData.address} onChange={handleEditStaffChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div>
                      <p className="font-black text-slate-900 text-sm">Account Status</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Active / Inactive</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="staffEnabled" name="enabled" checked={editStaffData.enabled} onChange={handleEditStaffChange} className="sr-only peer" />
                      <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  {updateMsg.text && (
                    <div className={`p-3 rounded-xl text-sm font-bold text-center ${
                      updateMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>{updateMsg.text}</div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Save Changes</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Edit Customer Modal */}
      <AnimatePresence>
        {showEditCustomer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditCustomer(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            >
              {/* Modal Header */}
              <div className="bg-indigo-600 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Edit Customer</h3>
                    <p className="text-indigo-100 text-xs font-medium">Update profile & account settings</p>
                  </div>
                </div>
                <button onClick={() => setShowEditCustomer(false)}
                  className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleUpdateCustomer} className="p-5 sm:p-7 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">First Name</label>
                      <input type="text" name="firstName" value={editCustomerData.firstName} onChange={handleEditCustomerChange} required
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Last Name</label>
                      <input type="text" name="lastName" value={editCustomerData.lastName} onChange={handleEditCustomerChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Phone</label>
                    <input type="text" name="phone" value={editCustomerData.phone} onChange={handleEditCustomerChange} maxLength="10"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Address</label>
                    <input type="text" name="address" value={editCustomerData.address} onChange={handleEditCustomerChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">New Password <span className="normal-case text-slate-300">(leave blank to keep)</span></label>
                    <input type="password" name="password" value={editCustomerData.password} onChange={handleEditCustomerChange} placeholder="Leave blank to keep"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all" />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div>
                      <p className="font-black text-slate-900 text-sm">Account Status</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Active / Inactive</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="customerEnabled" name="enabled" checked={editCustomerData.enabled} onChange={handleEditCustomerChange} className="sr-only peer" />
                      <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {updateMsg.text && (
                    <div className={`p-3 rounded-xl text-sm font-bold text-center ${
                      updateMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>{updateMsg.text}</div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Save Changes</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {showAddStockModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddStockModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            >
              <div className="bg-slate-900 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Add Inventory Item</h3>
                    <p className="text-slate-400 text-xs font-medium">Register new stock entries</p>
                  </div>
                </div>
                <button onClick={() => setShowAddStockModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleAddStock} className="p-5 sm:p-7 space-y-6">
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Part Specifications</h5>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Item Name</label>
                        <input type="text" name="name" required value={addStockData.name} onChange={handleAddStockChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" placeholder="e.g. Synthetic Motor Oil" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Part Number</label>
                          <input type="text" name="partNumber" required value={addStockData.partNumber} onChange={handleAddStockChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" placeholder="e.g. OIL-5W30" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">HS Code (Optional)</label>
                          <input type="text" name="hsCode" value={addStockData.hsCode || ''} onChange={handleAddStockChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" placeholder="HS-8409" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Settings */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Inventory Settings</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Category</label>
                        <div className="flex gap-2">
                          <select name="categoryId" value={addStockData.categoryId} onChange={handleAddStockChange}
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer">
                            <option value="">Select Category</option>
                            {categoryList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                          <button type="button" onClick={() => setShowAddCategoryModal(true)}
                            className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <PlusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Low Stock Alert</label>
                        <input type="number" name="lowStockThreshold" required value={addStockData.lowStockThreshold} onChange={handleAddStockChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                      </div>
                    </div>
                  </div>



                  {msg.text && (
                    <div className={`p-3 rounded-xl text-sm font-bold text-center ${
                      msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>{msg.text}</div>
                  )}

                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setShowAddStockModal(false)}
                      className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest">Discard</button>
                    <button type="submit" disabled={loading}
                      className="flex-[2] bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Save Inventory Item</span><CheckCircle2 className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Stock Modal */}
      <AnimatePresence>
        {showEditStockModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditStockModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            >
              <div className="bg-slate-900 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Edit Stock Item</h3>
                    <p className="text-slate-400 text-xs font-medium">Update item specifications</p>
                  </div>
                </div>
                <button onClick={() => setShowEditStockModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleUpdateStock} className="p-5 sm:p-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Item Name</label>
                    <input type="text" name="name" required value={editStockData.name} onChange={handleEditStockChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Part Number</label>
                      <input type="text" name="partNumber" required value={editStockData.partNumber} onChange={handleEditStockChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">HS Code</label>
                      <input type="text" name="hsCode" value={editStockData.hsCode || ''} onChange={handleEditStockChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" placeholder="Optional" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Low Stock Alert</label>
                      <input type="number" name="lowStockThreshold" required value={editStockData.lowStockThreshold} onChange={handleEditStockChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Category</label>
                    <div className="flex gap-2">
                      <select name="categoryId" value={editStockData.categoryId} onChange={handleEditStockChange}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer">
                        <option value="">Select Category</option>
                        {categoryList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowAddCategoryModal(true)}
                        className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">📍 Location</label>
                    <input type="text" name="location" value={editStockData.location || ''} onChange={handleEditStockChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" placeholder="e.g. Basement (2-Block)" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">📝 Remarks</label>
                    <input type="text" name="remarks" value={editStockData.remarks || ''} onChange={handleEditStockChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" placeholder="e.g. Diesel, Damaged, etc." />
                  </div>

                  {updateMsg.text && (
                    <div className={`p-3 rounded-xl text-sm font-bold text-center ${
                      updateMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>{updateMsg.text}</div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Save Changes</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Add Stock Modal */}
      <AnimatePresence>
        {showQuickAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQuickAddModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="bg-emerald-600 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Add Stock</h3>
                    <p className="text-emerald-100 text-xs font-medium">Restock existing parts</p>
                  </div>
                </div>
                <button onClick={() => setShowQuickAddModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7">
                <form onSubmit={handleQuickAddSubmit} className="space-y-4">
                  <div className="space-y-4">
                    {/* Item Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Select Item</label>
                      <select required value={quickAddData.itemId} onChange={(e) => setQuickAddData({...quickAddData, itemId: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all cursor-pointer">
                        <option value="" disabled>-- Choose an item --</option>
                        {stockList.map(item => <option key={item.id} value={item.id}>{item.name} ({item.partNumber})</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Order Qty</label>
                        <input type="number" required min="1" value={quickAddData.quantity} onChange={(e) => setQuickAddData({...quickAddData, quantity: e.target.value})}
                          className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-900 font-black text-sm outline-none focus:border-emerald-600 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Retail Price (Rs.)</label>
                        <input type="number" step="0.01" required value={quickAddData.sellingPrice || ''} onChange={(e) => setQuickAddData({...quickAddData, sellingPrice: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:border-slate-900 transition-all" placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier (Optional)</label>
                    <select value={quickAddData.supplierId || ''} onChange={(e) => setQuickAddData({...quickAddData, supplierId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all cursor-pointer">
                      <option value="">Current / Not Specified</option>
                      {supplierList.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                    </select>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowQuickAddModal(false)}
                      className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                    <button type="submit" disabled={loading}
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Add Stock</span><CheckCircle2 className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Reduce Stock Modal */}
      <AnimatePresence>
        {showQuickReduceModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQuickReduceModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="bg-rose-600 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Reduce Stock</h3>
                    <p className="text-rose-100 text-xs font-medium">FIFO deduction / Outflow</p>
                  </div>
                </div>
                <button onClick={() => setShowQuickReduceModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-7">
                <form onSubmit={handleQuickReduceSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Select Item</label>
                    <select required value={quickReduceData.itemId} onChange={(e) => setQuickReduceData({...quickReduceData, itemId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-rose-600/10 focus:border-rose-600 transition-all cursor-pointer">
                      <option value="" disabled>-- Choose an item --</option>
                      {stockList.map(item => <option key={item.id} value={item.id}>{item.name} ({item.partNumber}) - {item.quantity} In Stock</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Qty to Reduce</label>
                    <input type="number" required min="1" value={quickReduceData.quantity} onChange={(e) => setQuickReduceData({...quickReduceData, quantity: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-rose-600/10 focus:border-rose-600 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Reason / Note</label>
                    <input type="text" value={quickReduceData.reason} onChange={(e) => setQuickReduceData({...quickReduceData, reason: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-rose-600/10 focus:border-rose-600 transition-all" placeholder="e.g. Damaged, Manual Sale" />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowQuickReduceModal(false)}
                      className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                    <button type="submit" disabled={loading}
                      className="flex-[2] bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 text-sm">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Reduce Stock</span><CheckCircle2 className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Supplier Modal */}
      <AnimatePresence>
        {showAddSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddSupplierModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="bg-blue-600 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Add Supplier</h3>
                    <p className="text-blue-100 text-xs font-medium">Register new source</p>
                  </div>
                </div>
                <button onClick={() => setShowAddSupplierModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-7">
                <form onSubmit={handleAddSupplier} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Company Name</label>
                    <input type="text" name="companyName" required value={addSupplierData.companyName} onChange={handleAddSupplierChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Contact Person</label>
                    <input type="text" name="contactPerson" required value={addSupplierData.contactPerson} onChange={handleAddSupplierChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Email</label>
                      <input type="email" name="email" required value={addSupplierData.email} onChange={handleAddSupplierChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Phone</label>
                      <input type="text" name="phone" required value={addSupplierData.phone} onChange={handleAddSupplierChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Address</label>
                    <input type="text" name="address" value={addSupplierData.address} onChange={handleAddSupplierChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowAddSupplierModal(false)}
                      className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                    <button type="submit" disabled={loading}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Supplier'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Supplier Modal */}
      <AnimatePresence>
        {showEditSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditSupplierModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="bg-slate-900 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Edit Supplier</h3>
                    <p className="text-slate-400 text-xs font-medium">Modify partner details</p>
                  </div>
                </div>
                <button onClick={() => setShowEditSupplierModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-7">
                <form onSubmit={handleUpdateSupplier} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Company Name</label>
                    <input type="text" name="companyName" required value={editSupplierData.companyName} onChange={handleEditSupplierChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Contact Person</label>
                    <input type="text" name="contactPerson" required value={editSupplierData.contactPerson} onChange={handleEditSupplierChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Email</label>
                      <input type="email" name="email" required value={editSupplierData.email} onChange={handleEditSupplierChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Phone</label>
                      <input type="text" name="phone" required value={editSupplierData.phone} onChange={handleEditSupplierChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Address</label>
                    <input type="text" name="address" value={editSupplierData.address} onChange={handleEditSupplierChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="font-black text-slate-700 text-sm">Operational Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={editSupplierData.active} onChange={(e) => setEditSupplierData({...editSupplierData, active: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowEditSupplierModal(false)}
                      className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                    <button type="submit" disabled={loading}
                      className="flex-[2] bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Batch Details Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowBatchModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]"
            >
              <div className="bg-slate-900 p-5 sm:p-7 rounded-t-[2rem] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">{selectedItemName}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Inventory Batch History</p>
                </div>
                <button onClick={() => setShowBatchModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-5 sm:p-7 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {selectedItemBatches.map((batch, index) => (
                    <div key={batch.id || index} className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-xs">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">Rs. {batch.unitPrice.toFixed(2)}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Received: {new Date(batch.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">{batch.currentQuantity} <span className="text-[9px] text-slate-400 font-bold uppercase ml-1">Left</span></div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Initial: {batch.initialQuantity}</div>
                      </div>
                    </div>
                  ))}
                  {selectedItemBatches.length === 0 && (
                    <div className="py-16 text-center">
                      <History className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                      <p className="text-slate-400 font-bold text-sm">No batch history found.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddCategoryModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-sm bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="p-6 sm:p-7">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Categories</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organize Inventory</p>
                  </div>
                  <button onClick={() => setShowAddCategoryModal(false)}
                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Category Name</label>
                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all" placeholder="e.g. Engine Parts" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-3.5 rounded-xl transition-all shadow-lg text-sm">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add Category"}
                  </button>
                </form>
                <div className="mt-8 pt-6 border-t border-slate-50">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Existing</p>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {categoryList.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        {editingCategoryId === cat.id ? (
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            onBlur={() => handleUpdateCategory(cat.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateCategory(cat.id);
                              else if (e.key === 'Escape') setEditingCategoryId(null);
                            }}
                            className="bg-white px-2 py-0.5 text-[10px] font-black rounded border border-indigo-600 text-slate-900 outline-none uppercase w-full"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditingCategoryName(cat.name);
                            }}
                            className="text-slate-600 text-[10px] font-black uppercase cursor-pointer hover:text-indigo-600 flex-1 truncate"
                            title="Click to rename"
                          >
                            {cat.name}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="text-slate-400 hover:text-red-500 transition-all p-0.5 rounded shrink-0"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {categoryList.length === 0 && <p className="text-xs font-bold text-slate-300 py-2">No categories yet.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       <AnimatePresence>
        {showAddJobModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddJobModal(false)} />
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              className="relative z-10 w-full sm:max-w-4xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
              
              <div className="bg-slate-900 p-6 sm:p-8 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 shadow-inner">
                    <Car className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Creating Bill</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Retail Inventory & Sales</p>
                  </div>
                </div>
                <button onClick={() => setShowAddJobModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                <form id="job-card-form" onSubmit={handleAddJob} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Primary Details</h5>
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-1 mb-1.5 block">Select Customer</label>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                              {addJobData.customerId === '__walkin__' ? (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-black text-lg">🚶</div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900">Walk-in Customer</p>
                                         <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">No account linked</p>
                                      </div>
                                   </div>
                                   <button type="button" onClick={() => { setAddJobData({...addJobData, customerId: ''}); setCustomerSearchQuery(''); }} className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest">Change</button>
                                </div>
                              ) : addJobData.customerId ? (
                                <div className="bg-white border border-blue-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                                        {customerList.find(c => c.id === addJobData.customerId)?.firstName?.[0]}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900">{customerList.find(c => c.id === addJobData.customerId)?.firstName} {customerList.find(c => c.id === addJobData.customerId)?.lastName}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{customerList.find(c => c.id === addJobData.customerId)?.phone}</p>
                                      </div>
                                   </div>
                                   <button type="button" onClick={() => { setAddJobData({...addJobData, customerId: ''}); setCustomerSearchQuery(''); }} className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest">Change</button>
                                </div>
                              ) : (
                                <div className="relative" ref={customerDropdownRef}>
                                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-blue-600 transition-all">
                                    <Search className="w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Search customer by name or phone..." value={customerSearchQuery} 
                                      onChange={e => setCustomerSearchQuery(e.target.value)}
                                      onFocus={() => { if(!customerSearchQuery) setCustomerSearchQuery(' '); }}
                                      className="bg-transparent text-xs font-black text-slate-700 outline-none w-full" />
                                    <button type="button" onClick={() => setCustomerSearchQuery(customerSearchQuery.trim() === '' ? ' ' : '')} className="text-slate-400 hover:text-blue-600"><ChevronDown className={`w-4 h-4 transition-transform ${customerSearchQuery ? 'rotate-180' : ''}`} /></button>
                                  </div>

                                  {/* Customer Suggestions */}
                                  {customerSearchQuery !== undefined && (customerSearchQuery.length > 0 || customerSearchQuery === ' ') && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[120] max-h-56 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                      {/* Walk-in option always at top */}
                                      <button type="button"
                                        onClick={() => { setAddJobData({...addJobData, customerId: '__walkin__'}); setCustomerSearchQuery(''); }}
                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-3 group border-b border-slate-50 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-base">🚶</div>
                                        <div>
                                          <p className="text-xs font-black text-slate-700 group-hover:text-amber-700 transition-colors">Walk-in Customer</p>
                                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">No account</p>
                                        </div>
                                      </button>
                                      {/* Header */}
                                      {!customerSearchQuery.trim() && (
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1">⭐ Top Customers (5)</p>
                                      )}
                                      {filteredCustomerDropdown.map(c => (
                                        <button key={c.id} type="button" 
                                          onClick={() => {
                                            setAddJobData({...addJobData, customerId: c.id});
                                            setCustomerSearchQuery("");
                                          }}
                                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors flex justify-between items-center group">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">{c.firstName[0]}</div>
                                            <div>
                                              <p className="text-xs font-black text-slate-700 group-hover:text-blue-700 transition-colors">{c.firstName} {c.lastName}</p>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.phone}</p>
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Scheduling</h5>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-500">Current Date</p>
                          <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-500">Current Time</p>
                          <p className="text-sm font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </section>
                  </div>
                  
                  {/* Right Column: Services & Parts */}
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Billing</h5>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        
                        <div className="space-y-4">
                           <div className="relative mt-2" ref={partDropdownRef}>
                              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-emerald-600 transition-all">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Search inventory..." value={partSearchQuery} 
                                  onChange={e => setPartSearchQuery(e.target.value)}
                                  onFocus={() => { if(!partSearchQuery) setPartSearchQuery(' '); }}
                                  className="bg-transparent text-xs font-black text-slate-700 outline-none w-full" />
                                <button type="button" onClick={() => setPartSearchQuery(partSearchQuery ? '' : ' ')} className="text-slate-400 hover:text-emerald-600"><ChevronDown className={`w-4 h-4 transition-transform ${partSearchQuery ? 'rotate-180' : ''}`} /></button>
                              </div>

                              {/* Part Suggestions */}
                              {partSearchQuery !== undefined && (partSearchQuery.length > 0 || partSearchQuery === ' ') && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[120] max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                   {!partSearchQuery.trim() && (
                                     <div className="px-3 py-1.5 text-[9px] font-black uppercase text-amber-600 tracking-wider border-b border-slate-50 mb-1 flex items-center gap-1.5">
                                       <span>🔥</span> Top Selling Items (5)
                                     </div>
                                   )}
                                   {filteredPartDropdown.length === 0 ? (
                                     <div className="px-4 py-3 text-xs text-slate-400 text-center font-bold">No matching items</div>
                                   ) : (
                                     filteredPartDropdown.map(it => {
                                        const isOutOfStock = it.quantity < 1 || it.fifoQuantity < 1;
                                        return (
                                          <button key={it.id} type="button"
                                            onClick={() => {
                                              if (isOutOfStock) return;
                                              if (!addJobData.items.find(ji => ji.stockItemId === it.id)) {
                                                 const newItem = { stockItemId: it.id, quantity: 1, priceAtTime: it.unitPrice, name: it.name };
                                                 const newItems = [...addJobData.items, newItem];
                                                 const newIdx = newItems.length - 1;
                                                 setAddJobData({...addJobData, items: newItems});
                                                 updateItemFifoPrice(newIdx, 1, 'add', newItems);
                                              }
                                              setPartSearchQuery("");
                                            }}
                                            disabled={isOutOfStock}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center group transition-colors ${
                                              isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-emerald-50 cursor-pointer'
                                            }`}>
                                            <div>
                                              <p className={`text-xs font-black transition-colors ${isOutOfStock ? 'text-slate-400' : 'text-slate-700 group-hover:text-emerald-700'}`}>{it.name}</p>
                                              <p className={`text-[10px] font-bold uppercase tracking-tighter ${isOutOfStock ? 'text-slate-300' : 'text-slate-400'}`}>{it.partNumber} | {isOutOfStock ? 'OUT OF STOCK' : `${it.fifoQuantity} Avail.`}</p>
                                            </div>
                                            {!isOutOfStock && <span className="text-xs font-black text-emerald-600">Rs. {it.unitPrice}</span>}
                                          </button>
                                        );
                                     })
                                   )}
                                </div>
                              )}
                           </div>

                           <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-2 pt-2 border-t border-slate-100">
                                <Package className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-black text-slate-900 uppercase">Inventory / Parts Used</span>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                 {addJobData.items.map((item, idx) => (
                                   <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                     {/* Item row */}
                                     <div className="flex items-center gap-2 p-2">
                                       <span className="flex-1 text-[10px] font-bold text-slate-700 truncate">{item.name}</span>
                                       <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-1">
                                         <button type="button" onClick={() => {
                                           if (item.quantity > 1) updateItemFifoPrice(idx, item.quantity - 1, 'add');
                                         }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                                         <span className="text-[10px] font-black w-5 text-center">{item.quantity}</span>
                                         <button type="button" onClick={() => {
                                           const stockItem = stockList.find(s => s.id === item.stockItemId);
                                           if (stockItem && item.quantity >= stockItem.quantity) {
                                             setMsg({ type: 'error', text: `Insufficient stock! Only ${stockItem.quantity} available.` });
                                             return;
                                           }
                                           updateItemFifoPrice(idx, item.quantity + 1, 'add');
                                         }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-500"><Plus className="w-3 h-3" /></button>
                                       </div>
                                       <span className="text-[10px] font-black text-emerald-700 whitespace-nowrap">
                                         Rs. {((item.priceAtTime || 0) * (item.quantity || 1)).toLocaleString()}
                                       </span>
                                       <button type="button" onClick={() => {
                                         setAddJobData({...addJobData, items: addJobData.items.filter((_, i) => i !== idx)});
                                       }} className="w-6 h-6 text-slate-300 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                                     </div>
                                     {/* FIFO batch breakdown — shown when multiple batches are used */}
                                     {item.allocations && item.allocations.length > 1 && (
                                       <div className="mx-2 mb-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 space-y-1">
                                         <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                           <span>⚡</span> Price split across {item.allocations.length} stock batches
                                         </p>
                                         {item.allocations.map((alloc, ai) => (
                                           <div key={ai} className="flex justify-between items-center text-[10px]">
                                             <span className="text-slate-500 font-bold">
                                               {alloc.qty} unit{alloc.qty > 1 ? 's' : ''} @ Rs. {parseFloat(alloc.unitPrice).toLocaleString()}
                                             </span>
                                             <span className="font-black text-slate-700">
                                               Rs. {parseFloat(alloc.subtotal).toLocaleString()}
                                             </span>
                                           </div>
                                         ))}
                                       </div>
                                     )}
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      </div>
                      <div className="bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-600/20 text-white">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black uppercase tracking-widest opacity-80">Total Bill</span>
                            <span className="text-2xl font-black">Rs. {addJobData.items.reduce((acc, i) => acc + ((i.priceAtTime || 0) * (i.quantity || 1)), 0).toLocaleString()}</span>
                         </div>
                         <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            <div className="flex justify-between"><span>Items Total:</span><span>Rs. {addJobData.items.reduce((acc, i) => acc + ((i.priceAtTime || 0) * (i.quantity || 1)), 0).toLocaleString()}</span></div>
                         </div>
                      </div>
                    </section>
                  </div>
                </form>
                <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                  <button type="button" onClick={() => setShowAddJobModal(false)} className="flex-1 bg-white border border-slate-200 text-slate-500 font-black py-4 rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                  <button type="submit" form="job-card-form" disabled={loading} className="flex-[2] sm:px-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3">
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Make Bill</span><ClipboardCheck className="w-5 h-5" /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditJobModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditJobModal(false)} />
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              className="relative z-10 w-full sm:max-w-4xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
              
              <div className="bg-indigo-600 p-6 sm:p-8 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-200 shadow-inner">
                    <Pencil className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Edit Job Card</h3>
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">Modify Work Details</p>
                  </div>
                </div>
                <button onClick={() => setShowEditJobModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                <form id="edit-job-card-form" onSubmit={handleEditJob} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Core Info */}
                  <div className="space-y-6">
                    {updateMsg.text && (
                      <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-wider ${updateMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{updateMsg.text}</div>
                    )}
                    <section className="space-y-4">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Primary Details</h5>
                      <div className="space-y-4">


                        <div className="relative">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-1 mb-1.5 block">Select Customer</label>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                             {editJobData.customerId === '__walkin__' ? (
                               <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-black text-lg">🚶</div>
                                     <div>
                                        <p className="text-sm font-black text-slate-900">Walk-in Customer</p>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">No account linked</p>
                                     </div>
                                  </div>
                                  <button type="button" onClick={() => { setEditJobData({...editJobData, customerId: ''}); setCustomerSearchQuery(''); }} className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest">Change</button>
                               </div>
                             ) : editJobData.customerId ? (
                               <div className="bg-white border border-indigo-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                       {customerList.find(c => c.id === editJobData.customerId)?.firstName?.[0]}
                                     </div>
                                     <div>
                                        <p className="text-sm font-black text-slate-900">{customerList.find(c => c.id === editJobData.customerId)?.firstName} {customerList.find(c => c.id === editJobData.customerId)?.lastName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{customerList.find(c => c.id === editJobData.customerId)?.phone}</p>
                                     </div>
                                  </div>
                                  <button type="button" onClick={() => { setEditJobData({...editJobData, customerId: ''}); setCustomerSearchQuery(''); }} className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest">Change</button>
                               </div>
                              ) : (
                               <div className="relative" ref={customerDropdownRef}>
                                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-indigo-600 transition-all">
                                    <Search className="w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Search customer by name or phone..." value={customerSearchQuery} 
                                      onChange={e => setCustomerSearchQuery(e.target.value)}
                                      onFocus={() => { if(!customerSearchQuery) setCustomerSearchQuery(' '); }}
                                      className="bg-transparent text-xs font-black text-slate-700 outline-none w-full" />
                                    <button type="button" onClick={() => setCustomerSearchQuery(customerSearchQuery ? '' : ' ')} className="text-slate-400 hover:text-indigo-600"><ChevronDown className={`w-4 h-4 transition-transform ${customerSearchQuery ? 'rotate-180' : ''}`} /></button>
                                  </div>

                                  {/* Customer Suggestions */}
                                  {customerSearchQuery !== undefined && (customerSearchQuery.length > 0 || customerSearchQuery === ' ') && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[120] max-h-56 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                      {/* Walk-in option always at top */}
                                      <button type="button"
                                        onClick={() => { setEditJobData({...editJobData, customerId: '__walkin__'}); setCustomerSearchQuery(''); }}
                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-3 group border-b border-slate-50 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-base">🚶</div>
                                        <div>
                                          <p className="text-xs font-black text-slate-700 group-hover:text-amber-700 transition-colors">Walk-in Customer</p>
                                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">No account</p>
                                        </div>
                                      </button>
                                      {/* Header */}
                                      {!customerSearchQuery.trim() && (
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1">⭐ Top Customers (5)</p>
                                      )}
                                      {filteredCustomerDropdown.map(c => (
                                        <button key={c.id} type="button" 
                                          onClick={() => {
                                            setEditJobData({...editJobData, customerId: c.id});
                                            setCustomerSearchQuery("");
                                          }}
                                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors flex justify-between items-center group">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">{c.firstName[0]}</div>
                                            <div>
                                              <p className="text-xs font-black text-slate-700 group-hover:text-indigo-700 transition-colors">{c.firstName} {c.lastName}</p>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.phone}</p>
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                               </div>
                             )}
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-1 mb-1.5 block">Job Status</label>
                          <select value={editJobData.status} onChange={e => setEditJobData({...editJobData, status: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-900 outline-none focus:border-indigo-600 transition-all cursor-pointer">
                            <option value="WAITING">WAITING</option>
                            <option value="PAID">PAID</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>
                    </section>

                      <section className="space-y-4">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Scheduling</h5>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-500">Current Date</p>
                            <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-500">Current Time</p>
                            <p className="text-sm font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </section>
                  </div>

                  {/* Right Column: Services & Parts */}
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Billing</h5>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        
                            <div className="relative mt-2" ref={partDropdownRef}>
                               <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-indigo-600 transition-all">
                                 <Search className="w-4 h-4 text-slate-400" />
                                 <input type="text" placeholder="Search inventory..." value={partSearchQuery} 
                                   onChange={e => setPartSearchQuery(e.target.value)}
                                   onFocus={() => { if(!partSearchQuery) setPartSearchQuery(' '); }}
                                   className="bg-transparent text-xs font-black text-slate-700 outline-none w-full" />
                                 <button type="button" onClick={() => setPartSearchQuery(partSearchQuery ? '' : ' ')} className="text-slate-400 hover:text-indigo-600"><ChevronDown className={`w-4 h-4 transition-transform ${partSearchQuery ? 'rotate-180' : ''}`} /></button>
                               </div>

                               {/* Part Suggestions */}
                               {partSearchQuery !== undefined && (partSearchQuery.length > 0 || partSearchQuery === ' ') && (
                                 <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[120] max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {!partSearchQuery.trim() && (
                                      <div className="px-3 py-1.5 text-[9px] font-black uppercase text-amber-600 tracking-wider border-b border-slate-50 mb-1 flex items-center gap-1.5">
                                        <span>🔥</span> Top Selling Items (5)
                                      </div>
                                    )}
                                    {filteredPartDropdown.length === 0 ? (
                                      <div className="px-4 py-3 text-xs text-slate-400 text-center font-bold">No matching items</div>
                                    ) : (
                                      filteredPartDropdown.map(it => {
                                         const isOutOfStock = it.quantity < 1 || it.fifoQuantity < 1;
                                         return (
                                         <button key={it.id} type="button"
                                           onClick={() => {
                                             if (isOutOfStock) return;
                                             if (!editJobData.items.find(ji => ji.stockItemId === it.id)) {
                                                setEditJobData({...editJobData, items: [...editJobData.items, { stockItemId: it.id, quantity: 1, priceAtTime: it.unitPrice, name: it.name }]});
                                             }
                                             setPartSearchQuery("");
                                           }}
                                           disabled={isOutOfStock}
                                           className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center group transition-colors ${
                                             isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-indigo-50 cursor-pointer'
                                           }`}>
                                           <div>
                                             <p className={`text-xs font-black transition-colors ${isOutOfStock ? 'text-slate-400' : 'text-slate-700 group-hover:text-indigo-700'}`}>{it.name}</p>
                                             <div className="flex items-center gap-2 mt-0.5">
                                               <p className={`text-[9px] font-black uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 ${isOutOfStock ? 'text-slate-300' : 'text-slate-400'}`}>{it.partNumber}</p>
                                               <p className={`text-[10px] font-black ${isOutOfStock ? 'text-red-400' : 'text-indigo-600'}`}>
                                                 {isOutOfStock ? 'OUT OF STOCK' : `${it.fifoQuantity} Avail @ Rs. ${parseFloat(it.unitPrice || 0).toLocaleString()}`}
                                               </p>
                                             </div>
                                           </div>
                                           {!isOutOfStock && <span className="text-xs font-black text-indigo-600">Rs. {it.unitPrice}</span>}
                                         </button>
                                       );
                                      })
                                    )}
                                 </div>
                               )}
                            </div>

                            <div className="space-y-2">
                               <div className="flex items-center gap-2 mb-2 pt-2 border-t border-slate-100">
                                 <Package className="w-4 h-4 text-emerald-600" />
                                 <span className="text-xs font-black text-slate-900 uppercase">Inventory / Parts Used</span>
                               </div>
                               <div className="grid grid-cols-1 gap-2">
                                  {editJobData.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                      <span className="flex-1 text-[10px] font-bold text-slate-700 truncate">{item.name}</span>
                                      <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-1">
                                        <button type="button" onClick={() => {
                                          const newItems = [...editJobData.items];
                                          if (newItems[idx].quantity > 1) {
                                            newItems[idx].quantity -= 1;
                                            setEditJobData({...editJobData, items: newItems});
                                          }
                                        }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                                        <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                                        <button type="button" onClick={() => {
                                          const stockItem = stockList.find(s => s.id === item.stockItemId);
                                          if (stockItem && item.quantity >= stockItem.quantity) {
                                            setMsg({ type: 'error', text: `Insufficient stock! Only ${stockItem.quantity} available.` });
                                            return;
                                          }
                                          const newItems = [...editJobData.items];
                                          newItems[idx].quantity += 1;
                                          setEditJobData({...editJobData, items: newItems});
                                        }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-500"><Plus className="w-3 h-3" /></button>
                                      </div>
                                      <button type="button" onClick={() => {
                                        setEditJobData({...editJobData, items: editJobData.items.filter((_, i) => i !== idx)});
                                      }} className="w-6 h-6 text-slate-300 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-600/20 text-white">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black uppercase tracking-widest opacity-80">Total Bill</span>
                            <span className="text-2xl font-black">Rs. {editJobData.items.reduce((acc, i) => acc + ((i.priceAtTime || 0) * (i.quantity || 1)), 0).toLocaleString()}</span>
                         </div>
                         <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            <div className="flex justify-between"><span>Items Total:</span><span>Rs. {editJobData.items.reduce((acc, i) => acc + ((i.priceAtTime || 0) * (i.quantity || 1)), 0).toLocaleString()}</span></div>
                         </div>
                      </div>
                    </section>
                  </div>
                </form>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                <button type="button" onClick={() => setShowEditJobModal(false)} className="flex-1 bg-white border border-slate-200 text-slate-500 font-black py-4 rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                <button type="submit" form="edit-job-card-form" disabled={loading} className="flex-[2] sm:px-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Update Job Card</span><CheckCircle2 className="w-5 h-5" /></>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Batch Details View Modal */}
      <AnimatePresence>
        {selectedBatchDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setSelectedBatchDetail(null)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <Package className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white uppercase">Batch Financial Ledger</h3>
                    <p className="text-slate-300 text-xs font-semibold">Detailed breakdown of FIFO stock batch</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBatchDetail(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6">
                
                {/* Section 1: Core Specifications */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Batch Specifications</h4>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Part Item</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{selectedBatchDetail.stockItem?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Part Number</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{selectedBatchDetail.stockItem?.partNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Supplier</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{selectedBatchDetail.supplier?.companyName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HS Code</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{selectedBatchDetail.hsCode || selectedBatchDetail.stockItem?.hsCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Created Date</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">
                        {new Date(selectedBatchDetail.createdAt).toLocaleDateString()} at {new Date(selectedBatchDetail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Batch Inventory</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">
                        {selectedBatchDetail.currentQuantity} / {selectedBatchDetail.initialQuantity} Units
                      </p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200/50">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Retail Price (LKR)</p>
                      <p className="text-lg font-black text-blue-600 mt-0.5">
                        Rs. {parseFloat(selectedBatchDetail.sellingPrice || selectedBatchDetail.unitPrice || 0).toLocaleString([], {minimumFractionDigits: 2})}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setSelectedBatchDetail(null)}
                  className="w-full px-5 py-4 rounded-2xl font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-xs uppercase tracking-widest"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ===== CUSTOM DIALOG MODAL ===== */}
      <AnimatePresence>
        {dialogState && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{backdropFilter:'blur(8px)', backgroundColor:'rgba(15,23,42,0.55)'}}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              {/* Top accent bar */}
              <div className={`h-1.5 w-full ${
                dialogState.variant === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                dialogState.variant === 'warning' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                dialogState.variant === 'success' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`} />

              <div className="p-8">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    dialogState.variant === 'danger' ? 'bg-red-50 text-red-500' :
                    dialogState.variant === 'warning' ? 'bg-amber-50 text-amber-500' :
                    dialogState.variant === 'success' ? 'bg-emerald-50 text-emerald-500' :
                    'bg-blue-50 text-blue-500'
                  }`}>
                    {dialogState.variant === 'danger' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    ) : dialogState.variant === 'warning' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    ) : dialogState.variant === 'success' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{dialogState.title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{dialogState.message}</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  {dialogState.type === 'confirm' && (
                    <button
                      onClick={handleDialogCancel}
                      className="flex-1 px-5 py-3 rounded-xl font-black text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest"
                    >
                      {dialogState.cancelText}
                    </button>
                  )}
                  <button
                    onClick={handleDialogConfirm}
                    className={`flex-1 px-5 py-3 rounded-xl font-black text-sm text-white transition-all uppercase tracking-widest shadow-lg ${
                      dialogState.variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' :
                      dialogState.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' :
                      dialogState.variant === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' :
                      'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                    }`}
                  >
                    {dialogState.type === 'confirm' ? dialogState.confirmText : 'OK'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
