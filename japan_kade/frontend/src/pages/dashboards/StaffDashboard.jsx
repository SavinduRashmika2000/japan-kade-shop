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