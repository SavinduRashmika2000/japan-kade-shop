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

const getLocalISOString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
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

  // Real-time automatic landed cost calculation
  useEffect(() => {
    const foreign = parseFloat(quickAddData.unitCostForeign) || 0;
    const rate = parseFloat(quickAddData.exchangeRate) || 0;
    const qty = parseFloat(quickAddData.quantity) > 0 ? parseFloat(quickAddData.quantity) : 1;
    const freight = parseFloat(quickAddData.freightCost) || 0;
    const shipping = parseFloat(quickAddData.shippingCost) || 0;
    const bank = parseFloat(quickAddData.bankCharges) || 0;
    const duty = parseFloat(quickAddData.dutyFees) || 0;

    const totalLkr = foreign * rate * qty;
    const productLanded = (totalLkr + duty + freight + shipping + bank) / qty;
    const landedStr = productLanded.toFixed(2);

    if (quickAddData.landedCost !== landedStr) {
      setQuickAddData(prev => ({
        ...prev,
        landedCost: landedStr,
        unitPrice: landedStr
      }));
    }
  }, [
    quickAddData.unitCostForeign,
    quickAddData.exchangeRate,
    quickAddData.quantity,
    quickAddData.freightCost,
    quickAddData.shippingCost,
    quickAddData.bankCharges,
    quickAddData.dutyFees
  ]);
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
      doc.text("MIND SPARE PARTS MANAGEMENT", 14, 20);
      
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
    doc.text('MIND SPARE PARTS', pageW / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Genuine Spare Parts & Solutions', pageW / 2, 26, { align: 'center' });
    doc.text('123 Auto Lane, Colombo 07  |  Tel: +94 11 234 5678', pageW / 2, 32, { align: 'center' });
    doc.text('info@mindspareparts.lk  |  www.mindspareparts.lk', pageW / 2, 37, { align: 'center' });

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
    doc.text('CUSTOMER DETAILS', 14, startY);
    doc.text('JOB INFORMATION', pageW / 2, startY);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, startY + 2, 90, startY + 2);
    doc.line(pageW / 2, startY + 2, pageW - 14, startY + 2);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${log.customerName || 'N/A'}`, 14, startY + 8);
    doc.text(`Phone: ${job?.customer?.phone || 'N/A'}`, 14, startY + 14);
    doc.text(`Bill #: ${log.jobId || log.id || 'N/A'}`, 14, startY + 20);

    doc.text(`Job Reference: #${log.jobId || 'N/A'}`, pageW / 2, startY + 8);
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
    doc.text('Thank you for choosing Mind Spare Parts. Drive safe!', pageW / 2, footerY, { align: 'center' });
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
  const [showMonthlySalesModal, setShowMonthlySalesModal] = useState(false);
  const [selectedMonthlySalesItem, setSelectedMonthlySalesItem] = useState(null);
  // Stale-data tracking: only re-fetch if data is older than 30s on tab switch
  const lastFetchedRef = React.useRef({});
  const [staffSearch, setStaffSearch] = useState('');

  // Job Card / Work Management State
  const [jobList, setJobList] = useState([]);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');
  const initialJobData = {
    customerId: '',
    vehicleNumber: '',
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
      setMsg({ type: 'error', text: 'Phone number must be exactly 10 digits.' });
      return;
    }
    setLoading(true);
    try {
      await staffService.createStaff(formData);
      const roleName = formData.role === 'ADMIN' ? 'Admin' : 'Staff';
      setMsg({ type: 'success', text: `${roleName} added successfully!` });
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', idNo: '', username: '', address: '', role: 'STAFF' });
      fetchStaff(); // Refresh list after adding
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add staff.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (customerFormData.phone.length !== 10) {
      setMsg({ type: 'error', text: 'Phone number must be exactly 10 digits.' });
      return;
    }
    setLoading(true);
    try {
      await authService.signup(customerFormData);
      setMsg({ type: 'success', text: 'Customer added successfully!' });
      setCustomerFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', address: '', idNo: '' });
      fetchCustomers();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add customer.' });
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
    if (activeTab === 'finance') {
      const initFinanceData = async () => {
        if (!lastFetchedRef.current.jobs || now - lastFetchedRef.current.jobs > STALE_MS) {
          await fetchJobs();
        }
        let currentStockList = stockList;
        if (!stockList || stockList.length === 0) {
          try {
            const res = await stockService.getAllStockItems();
            currentStockList = res.data;
            setStockList(res.data);
          } catch (err) {
            console.error("Failed to load stock list for finance", err);
          }
        }
        const updatedBatches = {};
        await Promise.all((currentStockList || []).map(async (item) => {
          if (!rowBatches[item.id]) {
            try {
              const bRes = await stockService.getBatches(item.id);
              updatedBatches[item.id] = bRes.data;
            } catch (err) {
              console.error(`Failed to load batches for item ${item.id}`, err);
            }
          }
        }));
        if (Object.keys(updatedBatches).length > 0) {
          setRowBatches(prev => ({ ...prev, ...updatedBatches }));
        }
      };
      initFinanceData();
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
      // Format data for backend
      const payload = {
        vehicleNumber: addJobData.vehicleNumber || '',
        customer: { id: addJobData.customerId },
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
      setMsg({ type: 'success', text: 'Bill Created Successfully!' });
      setAddJobData(initialJobData);
      setShowAddJobModal(false);
      fetchJobs();
      fetchStock(); // Always refresh stock after adding a job (might reserve items)
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error("Assign work error:", err.response?.data || err);
      const detail = err.response?.data?.message || err.message || 'Check all fields.';
      setMsg({ type: 'error', text: `Failed to create bill: ${detail}` });
    } finally {
      setLoading(false);
    }
  };

  const openEditJob = (job) => {
    setEditingJobId(job.id);
    setEditJobData({
      customerId: job.customer?.id || '',
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
    setLoading(true);
    try {
      const payload = {
        vehicleNumber: editJobData.vehicleNumber,
        customer: { id: editJobData.customerId },
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
      
      setMsg({ type: 'success', text: 'Inventory item definition created successfully!' });
      setAddStockData(initialStockData);
      fetchStock();
      setShowAddStockModal(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add item.' });
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
      categoryId: item.category?.id || ''
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
    if (!quickAddData.itemId || !quickAddData.quantity || !quickAddData.landedCost) return;
    
    setLoading(true);
    setUpdateMsg({ type: '', text: '' });
    
    try {
      const payload = {
        quantity: parseInt(quickAddData.quantity, 10),
        unitPrice: parseFloat(quickAddData.landedCost),
        supplierId: quickAddData.supplierId ? parseInt(quickAddData.supplierId) : null,
        hsCode: quickAddData.hsCode || null,
        currencyType: quickAddData.currencyType || null,
        unitCostForeign: quickAddData.unitCostForeign ? parseFloat(quickAddData.unitCostForeign) : null,
        exchangeRate: quickAddData.exchangeRate ? parseFloat(quickAddData.exchangeRate) : null,
        freightCost: quickAddData.freightCost ? parseFloat(quickAddData.freightCost) : null,
        shippingCost: quickAddData.shippingCost ? parseFloat(quickAddData.shippingCost) : null,
        bankCharges: quickAddData.bankCharges ? parseFloat(quickAddData.bankCharges) : null,
        clearanceFees: quickAddData.clearanceFees ? parseFloat(quickAddData.clearanceFees) : null,
        dutyFees: quickAddData.dutyFees ? parseFloat(quickAddData.dutyFees) : null,
        additionalExpenses: quickAddData.additionalExpenses ? parseFloat(quickAddData.additionalExpenses) : null,
        landedCost: quickAddData.landedCost ? parseFloat(quickAddData.landedCost) : null,
        sellingPrice: quickAddData.sellingPrice ? parseFloat(quickAddData.sellingPrice) : null,
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
      setTimeout(() => { 
        setShowQuickAddModal(false); 
        setUpdateMsg({ type: '', text: '' });
        setQuickAddData({ itemId: '', quantity: '', hsCode: '', currencyType: '', unitCostForeign: '', exchangeRate: '', freightCost: '', shippingCost: '', bankCharges: '', clearanceFees: '', dutyFees: '', additionalExpenses: '', landedCost: '', unitPrice: '', sellingPrice: '', supplierId: '' });
      }, 1000);
    } catch (err) {
      setUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add stock.' });
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

  const PREDEFINED_EXPENSE_FIELDS = useMemo(() => [
    "Monthly Expenses", "GD Ferdinand Salary", "Com Bank Loan 5Mn", "S Wickramasinghe", 
    "Other Loan Instalments", "N T M Wickramage", "Housing Loan", "Vehicle Maintanance", 
    "LP", "Cheque Payment", "Employment Salary", "Duty", "Clearance", 
    "Vihicle lease", "Vehicle Lease", "Fuel Allowance", "Building Rent 1st Floor"
  ], []);

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
    const defaultFields = PREDEFINED_EXPENSE_FIELDS.map(name => ({ name, amount: 0 }));
    return expensesData[selectedFinanceMonth] || defaultFields;
  }, [expensesData, selectedFinanceMonth, PREDEFINED_EXPENSE_FIELDS]);

  const handleUpdateExpense = (index, value) => {
    const defaultFields = PREDEFINED_EXPENSE_FIELDS.map(name => ({ name, amount: 0 }));
    const currentList = expensesData[selectedFinanceMonth] || defaultFields;
    const updated = [...currentList];
    
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
    const defaultFields = PREDEFINED_EXPENSE_FIELDS.map(name => ({ name, amount: 0 }));
    const currentList = expensesData[selectedFinanceMonth] || defaultFields;
    
    const fieldName = newExpenseField === 'Custom Expense' ? customExpenseName.trim() : newExpenseField;
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
      const defaultFields = PREDEFINED_EXPENSE_FIELDS.map(name => ({ name, amount: 0 }));
      const currentList = expensesData[selectedFinanceMonth] || defaultFields;
      const updated = currentList.filter((_, idx) => idx !== index);
      const newExpensesData = { ...expensesData, [selectedFinanceMonth]: updated };
      setExpensesData(newExpensesData);
      localStorage.setItem('mind_spareparts_monthly_expenses', JSON.stringify(newExpensesData));
    }
  };

  const handleInitializeDefaultFields = async () => {
    const ok = await showConfirm('This will reset all expense fields for this month to the standard list with Rs. 0. Are you sure?', { title: 'Reset Expense Fields', variant: 'warning', confirmText: 'Yes, Reset' });
    if (ok) {
      const defaultFields = PREDEFINED_EXPENSE_FIELDS.map(name => ({ name, amount: 0 }));
      const newExpensesData = { ...expensesData, [selectedFinanceMonth]: defaultFields };
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
      doc.text('Mind Service Center', 14, 15);
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

      const columns = ['DATE', 'TIME', 'ITEM', 'TYPE', 'QTY', 'UNIT PRICE', 'TOTAL', 'SUPPLIER', 'NOTE'];
      const rows = filteredTransactions.map(tx => [
        tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '-',
        tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        tx.isGroup ? `Batch: ${tx.items.length} Parts` : (tx.stockItem?.name || 'N/A'),
        tx.isGroup ? 'JOB BATCH' : (tx.transactionType || '-'),
        String(tx.quantity ?? '-'),
        tx.isGroup ? 'Batch Total' : (tx.unitPrice != null ? 'Rs.' + parseFloat(tx.unitPrice).toFixed(2) : '-'),
        tx.totalAmount != null ? 'Rs.' + parseFloat(tx.totalAmount).toFixed(2) : '-',
        tx.isGroup ? `JOB #${tx.jobId}` : (tx.supplier?.companyName || 'INTERNAL'),
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
          0: { cellWidth: 20 },
          1: { cellWidth: 15 },
          2: { cellWidth: 30 },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 11, halign: 'center' },
          5: { cellWidth: 23, halign: 'right' },
          6: { cellWidth: 23, halign: 'right' },
          7: { cellWidth: 22 },
          8: { cellWidth: 23 }
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
          'Mind Service Center | Inventory Audit | Page ' + i + ' of ' + pageCount + ' | Confidential',
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
    const q = deferredJobSearch.toLowerCase();
    const filtered = jobList.filter(j => {
      const vNum = (j.vehicleNumber || '').toLowerCase();
      const cName = (j.customer ? `${j.customer.firstName || ''} ${j.customer.lastName || ''}` : '').toLowerCase();
      
      const matchesSearch = vNum.includes(q) || cName.includes(q);
      const matchesStatus = jobStatusFilter === 'ALL' || j.status === jobStatusFilter;
      const matchesDate = !jobDateFilter || (j.startTime && new Date(j.startTime).toISOString().split('T')[0] === jobDateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
    return filtered.sort((a,b) => new Date(b.startTime) - new Date(a.startTime));
  }, [jobList, deferredJobSearch, jobStatusFilter, jobDateFilter]);

  const filteredCustomerDropdown = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return customerList.filter(c => (c.user?.enabled ?? c.user?.active ?? c.user?.isActive ?? true) === true);
    return customerList
      .filter(c => (c.user?.enabled ?? c.user?.active ?? c.user?.isActive ?? true) === true)
      .filter(c => (c.firstName + ' ' + (c.lastName || '')).toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.idNo || '').toLowerCase().includes(q));
  }, [customerList, customerSearchQuery]);


  const filteredPartDropdown = useMemo(() => {
    const q = partSearchQuery.toLowerCase().trim();
    if (!q) return stockList;
    return stockList.filter(it => (it.name || '').toLowerCase().includes(q) || (it.partNumber || '').toLowerCase().includes(q));
  }, [stockList, partSearchQuery]);

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
            <span className="font-black text-xl tracking-tighter text-slate-900 leading-none">Mind Spare Parts</span>
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
            { id: 'finance', icon: DollarSign, label: 'Money Management' },
            { id: 'audit', icon: ClipboardList, label: 'Logs' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'text-white'
                  : 'hover:bg-slate-50 text-slate-500 font-bold'
              }`}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg shadow-blue-600/20"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                />
              )}
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