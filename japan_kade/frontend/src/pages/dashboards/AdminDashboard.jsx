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
