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
                      Work Pipeline
                    </button>
                  </motion.div>

                  {/* Popular Services */}
                  <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100/50 flex flex-col">
                    <h4 className="font-black text-2xl text-slate-900 mb-8 flex items-center gap-4 tracking-tighter">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Layers className="w-6 h-6 text-indigo-600" /></div>
                      Top Categories
                    </h4>
                    <div className="space-y-5 flex-1">
                      {categoryList.slice(0, 5).map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-600/20">{i + 1}</div>
                            <span className="text-sm font-black text-slate-700">{c.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('inventory')} className="w-full mt-6 py-4 bg-slate-50 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
                      Inventory Catalog
                    </button>
                  </motion.div>

                  {/* Star Customers */}
                  <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100/50">
                    <h4 className="font-black text-2xl text-slate-900 mb-8 flex items-center gap-4 tracking-tighter">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Shield className="w-6 h-6 text-amber-600" /></div>
                      Star Customers
                    </h4>
                    <div className="space-y-6">
                      {analyticsData.topCustomers && analyticsData.topCustomers.map((c, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                            {i === 0 ? '🏆' : i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-900 tracking-tight">{c.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.jobs} Jobs</p>
                          </div>
                        </div>
                      ))}
                      {(!analyticsData.topCustomers || analyticsData.topCustomers.length === 0) && (
                        <p className="text-slate-400 font-bold italic text-sm text-center py-10">No customer records yet.</p>
                      )}
                    </div>
                    <button onClick={() => setActiveTab('customers')} className="w-full mt-6 py-4 bg-slate-50 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
                      Customers
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}


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
                  <p className="text-slate-500 font-medium">Create and track customer bills and inventory sales.</p>
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
                {filteredJobs.length === 0 ? (
                  <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4"><Briefcase className="w-10 h-10 text-slate-200" /></div>
                    <p className="text-slate-400 font-bold">{jobList.length === 0 ? "No active bills found." : "No bills match your search/filter."}</p>
                    <button onClick={() => setShowAddJobModal(true)} className="mt-4 text-blue-600 font-black text-sm hover:underline">Create a new bill</button>
                  </div>
                ) : (
                  filteredJobs.map(job => (
                    <motion.div key={job.id} variants={itemVariants} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all overflow-hidden group relative">
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
                                <h4 className="text-xl font-black text-slate-900 tracking-tight">{job.vehicleNumber || `Bill #${job.id}`}</h4>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Wrench className="w-3 h-3" /> Labor / Services
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.services?.map(s => (
                                  <span key={s.id} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">{s.serviceName}</span>
                                ))}
                                {job.services?.length === 0 && <span className="text-[10px] font-bold text-slate-300 italic">No services</span>}
                              </div>
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
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

            {activeTab === 'customers' && (
              <motion.div key="customers" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
                      <input type="text" name="phone" required maxLength="10" value={customerFormData.phone} onChange={handleCustomerFormChange} className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 transition-colors border border-transparent focus:border-blue-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none" placeholder="10-digit number" />
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
                      <input type="text" placeholder="Search customers..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="bg-transparent text-sm font-bold outline-none placeholder:text-slate-500 w-full md:w-48" />
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
                        {filteredCustomers.map((customer, index) => {
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
                                <button onClick={() => openEditCustomer(customer)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors ml-auto border border-slate-100"><Pencil className="w-3.5 h-3.5" /></button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredCustomers.length === 0 && (
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
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div key="inventory" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Inventory Hub</h2>
                    <p className="text-slate-500 font-medium">Browse available parts and stock levels in real-time.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-600 outline-none shadow-sm cursor-pointer">
                       <option value="ALL">All Categories</option>
                       {categoryList.map(cat => <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>)}
                    </select>
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm w-full lg:w-64">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Search parts..." value={stockSearch} onChange={e => setStockSearch(e.target.value)} className="bg-transparent text-sm font-bold outline-none w-full" />
                    </div>
                  </div>
                </div>

                {/* Smart Metrics */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  {[
                    { label: 'Low Stock Alerts', value: stockList.filter(i => i.quantity <= i.lowStockThreshold && i.quantity > 0).length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Out of Stock', value: stockList.filter(i => i.quantity === 0).length, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Unique Parts', value: stockList.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</h4>
                      </div>
                    </div>
                  ))}
                </motion.div>

                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th className="py-4 px-4">ITEM DETAILS</th>
                            <th className="py-4 px-4">CATEGORY</th>
                            <th className="py-4 px-4">PART NUMBER</th>
                            <th className="py-4 px-4">STOCK (AVAIL / TOTAL)</th>
                            <th className="py-4 px-4 text-right">UNIT PRICE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(
                            filteredStock.reduce((acc, item) => {
                              const catName = item.category?.name || 'Uncategorized';
                              if (!acc[catName]) acc[catName] = [];
                              acc[catName].push(item);
                              return acc;
                            }, {})
                          ).map(([categoryName, items]) => (
                            <React.Fragment key={categoryName}>
                              <tr className="bg-slate-50/50">
                                <td colSpan="5" className="py-3 px-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{categoryName}</span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{items.length} Items</span>
                                  </div>
                                </td>
                              </tr>
                              {items.map((item, index) => {
                                const isExpanded = expandedStockRows.has(item.id);
                                const batches = rowBatches[item.id] || [];
                                const isLowStock = item.quantity <= item.lowStockThreshold && item.quantity > 0;
                                const isOutOfStock = item.quantity === 0;
                                const maxHealth = Math.max(item.quantity, item.lowStockThreshold * 2);
                                const healthPercent = Math.min((item.quantity / (maxHealth || 1)) * 100, 100);
                                let barColor = 'bg-emerald-500';
                                if (isOutOfStock) barColor = 'bg-red-600';
                                else if (isLowStock) barColor = 'bg-amber-500';
                                return (
                                  <React.Fragment key={item.id || `stock-key-${index}`}>
                                    <tr className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${isOutOfStock ? 'bg-red-50/20' : ''} ${isExpanded ? 'bg-slate-50/30' : ''}`}>
                                      <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                          <button onClick={() => toggleRowExpansion(item.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-900 text-white rotate-180' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          </button>
                                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isOutOfStock ? 'bg-red-100 text-red-600' : isLowStock ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                            <Package className="w-4 h-4" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                                            {isOutOfStock ? (
                                              <span className="text-[9px] font-black uppercase tracking-widest text-red-600 mt-0.5">OUT OF STOCK</span>
                                            ) : isLowStock ? (
                                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3" /> LOW STOCK</span>
                                            ) : (
                                              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">IN STOCK</span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4"><span className="px-3 py-1 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100 shadow-sm">{item.category?.name || 'Uncategorized'}</span></td>
                                      <td className="py-4 px-4"><span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{item.partNumber}</span></td>
                                      <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                                          <div className="flex justify-between items-center px-0.5">
                                            <span className={`text-[10px] font-black ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-500' : 'text-slate-500'}`}>
                                              <span className={isOutOfStock ? 'text-red-600' : 'text-emerald-600'}>{item.quantity}</span> avail / {item.quantity + (item.reservedQuantity || 0)} total
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400">{Math.round(healthPercent)}%</span>
                                          </div>
                                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${healthPercent}%` }} className={`h-full ${barColor} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4 text-right font-black text-slate-900">Rs. {(item.unitPrice || 0).toLocaleString()}</td>
                                    </tr>
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-50/80">
                                          <td colSpan="5" className="p-0 overflow-hidden">
                                            <div className="p-6 md:pl-16 md:pr-12">
                                              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                                <table className="w-full text-left">
                                                  <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                      <th className="py-3 px-4">STOCK DATE</th>
                                                      <th className="py-3 px-4 text-center">QUANTITY</th>
                                                      <th className="py-3 px-4 text-right">SELLING PRICE</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-50">
                                                    {batches.length > 0 ? batches.map((batch, bi) => (
                                                      <tr key={batch.id || bi} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-4 text-[11px] font-bold text-slate-600">
                                                          <div className="flex flex-col">
                                                            <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                                                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">{new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                          </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${batch.currentQuantity === 0 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>{batch.currentQuantity ?? batch.quantity} Units</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-[11px] font-black text-slate-900">
                                                          Rs. {(item.unitPrice || 0).toLocaleString()}
                                                        </td>
                                                      </tr>
                                                    )) : (
                                                      <tr><td colSpan="3" className="py-8 text-center text-xs font-bold text-slate-400 italic">No active batches found for this item.</td></tr>
                                                    )}
                                                  </tbody>
                                                </table>
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
                          {filteredStock.length === 0 && (
                            <tr>
                              <td colSpan="5" className="py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center"><Package className="w-8 h-8 text-slate-200" /></div>
                                  <p className="text-slate-400 font-bold text-sm tracking-tight">No inventory items found.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>
               </motion.div>
             )}

            {activeTab === 'services' && null}
          </AnimatePresence>
        </div>

        {/* MODALS */}
        
           {/* Edit Customer Modal */}
           <AnimatePresence>
           {showEditCustomer && (
             <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditCustomer(false)} />
                <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }} className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
                   <div className="bg-indigo-600 p-7 flex items-center justify-between text-white shrink-0">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center"><Pencil className="w-5 h-5" /></div><div><h3 className="text-lg font-black tracking-tight">Edit Customer Profile</h3><p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Update client information</p></div></div>
                      <button onClick={() => setShowEditCustomer(false)} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"><XCircle className="w-5 h-5" /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-7">
                      <form onSubmit={handleUpdateCustomer} className="space-y-5">
                         {updateMsg.text && <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-wider ${updateMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{updateMsg.text}</div>}
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label><input required value={editCustomerData.firstName} onChange={e => setEditCustomerData({...editCustomerData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-indigo-600" /></div>
                           <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label><input value={editCustomerData.lastName} onChange={e => setEditCustomerData({...editCustomerData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-indigo-600" /></div>
                         </div>
                         <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label><input required maxLength="10" value={editCustomerData.phone} onChange={e => setEditCustomerData({...editCustomerData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-indigo-600" /></div>
                         <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Residential Address</label><input value={editCustomerData.address} onChange={e => setEditCustomerData({...editCustomerData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-indigo-600" /></div>
                         <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address (Read Only)</label><input disabled value={customerList.find(c => c.id === editingCustomerId)?.user?.email || ''} className="w-full bg-slate-100 border border-slate-100 p-4 rounded-xl text-sm font-bold text-slate-500 outline-none" /></div>
                         <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div><p className="font-black text-slate-900 text-sm">Account Active</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Enable or disable portal access</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" checked={editCustomerData.enabled} onChange={e => setEditCustomerData({...editCustomerData, enabled: e.target.checked})} className="sr-only peer" />
                               <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all shadow-inner" />
                            </label>
                         </div>
                         <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-600/20 mt-4 flex items-center justify-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Save Changes</span><ArrowRight className="w-4 h-4" /></>}</button>
                      </form>
                   </div>
                </motion.div>
             </div>
           )}
           </AnimatePresence>

           <AnimatePresence>
           {/* Add Job Modal */}
           {showAddJobModal && (
             <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddJobModal(false)} />
               <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
                 className="relative z-10 w-full sm:max-w-4xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                 
                 <div className="bg-blue-600 p-6 sm:p-8 flex items-center justify-between text-white shrink-0">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-200 shadow-inner">
                       <ClipboardList className="w-7 h-7" />
                     </div>
                     <div>
                       <h3 className="text-xl font-black tracking-tight">Creating Bill</h3>
                       <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">Retail Inventory & Sales</p>
                     </div>
                   </div>
                   <button onClick={() => setShowAddJobModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all">
                     <XCircle className="w-6 h-6" />
                   </button>
                 </div>
    
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                   <form id="job-card-form" onSubmit={handleAddJob} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Left Column: Core Info */}
                     <div className="space-y-6">
                       {msg.text && (
                         <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-wider ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>
                       )}
                       <section className="space-y-4">
                         <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Primary Details</h5>
                         <div className="space-y-4">
                           <div className="relative">
                             <label className="text-[10px] font-black uppercase text-slate-500 ml-1 mb-1.5 block">Select Customer</label>
                             <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                {addJobData.customerId ? (
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
                                       <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[120] max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                         {customerList
                                           .filter(c => {
                                             const isEnabled = c.user?.enabled ?? c.user?.active ?? c.user?.isActive ?? true;
                                             return isEnabled === true;
                                           })
                                           .filter(c => {
                                             const q = customerSearchQuery.toLowerCase().trim();
                                             if (!q) return true;
                                             return (c.firstName + ' ' + (c.lastName || '')).toLowerCase().includes(q) || 
                                                    (c.phone || '').includes(q) || 
                                                    (c.idNo || '').toLowerCase().includes(q);
                                           })
                                           .map(c => (
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
    
                     {/* Right Column: Items & Billing */}
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
                                   <button type="button" onClick={() => setPartSearchQuery(partSearchQuery.trim() === '' ? ' ' : '')} className="text-slate-400 hover:text-emerald-600"><ChevronDown className={`w-4 h-4 transition-transform ${partSearchQuery ? 'rotate-180' : ''}`} /></button>
                                 </div>

                                 {/* Part Suggestions */}
                                 {partSearchQuery !== undefined && (partSearchQuery.length > 0 || partSearchQuery === ' ') && (
                                   <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[120] max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                      {stockList
                                        .filter(it => {
                                          const q = partSearchQuery.toLowerCase().trim();
                                          if (!q) return true;
                                          return (it.name || '').toLowerCase().includes(q) || (it.partNumber || '').toLowerCase().includes(q);
                                        })
                                        .map(it => {
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
                                                <p className={`text-xs font-black transition-colors ${isOutOfStock ? 'text-slate-400' : 'text-slate-700 group-hover:text-emerald-700'}`}>
                                                  {it.name}
                                                </p>
                                                <p className={`text-[10px] font-bold uppercase tracking-tighter ${isOutOfStock ? 'text-slate-300' : 'text-slate-400'}`}>
                                                  {it.partNumber} | {isOutOfStock ? 'OUT OF STOCK' : `${it.fifoQuantity} Avail.`}
                                                </p>
                                              </div>
                                              {!isOutOfStock && <span className="text-xs font-black text-emerald-600">Rs. {it.unitPrice}</span>}
                                            </button>
                                          );
                                        })}
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
                                        <div className="flex items-center gap-2 p-2">
                                          <span className="flex-1 text-[10px] font-bold text-slate-700 truncate">{item.name}</span>
                                          <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-1">
                                            <button type="button" onClick={() => {
                                              if (item.quantity > 1) updateItemFifoPrice(idx, item.quantity - 1, 'add');
                                            }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                                            <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                                            <button type="button" onClick={() => {
                                              const stockItem = stockList.find(s => s.id === item.stockItemId);
                                              if (stockItem && item.quantity >= stockItem.quantity) {
                                                setMsg({ type: 'error', text: `Insufficient stock! Only ${stockItem.quantity} available.` });
                                                return;
                                              }
                                              updateItemFifoPrice(idx, item.quantity + 1, 'add');
                                            }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-500"><Plus className="w-3 h-3" /></button>
                                          </div>
                                          <button type="button" onClick={() => {
                                            setAddJobData({...addJobData, items: addJobData.items.filter((_, i) => i !== idx)});
                                          }} className="w-6 h-6 text-slate-300 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                                        </div>
                                        {item.allocations && item.allocations.length > 1 && (
                                          <div className="mx-2 mb-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                              <span>⚡</span> Price split across {item.allocations.length} stock batches
                                            </p>
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
                 </div>
                 <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                   <button type="button" onClick={() => setShowAddJobModal(false)} className="flex-1 bg-white border border-slate-200 text-slate-500 font-black py-4 rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                   <button type="submit" form="job-card-form" disabled={loading} className="flex-[2] sm:px-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Assign New Work</span><ClipboardCheck className="w-5 h-5" /></>}
                   </button>
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
                                {editJobData.customerId ? (
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
                                       <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[120] max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                         {customerList
                                           .filter(c => {
                                             const isEnabled = c.user?.enabled ?? c.user?.active ?? c.user?.isActive ?? true;
                                             return isEnabled === true;
                                           })
                                           .filter(c => {
                                             const q = customerSearchQuery.toLowerCase().trim();
                                             if (!q) return true;
                                             return (c.firstName + ' ' + (c.lastName || '')).toLowerCase().includes(q) || 
                                                    (c.phone || '').includes(q) || 
                                                    (c.idNo || '').toLowerCase().includes(q);
                                           })
                                           .map(c => (
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
    
                     {/* Right Column: Items & Billing */}
                     <div className="space-y-6">
                       <section className="space-y-4">
                         <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Items & Billing</h5>
                         <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                           
                           <div className="space-y-4">
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
                                     {stockList
                                        .filter(it => {
                                          const q = partSearchQuery.toLowerCase().trim();
                                          if (!q) return true;
                                          return (it.name || '').toLowerCase().includes(q) || (it.partNumber || '').toLowerCase().includes(q);
                                        })
                                        .map(it => {
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
                                                <p className={`text-xs font-black transition-colors ${isOutOfStock ? 'text-slate-400' : 'text-slate-700 group-hover:text-indigo-700'}`}>
                                                  {it.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                  <p className={`text-[9px] font-black uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 ${isOutOfStock ? 'text-slate-300' : 'text-slate-400'}`}>
                                                    {it.partNumber}
                                                  </p>
                                                  <p className={`text-[10px] font-black ${isOutOfStock ? 'text-red-400' : 'text-indigo-600'}`}>
                                                    {isOutOfStock ? 'OUT OF STOCK' : `${it.fifoQuantity} Avail @ Rs. ${parseFloat(it.unitPrice || 0).toLocaleString()}`}
                                                  </p>
                                                </div>
                                              </div>
                                              {!isOutOfStock && <span className="text-xs font-black text-indigo-600">Rs. {it.unitPrice}</span>}
                                            </button>
                                          );
                                        })}
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
      </main>
    </div>
  );
};

export default StaffDashboard;
