import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';
import stockService from '../../services/stockService';
import jobCardService from '../../services/jobCardService';
import jobLogService from '../../services/jobLogService';
import categoryService from '../../services/categoryService';
import dashboardService from '../../services/dashboardService';
import serviceTypeService from '../../services/serviceTypeService';
import supplierService from '../../services/supplierService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  Loader2,
  User,
  Tag,
  Receipt,
  Pencil,
  Package,
  Layers,
  ClipboardList,
  FileDown,
  Clock,
  Wrench,
  Car,
  ClipboardCheck,
  CheckSquare,
  Minus,
  Briefcase,
  ChevronDown,
  Menu,
  Edit3,
  Timer,
  Calendar,
  RotateCw,
  PlusCircle,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Phone,
  Mail,
  Users,
  AlertTriangle,
  Truck,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import authService from '../../services/authService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const getLocalISOString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
};

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  // Data Lists
  const [customerList, setCustomerList] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  
  const [analyticsData, setAnalyticsData] = useState({
    todayRevenue: 0, totalRevenue: 0, activeJobs: 0, totalCustomers: 0, totalStaff: 0, totalServices: 0,
    chartData: [], topItems: [], topServices: [], topCustomers: [], recentActivity: [],
    weekStart: '', weekEnd: ''
  });

  const [logTab, setLogTab] = useState('stock_in');

  // Customer Management State
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({});
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [customerFormData, setCustomerFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', address: '', idNo: ''
  });
  const [customerSearch, setCustomerSearch] = useState('');

  const updateItemFifoPrice = async (idx, qty, type = 'add', currentItems = null) => {
    const snapshot = currentItems || (type === 'add' ? addJobData : editJobData).items;
    const item = snapshot[idx];
    if (!item || !item.stockItemId || qty <= 0) return;

    const setter = type === 'add' ? setAddJobData : setEditJobData;

    try {
      const res = await stockService.previewFifoCost(item.stockItemId, qty);
      const avgPrice = res.data.total / qty;
      const allocations = res.data.allocations || [];
      setter(prev => {
        const updatedItems = [...prev.items];
        if (!updatedItems[idx]) return prev;
        updatedItems[idx] = { ...updatedItems[idx], priceAtTime: avgPrice, quantity: qty, allocations };
        return { ...prev, items: updatedItems };
      });
    } catch (err) {
      console.error("Failed to preview FIFO cost", err);
      setter(prev => {
        const updatedItems = [...prev.items];
        if (!updatedItems[idx]) return prev;
        updatedItems[idx] = { ...updatedItems[idx], quantity: qty };
        return { ...prev, items: updatedItems };
      });
    }
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

  const customerDropdownRef = useRef(null);
  const serviceDropdownRef = useRef(null);
  const partDropdownRef = useRef(null);

  // Work Management State
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');
  const [jobDateFilter, setJobDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  const initialJobData = {
    customerId: '', vehicleNumber: '', startTime: getLocalISOString(), endTime: '', services: [], items: [], status: 'WAITING'
  };
  const [addJobData, setAddJobData] = useState(initialJobData);
  const [editJobData, setEditJobData] = useState(initialJobData);

  // Read-only State
  const [stockSearch, setStockSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [serviceSearch, setServiceSearch] = useState('');
  const [expandedStockRows, setExpandedStockRows] = useState(new Set());
  const [rowBatches, setRowBatches] = useState({}); // { itemId: [batches] }

  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [partSearchQuery, setPartSearchQuery] = useState('');

  // Deferred values for performance
  const deferredJobSearch = useDeferredValue(jobSearch);
  const deferredCustomerSearch = useDeferredValue(customerSearch);
  const deferredStockSearch = useDeferredValue(stockSearch);
  const deferredServiceSearch = useDeferredValue(serviceSearch);

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setCustomerFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setCustomerFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Data Fetching
  const fetchCustomers = async () => {
    try {
      const res = await customerService.getAllCustomers();
      setCustomerList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchStock = async () => {
    try {
      const res = await stockService.getAllStockItems();
      setStockList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchJobs = async () => {
    try {
      const res = await jobCardService.getAllJobs();
      setJobList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchServices = async () => {
    try {
      const res = await serviceTypeService.getAllServiceTypes();
      setServiceList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };


  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategoryList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const calculateAnalytics = useMemo(() => {
    try {
      const today = new Date().toDateString();
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));

      const todayJobs = jobList.filter(j => new Date(j.createdAt || j.startTime).toDateString() === today);
      const activeJobs = jobList.filter(j => j.status !== 'FINISHED' && j.status !== 'CANCELLED');
      
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const chartData = last7Days.map(date => ({
        date: date,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: jobList.filter(j => (j.startTime || j.createdAt)?.startsWith(date)).reduce((sum, j) => sum + (parseFloat(j.totalAmount) || 0), 0)
      }));

      // Top Items
      const itemUsage = {};
      jobList.filter(j => {
        const d = new Date(j.createdAt || j.startTime);
        return d >= startOfWeek && d <= endOfWeek;
      }).forEach(j => {
        (j.items || []).forEach(i => {
          const id = i.stockItem?.id;
          if (id) itemUsage[id] = (itemUsage[id] || 0) + (i.quantity || 0);
        });
      });
      const topItems = Object.entries(itemUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, qty]) => ({
          name: stockList.find(s => String(s.id) === id)?.name || 'Unknown',
          qty
        }));

      // Top Services
      const serviceUsage = {};
      jobList.forEach(j => {
        (j.services || []).forEach(s => {
          serviceUsage[s.serviceName] = (serviceUsage[s.serviceName] || 0) + 1;
        });
      });
      const topServices = Object.entries(serviceUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Top Customers
      const custStats = {};
      jobList.forEach(j => {
        const id = j.customer?.id;
        if (id) {
          if (!custStats[id]) custStats[id] = { name: `${j.customer.firstName} ${j.customer.lastName}`, jobs: 0, total: 0 };
          custStats[id].jobs++;
          custStats[id].total += (parseFloat(j.totalAmount) || 0);
        }
      });
      const topCustomers = Object.values(custStats).sort((a, b) => b.total - a.total).slice(0, 5);

      return {
        todayRevenue: todayJobs.reduce((sum, j) => sum + (parseFloat(j.totalAmount) || 0), 0),
        totalRevenue: jobList.reduce((sum, j) => sum + (parseFloat(j.totalAmount) || 0), 0),
        activeJobs: activeJobs.length,
        totalCustomers: customerList.length,
        totalServices: serviceList.length,
        chartData,
        topItems,
        topServices,
        topCustomers,
        recentActivity: jobList.slice(0, 5),
        weekStart: startOfWeek.toLocaleDateString(),
        weekEnd: endOfWeek.toLocaleDateString()
      };
    } catch (err) {
      console.error("Analytics error", err);
      return analyticsData;
    }
  }, [jobList, stockList, customerList, serviceList]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.allSettled([
        fetchCustomers(), fetchStock(), fetchJobs(), fetchServices(), fetchCategories()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    setAnalyticsData(calculateAnalytics);
  }, [calculateAnalytics]);


  // Job Logic
  const handleAddJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = getLocalISOString();
      const payload = {
        vehicleNumber: addJobData.vehicleNumber || '', 
        customer: { id: addJobData.customerId },
        startTime: addJobData.startTime || now, 
        endTime: addJobData.endTime || now,
        services: addJobData.services.map(s => ({ serviceType: { id: s.serviceTypeId }, priceAtTime: s.priceAtTime, serviceName: s.name })),
        items: addJobData.items.map(i => ({ stockItem: { id: i.stockItemId }, quantity: i.quantity, priceAtTime: i.priceAtTime, itemName: i.name })),
        status: 'WAITING'
      };
      if (payload.startTime && payload.startTime.length === 16) payload.startTime += ":00";
      if (payload.endTime && payload.endTime.length === 16) payload.endTime += ":00";

      await jobCardService.createJob(payload);
      setMsg({ type: 'success', text: 'Bill Created Successfully!' });
      setAddJobData(initialJobData);
      setShowAddJobModal(false);
      fetchJobs(); fetchStock();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) { setMsg({ type: 'error', text: 'Failed to create bill.' }); }
    finally { setLoading(false); }
  };

  const openEditJob = (job) => {
    setEditingJobId(job.id);
    setEditJobData({
      customerId: job.customer?.id || '', vehicleNumber: job.vehicleNumber,
      startTime: job.startTime ? job.startTime.slice(0, 16) : getLocalISOString(),
      endTime: job.endTime ? job.endTime.slice(0, 16) : '',
      services: job.services?.map(s => ({ serviceTypeId: s.serviceType?.id, priceAtTime: s.priceAtTime, name: s.serviceName, duration: s.serviceType?.duration || 0 })) || [],
      items: job.items?.map(i => ({ stockItemId: i.stockItem?.id, quantity: i.quantity, priceAtTime: i.priceAtTime, name: i.itemName })) || [],
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
        services: editJobData.services.map(s => ({ serviceType: { id: s.serviceTypeId }, priceAtTime: s.priceAtTime, serviceName: s.name })),
        items: editJobData.items.map(i => ({ stockItem: { id: i.stockItemId }, quantity: i.quantity, priceAtTime: i.priceAtTime, itemName: i.name })),
        status: editJobData.status
      };
      if (payload.startTime && payload.startTime.length === 16) payload.startTime += ":00";
      if (payload.endTime && payload.endTime.length === 16) payload.endTime += ":00";

      await jobCardService.updateJob(editingJobId, payload);
      setUpdateMsg({ type: 'success', text: 'Job Card Updated!' });
      fetchJobs(); fetchStock();
      setTimeout(() => { setShowEditJobModal(false); setUpdateMsg({ type: '', text: '' }); }, 2000);
    } catch (err) { setUpdateMsg({ type: 'error', text: 'Update failed.' }); }
    finally { setLoading(false); }
  };

  const handleUpdateJobStatus = async (id, status) => {
    // Optimistic UI update
    const oldJobs = [...jobList];
    setJobList(prev => prev.map(job => job.id === id ? { ...job, status } : job));

    try {
      await jobCardService.updateJobStatus(id, status);
      // Status update succeeded! Refresh data in background
      fetchJobs(); 
      fetchStock(); 
    } catch (err) { 
      // Only revert and show error if the actual status update failed
      console.error("Status update failed", err); 
      setJobList(oldJobs); 
      
      const errorMsg = err.response?.status === 429 
        ? 'Too many requests. Please wait a moment.' 
        : 'Status update failed. Please try again.';
      setMsg({ type: 'error', text: errorMsg });
    }
  };

  // Customer Logic
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

  const openEditCustomer = (customer) => {
    setEditingCustomerId(customer.id);
    setEditCustomerData({ 
      firstName: customer.firstName || '', 
      lastName: customer.lastName || '', 
      phone: customer.phone || '', 
      address: customer.address || '', 
      password: '', 
      enabled: customer.user?.enabled ?? true 
    });
    setUpdateMsg({ type: '', text: '' });
    setShowEditCustomer(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerService.updateCustomer(editingCustomerId, editCustomerData);
      setUpdateMsg({ type: 'success', text: 'Customer details updated!' });
      fetchCustomers();
      setTimeout(() => { setShowEditCustomer(false); setUpdateMsg({ type: '', text: '' }); }, 1500);
    } catch (err) { setUpdateMsg({ type: 'error', text: 'Update failed.' }); }
    finally { setLoading(false); }
  };

  const toggleRowExpansion = async (itemId) => {
    const newExpanded = new Set(expandedStockRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      if (!rowBatches[itemId]) {
        try {
          const res = await stockService.getBatches(itemId);
          setRowBatches(prev => ({ ...prev, [itemId]: res.data }));
        } catch (err) { console.error("Failed to fetch batches for row", err); }
      }
    }
    setExpandedStockRows(newExpanded);
  };

  const generateCustomerReport = (log) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const job = jobList.find(j => j.id == (log.jobId || log.id));
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 45, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('MIND SPARE PARTS', pageW / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Bill #${job?.id} | ${new Date().toLocaleDateString()}`, pageW / 2, 28, { align: 'center' });
    
    const itemRows = (job?.items || []).map(i => [i.itemName, i.quantity, `Rs. ${parseFloat(i.priceAtTime).toLocaleString()}`, `Rs. ${(i.quantity * i.priceAtTime).toLocaleString()}`]);
    autoTable(doc, { head: [['Item', 'Qty', 'Unit Price', 'Total']], body: itemRows, startY: 60, theme: 'grid' });
    
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Billing_Invoice_${job?.id}_${dateStr}.pdf`);
  };

  // Filtered Data
  const filteredJobs = useMemo(() => {
    const q = deferredJobSearch.toLowerCase();
    return jobList.filter(j => {
      const vNum = (j.vehicleNumber || '').toLowerCase();
      const cName = (j.customer ? `${j.customer.firstName || ''} ${j.customer.lastName || ''}` : '').toLowerCase();
      const matchesSearch = vNum.includes(q) || cName.includes(q);
      const matchesStatus = jobStatusFilter === 'ALL' || j.status === jobStatusFilter;
      const matchesDate = !jobDateFilter || (j.startTime && new Date(j.startTime).toISOString().split('T')[0] === jobDateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a,b) => new Date(b.startTime) - new Date(a.startTime));
  }, [jobList, deferredJobSearch, jobStatusFilter, jobDateFilter]);

  const filteredCustomers = useMemo(() => {
    const q = deferredCustomerSearch.toLowerCase();
    return customerList.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || 
      (c.phone || '').includes(q) ||
      (c.idNo || '').toLowerCase().includes(q)
    );
  }, [customerList, deferredCustomerSearch]);

  const filteredStock = useMemo(() => {
    const q = deferredStockSearch.toLowerCase();
    return stockList.filter(item => 
      ((item.name || '').toLowerCase().includes(q) || (item.partNumber || '').toLowerCase().includes(q)) && 
      (categoryFilter === 'ALL' || item.category?.id?.toString() === categoryFilter)
    );
  }, [stockList, deferredStockSearch, categoryFilter]);


  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0, duration: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-100 selection:text-blue-700 relative">
      
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen z-40 w-72 border-r border-slate-200 bg-white flex flex-col shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg"><Package className="w-5 h-5 text-white" /></div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-slate-900 leading-none">Mind Spare Parts</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mt-0.5">Staff Portal</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'work', icon: Briefcase, label: 'Bill Management' },
            { id: 'customers', icon: User, label: 'Customers' },
            { id: 'inventory', icon: Package, label: 'Inventory' },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'text-white' : 'hover:bg-slate-50 text-slate-500 font-bold'}`}>
              {activeTab === item.id && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg shadow-blue-600/20" transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }} />}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 text-white/70 ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
           <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-blue-600 shadow-sm">{user?.username?.[0].toUpperCase()}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-slate-900 truncate">{user?.username}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff</p>
                </div>
              </div>
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"><LogOut className="w-4 h-4" /> Sign Out</button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-white min-w-0">
        <header className="h-16 md:h-20 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <button className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5 text-slate-600" /></button>
          <div className="flex-1"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 space-y-8 bg-white relative">
          <AnimatePresence>
            {(msg.text || updateMsg.text) && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] min-w-[320px] p-4 rounded-2xl shadow-2xl border flex items-center gap-4 backdrop-blur-xl ${ (msg.type === 'error' || updateMsg.type === 'error') ? 'bg-red-50/90 border-red-100 text-red-600' : 'bg-emerald-50/90 border-emerald-100 text-emerald-600' }`}>
                {msg.text || updateMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -10 }} className="space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Shop Feed</h2>
                    <p className="text-slate-500 mt-2 md:mt-3 font-bold text-sm md:text-lg tracking-tight">Real-time operational pulse for <span className="text-blue-600">Mind Spare Parts</span>.</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2.5 rounded-xl shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live</span>
                  </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Active Bills', value: (analyticsData.activeJobs || 0).toString(), badge: 'Bills', icon: Briefcase, color: 'indigo' },
                    { label: 'Total Customers', value: (analyticsData.totalCustomers || 0).toString(), badge: 'Users', icon: User, color: 'blue' },
                    { label: 'Part Categories', value: (categoryList.length || 0).toString(), badge: 'Inventory', icon: Layers, color: 'amber' },
                  ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-xl shadow-sm ${
                          stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                          stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                          stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{stat.badge}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter truncate">{stat.value}</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 truncate">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Status Pills */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Waiting', value: jobList.filter(j => j.status === 'WAITING').length, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: 'Today Paid', value: jobList.filter(j => j.status === 'PAID' && new Date(j.startTime).toDateString() === new Date().toDateString()).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                    { label: 'Low Stock Items', value: stockList.filter(i => i.quantity <= i.lowStockThreshold && i.quantity > 0).length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                  ].map((stat, i) => (
                    <button key={i} onClick={() => stat.label !== 'Low Stock Items' ? setActiveTab('work') : setActiveTab('inventory')}
                      className={`bg-white border ${stat.border} p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left group`}>
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                      </div>
                    </button>
                  ))}
                </motion.div>

                {/* Charts + Panels Row */}
                <div className="grid grid-cols-1 gap-10">
                  <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100/50 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-2xl text-slate-900 tracking-tighter">Popular Parts</h4>
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">This Week</div>
                      </div>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-8">Top inventory usage</p>
                      <div className="space-y-4">
                        {analyticsData.topItems && analyticsData.topItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-5 p-3 rounded-[1.5rem] hover:bg-slate-50 transition-all">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${i === 0 ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>
                              {i === 0 ? '🏆' : i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-black text-slate-900 tracking-tight truncate">{item.name}</p>
                              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Top Choice #{i + 1}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[16px] font-black text-slate-900 leading-none">{item.qty}</p>
                              <p className="text-[8px] font-black uppercase text-slate-400 mt-1">Used</p>
                            </div>
                          </div>
                        ))}
                        {(!analyticsData.topItems || analyticsData.topItems.length === 0) && (
                          <p className="text-slate-400 text-xs font-bold italic py-10 text-center">No inventory movement this week.</p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('inventory')} className="mt-8 w-full py-4 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                      Inventory Hub
                    </button>
                  </motion.div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Recent Activity */}
                  <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100/50">
                    <h4 className="font-black text-2xl text-slate-900 mb-8 flex items-center gap-4 tracking-tighter">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Activity className="w-6 h-6 text-blue-600" /></div>
                      Recent Activity
                    </h4>
                    <div className="space-y-8">
                      {(analyticsData.recentActivity || []).slice(0, 4).map((job) => (
                        <div key={job.id} className="flex gap-6 group cursor-pointer" onClick={() => setActiveTab('work')}>
                          <div className="w-1.5 h-12 rounded-full bg-slate-100 relative overflow-hidden group-hover:bg-blue-100 transition-colors">
                            <div className={`absolute top-0 left-0 w-full shadow-[0_0_8px_rgba(37,99,235,0.5)] ${
                              job.status === 'PAID' ? 'bg-emerald-500 h-full' :
                              'bg-amber-500 h-1/3'
                            }`} />
                          </div>
                          <div className="group-hover:translate-x-1 transition-transform duration-300 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[15px] font-black text-slate-900 tracking-tight">{job.vehicleNumber || `Bill #${job.id}`}</p>
                                <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-tight">{job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : 'Unknown'}</p>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                                job.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                job.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                              }`}>{job.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!analyticsData.recentActivity || analyticsData.recentActivity.length === 0) && (
                        <p className="text-slate-400 font-bold italic text-sm text-center py-10">No recent activity.</p>
                      )}
                    </div>
                    <button onClick={() => setActiveTab('work')} className="w-full mt-10 py-4 bg-slate-50 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">