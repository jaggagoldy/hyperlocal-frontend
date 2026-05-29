'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/translations';
import apiClient from '@/lib/api-client';
import { Lead, CatalogItem, Category } from '@/types/models';
import { THEME_FLAVORS, ThemeFlavor } from '@/config/themes';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import {
  Phone,
  Clock,
  MessageSquare,
  Loader2,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  Eye,
  Activity,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  User,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
  X,
  Settings as SettingsIcon,
  Calendar,
  Building,
  ShieldCheck,
  Award,
  Copy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VendorProfilePreview } from '@/components/vendor/VendorProfilePreview';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900',
  CONTACTED: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-indigo-900',
  CONVERTED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-indigo-900',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-indigo-900',
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New Enquiry',
  CONTACTED: 'Contacted',
  CONVERTED: 'Converted',
  REJECTED: 'Rejected',
};

interface CatalogForm {
  id?: string;
  title: string;
  price: string;
  description: string;
  categoryId: string;
  isActive: boolean;
}

interface VendorDashboardClientProps {
  defaultTab?: 'leads' | 'services' | 'analytics' | 'settings';
}

export default function VendorDashboardClient({ defaultTab = 'leads' }: VendorDashboardClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, token, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'leads' | 'services' | 'analytics' | 'settings'>(defaultTab);
  const [leadFilter, setLeadFilter] = useState<string>('ALL');

  // Vendor Profile & Stats
  const [vendor, setVendor] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isUpdatingProfileStatus, setIsUpdatingProfileStatus] = useState(false);

  // Catalog Item Creation/Editing state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSubmittingCatalog, setIsSubmittingCatalog] = useState(false);
  const [catalogForm, setCatalogForm] = useState<CatalogForm>({
    title: '',
    price: '',
    description: '',
    categoryId: '',
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local state for tracking revenue
  const [leadRevenues, setLeadRevenues] = useState<Record<string, string>>({});
  const handleRevenueChange = (leadId: string, val: string) => setLeadRevenues(prev => ({ ...prev, [leadId]: val }));
  const handleRevenueSave = (leadId: string) => toast.success('Revenue updated for this lead!');

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    businessName: '',
    localityName: '',
    chowkLandmark: '',
    pincode: '',
    locationType: '',
    customServiceType: '',
    timeAvailability: '',
    workingDays: '',
    themeFlavor: 'trust-utility',
    idType: 'Aadhar Card',
    idNumber: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Synchronize route tab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'vendor') {
      router.replace('/vendor/register');
      return;
    }

    fetchVendorData();
  }, [user]);

  // Synchronize Settings Form when vendor data loads
  useEffect(() => {
    if (vendor) {
      setSettingsForm({
        businessName: vendor.businessName || '',
        localityName: vendor.localityName || '',
        chowkLandmark: vendor.chowkLandmark || '',
        pincode: vendor.pincode || '',
        locationType: vendor.locationType || 'Freelancer',
        customServiceType: vendor.customServiceType || '',
        timeAvailability: vendor.timeAvailability || '9 AM - 6 PM',
        workingDays: vendor.workingDays || 'Monday - Saturday',
        themeFlavor: vendor.themeFlavor || 'trust-utility',
        idType: vendor.idType || 'Aadhar Card',
        idNumber: vendor.idNumber || '',
      });
    }
  }, [vendor]);

  const fetchVendorData = async () => {
    try {
      setIsLoading(true);
      const profileRes = await apiClient.get('/vendors/my-profile');
      const profileData = profileRes.data?.data;
      
      if (!profileData || !profileData.vendor) {
        toast.error('No vendor profile found. Redirecting...');
        router.replace('/vendor/register');
        return;
      }

      setVendor(profileData.vendor);
      setAnalytics(profileData.analytics);

      if (token && user && (!user.vendorId || user.vendorId !== profileData.vendor.id)) {
        setAuth(token, { ...user, vendorId: profileData.vendor.id, vendor: profileData.vendor });
      }

      const vendorId = profileData.vendor.id;

      const [leadsRes, catalogRes, categoriesRes] = await Promise.all([
        apiClient.get('/leads', { params: { vendorId } }),
        apiClient.get(`/catalog/vendor/${vendorId}`),
        apiClient.get('/search/categories')
      ]);

      setLeads(leadsRes.data?.data || []);
      setCatalogItems(catalogRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);

    } catch (error: any) {
      console.error(error);
      const status = error.response?.status;
      if (status === 403 || status === 404) {
        toast.error('Access denied. Redirecting to onboarding...');
        router.replace('/vendor/register');
      } else {
        toast.error('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadStatusChange = async (leadId: string, newStatus: string) => {
    if (!vendor) return;
    setIsUpdatingStatus(leadId);
    try {
      await apiClient.patch(`/leads/${leadId}/status`, {
        vendorId: vendor.id,
        status: newStatus
      });
      toast.success('Lead status updated!');
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus as any } : lead
      ));
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update lead status');
      const leadsRes = await apiClient.get('/leads', { params: { vendorId: vendor.id } });
      setLeads(leadsRes.data?.data || []);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleProfileStatusChange = async (newStatus: string) => {
    if (!vendor) return;
    setIsUpdatingProfileStatus(true);
    try {
      await apiClient.patch(`/vendors/${vendor.id}`, {
        status: newStatus
      });
      setVendor((prev: any) => ({ ...prev, status: newStatus }));
      toast.success(`Business status set to ${newStatus}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update business status');
    } finally {
      setIsUpdatingProfileStatus(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    // Check pro theme
    const selectedThemeConfig = THEME_FLAVORS[settingsForm.themeFlavor as ThemeFlavor];
    if (selectedThemeConfig?.isPro && vendor.membershipTier !== 'Pro') {
      toast.error('This theme is part of HyperLocal Pro. Upgrades opening soon!');
      return;
    }

    setIsSavingSettings(true);
    try {
      const res = await apiClient.patch(`/vendors/${vendor.id}`, settingsForm);
      setVendor(res.data?.data);
      toast.success('Business settings updated successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openWhatsApp = (phone: string, customerName: string, itemTitle?: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const formattedPhone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    const text = encodeURIComponent(
      `Hi ${customerName}, I am ${vendor?.businessName || 'your service provider'} from HyperLocal. I received your enquiry for "${itemTitle || 'our services'}" and would love to help you out!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  // Toggle catalog item status directly from card
  const handleToggleItemActive = async (itemId: string, currentActive: boolean) => {
    if (!vendor) return;
    
    // Optimistic UI Update
    setCatalogItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, isActive: !currentActive } : item
    ));

    try {
      await apiClient.patch(`/catalog/${itemId}`, {
        isActive: !currentActive
      });
      toast.success(currentActive ? 'Service deactivated' : 'Service activated');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update service status');
      // Revert state
      setCatalogItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isActive: currentActive } : item
      ));
    }
  };

  // Open Form for Adding Catalog Item
  const handleOpenAddCatalog = () => {
    setCatalogForm({
      title: '',
      price: '',
      description: '',
      categoryId: categories[0]?.id || '',
      isActive: true,
    });
    setSelectedFile(null);
    setFilePreview(null);
    setIsCatalogOpen(true);
  };

  // Open Form for Editing Catalog Item
  const handleOpenEditCatalog = (item: CatalogItem) => {
    setCatalogForm({
      id: item.id,
      title: item.title,
      price: item.price ? item.price.toString() : '',
      description: item.description || '',
      categoryId: item.categoryId,
      isActive: item.isActive,
    });
    setSelectedFile(null);
    setFilePreview(item.mediaUrl || null);
    setIsCatalogOpen(true);
  };

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Catalog Form submission
  const handleCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    if (!catalogForm.title.trim()) {
      toast.error('Service title is required');
      return;
    }

    if (!catalogForm.categoryId) {
      toast.error('Category is required');
      return;
    }

    try {
      setIsSubmittingCatalog(true);

      const formData = new FormData();
      formData.append('title', catalogForm.title.trim());
      formData.append('description', catalogForm.description.trim());
      formData.append('categoryId', catalogForm.categoryId);
      formData.append('isActive', catalogForm.isActive.toString());
      formData.append('vendorId', vendor.id);
      
      if (catalogForm.price) {
        formData.append('price', catalogForm.price);
      }

      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      if (catalogForm.id) {
        // EDIT MODE
        const res = await apiClient.patch(`/catalog/${catalogForm.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const updatedItem = res.data?.data;
        setCatalogItems(prev => prev.map(item =>
          item.id === catalogForm.id ? { ...item, ...updatedItem } : item
        ));
        toast.success('Service updated successfully!');
      } else {
        // CREATE MODE
        const res = await apiClient.post('/catalog', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const newItem = res.data?.data;
        setCatalogItems(prev => [newItem, ...prev]);
        toast.success('New service added to catalog!');
      }

      setIsCatalogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setIsSubmittingCatalog(false);
    }
  };

  // Handle Catalog Item Deletion
  const handleDeleteItem = async () => {
    if (!deleteTarget || !vendor) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/catalog/${deleteTarget.id}`);
      
      setCatalogItems(prev => prev.filter(item => item.id !== deleteTarget.id));
      toast.success('Service deleted successfully');
      setDeleteTarget(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  // Page URL Syncing for tab toggles
  const handleTabChange = (tab: 'leads' | 'services' | 'analytics' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'leads' || tab === 'analytics') {
      router.push('/vendor-dashboard');
    } else if (tab === 'services') {
      router.push('/vendor-dashboard/catalog');
    } else if (tab === 'settings') {
      router.push('/vendor-dashboard/settings');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (leadFilter === 'ALL') return true;
    return lead.status === leadFilter;
  });

  const newLeadsCount = leads.filter(l => l.status === 'NEW').length;
  const contactedLeadsCount = leads.filter(l => l.status === 'CONTACTED').length;
  const convertedLeadsCount = leads.filter(l => l.status === 'CONVERTED').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 pb-20">
        <div className="bg-white border-b border-zinc-100 p-6 animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-zinc-200 rounded-md" />
              <div className="h-4 w-32 bg-zinc-200 rounded-md" />
            </div>
            <div className="h-10 w-28 bg-zinc-200 rounded-xl" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-10 flex-1 bg-zinc-200 rounded-xl" />
            <div className="h-10 flex-1 bg-zinc-200 rounded-xl" />
            <div className="h-10 flex-1 bg-zinc-200 rounded-xl" />
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse space-y-4 shadow-sm">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-zinc-100 rounded" />
                  <div className="h-3 w-20 bg-zinc-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-zinc-100 rounded-full" />
              </div>
              <div className="h-12 w-full bg-zinc-50 rounded-xl" />
              <div className="h-12 w-full bg-zinc-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col xl:flex-row font-sans">
      
      {/* ─── SIDEBAR (PRO LAYOUT) ─── */}
      <aside className="w-full xl:w-72 bg-zinc-950 border-r border-zinc-800 flex-shrink-0 flex flex-col xl:min-h-screen z-40 sticky top-0">
        <div className="p-5 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-focus rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Vendor OS</h1>
          </div>
          
          <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800/50">
            <h2 className="text-sm font-bold text-zinc-100 truncate">{vendor?.businessName}</h2>
            <div className="flex items-center gap-1.5 mt-1 mb-3">
              {vendor?.idVerified && <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">Verified</span>}
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wide">{vendor?.membershipTier || 'Free'}</span>
            </div>
            
            <Select value={vendor?.status} onValueChange={handleProfileStatusChange} disabled={isUpdatingProfileStatus}>
              <SelectTrigger className="h-8 text-xs font-bold rounded-lg border-zinc-700 bg-zinc-800 text-zinc-300 focus:ring-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${vendor?.status === 'available' ? 'bg-emerald-500' : vendor?.status === 'busy' ? 'bg-amber-500' : 'bg-zinc-500'}`} />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectItem value="available">🟢 Available</SelectItem>
                <SelectItem value="busy">🟡 Busy / In Field</SelectItem>
                <SelectItem value="closed">🔴 Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <nav className="p-3 flex xl:flex-col gap-1 overflow-x-auto xl:overflow-visible scrollbar-none">
          {[
            { id: 'leads', label: t('leads'), icon: Layers, count: newLeadsCount },
            { id: 'services', label: t('services'), icon: Package, count: catalogItems.length },
            { id: 'analytics', label: t('analytics'), icon: TrendingUp },
            { id: 'settings', label: t('settings'), icon: SettingsIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex-shrink-0 flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 bg-zinc-50 flex flex-col min-h-screen overflow-hidden relative">
        
        {/* STATS HERO */}
        <div className="bg-white border-b border-zinc-200 px-4 xl:px-8 py-6 sticky top-0 z-30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Leads</p>
              <p className="text-2xl font-black text-zinc-900">{leads.length}</p>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <p className="text-amber-600/80 text-[10px] font-bold uppercase tracking-wider mb-1">Pending Action</p>
              <p className="text-2xl font-black text-amber-600">{newLeadsCount}</p>
            </div>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <p className="text-indigo-600/80 text-[10px] font-bold uppercase tracking-wider mb-1">Active Services</p>
              <p className="text-2xl font-black text-indigo-600">{catalogItems.filter(i => i.isActive).length}</p>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <p className="text-emerald-600/80 text-[10px] font-bold uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-2xl font-black text-emerald-600">
                ₹{Object.values(leadRevenues).reduce((acc, curr) => acc + (parseInt(curr) || 0), 0) || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 xl:p-8">
          
          {/* ─── LEADS KANBAN BOARD ─── */}
          {activeTab === 'leads' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Lead Pipeline</h2>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start h-full pb-10">
                
                {/* NEW COLUMN */}
                <div className="flex-1 w-full bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-bold text-sm text-zinc-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> New Enquiries
                    </h3>
                    <span className="bg-zinc-200 text-zinc-600 text-xs font-bold px-2 py-0.5 rounded-full">{newLeadsCount}</span>
                  </div>
                  <div className="space-y-3">
                    {leads.filter(l => l.status === 'NEW').map(lead => (
                      <LeadCard key={lead.id} lead={lead} openWhatsApp={openWhatsApp} handleLeadStatusChange={handleLeadStatusChange} isUpdatingStatus={isUpdatingStatus} />
                    ))}
                    {leads.filter(l => l.status === 'NEW').length === 0 && (
                      <div className="text-center p-6 text-zinc-400 text-sm font-medium border-2 border-dashed border-zinc-200 rounded-xl">No new leads</div>
                    )}
                  </div>
                </div>

                {/* CONTACTED COLUMN */}
                <div className="flex-1 w-full bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-bold text-sm text-zinc-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Contacted
                    </h3>
                    <span className="bg-zinc-200 text-zinc-600 text-xs font-bold px-2 py-0.5 rounded-full">{contactedLeadsCount}</span>
                  </div>
                  <div className="space-y-3">
                    {leads.filter(l => l.status === 'CONTACTED').map(lead => (
                      <LeadCard key={lead.id} lead={lead} openWhatsApp={openWhatsApp} handleLeadStatusChange={handleLeadStatusChange} isUpdatingStatus={isUpdatingStatus} />
                    ))}
                    {leads.filter(l => l.status === 'CONTACTED').length === 0 && (
                      <div className="text-center p-6 text-zinc-400 text-sm font-medium border-2 border-dashed border-zinc-200 rounded-xl">No contacted leads</div>
                    )}
                  </div>
                </div>

                {/* CONVERTED COLUMN */}
                <div className="flex-1 w-full bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-bold text-sm text-zinc-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Converted
                    </h3>
                    <span className="bg-zinc-200 text-zinc-600 text-xs font-bold px-2 py-0.5 rounded-full">{convertedLeadsCount}</span>
                  </div>
                  <div className="space-y-3">
                    {leads.filter(l => l.status === 'CONVERTED').map(lead => (
                      <div key={lead.id} className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100 ring-1 ring-emerald-500/10">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-zinc-900">{lead.customerName}</h4>
                          <span className="text-[10px] text-zinc-400 font-bold">{formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}</span>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium mb-3">{lead.catalogItem?.title}</p>
                        
                        <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-100">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Track Revenue (₹)</label>
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              className="h-8 text-sm font-bold bg-white" 
                              placeholder="e.g. 500" 
                              value={leadRevenues[lead.id] || ''}
                              onChange={(e) => handleRevenueChange(lead.id, e.target.value)}
                            />
                            <Button size="sm" onClick={() => handleRevenueSave(lead.id)} className="h-8 font-bold bg-emerald-600 hover:bg-emerald-700">Save</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {leads.filter(l => l.status === 'CONVERTED').length === 0 && (
                      <div className="text-center p-6 text-zinc-400 text-sm font-medium border-2 border-dashed border-zinc-200 rounded-xl">No converted leads</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ─── SERVICES TABLE ─── */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Service Catalog</h2>
                  <p className="text-sm text-zinc-500 font-medium mt-1">Manage your offerings</p>
                </div>
                <Button onClick={handleOpenAddCatalog} className="font-bold rounded-xl h-11 px-6 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Service
                </Button>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Service Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {catalogItems.map(item => (
                      <tr key={item.id} className={`transition-colors hover:bg-zinc-50/50 ${!item.isActive ? 'opacity-70' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 flex-shrink-0 flex items-center justify-center">
                              {item.mediaUrl ? <img src={item.mediaUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-zinc-400" />}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900">{item.title}</p>
                              <p className="text-xs text-zinc-500 line-clamp-1 max-w-[200px]">{item.description || 'No description'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-600 capitalize">{item.category?.name || 'N/A'}</td>
                        <td className="px-6 py-4 font-black text-primary">₹{item.price || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Switch checked={item.isActive} onCheckedChange={() => handleToggleItemActive(item.id, item.isActive)} />
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${item.isActive ? 'text-emerald-600' : 'text-zinc-400'}`}>{item.isActive ? 'Active' : 'Paused'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenEditCatalog(item)} className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteTarget(item)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {catalogItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium">No services added yet. Create one to get started!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── ANALYTICS AND SETTINGS PLACEHOLDERS ─── */}
          {activeTab === 'analytics' && (
            <div className="p-10 text-center text-zinc-500 font-medium border-2 border-dashed border-zinc-200 rounded-2xl">
              <TrendingUp className="w-10 h-10 mx-auto text-zinc-300 mb-4" />
              <p>Analytics Dashboard is active via Hero Stats.</p>
              <p className="text-sm mt-2">More detailed graphs coming soon.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-10 text-center text-zinc-500 font-medium border-2 border-dashed border-zinc-200 rounded-2xl">
              <SettingsIcon className="w-10 h-10 mx-auto text-zinc-300 mb-4" />
              <p>Settings panel moved to Vendor Profile.</p>
            </div>
          )}

        </div>
      </main>

      {/* DRAWER & MODALS (Reusing previous ones with dark backdrop) */}
      <Drawer open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg p-5">
            <DrawerHeader className="px-0 pt-0">
              <DrawerTitle className="text-lg font-bold text-zinc-900">{catalogForm.id ? 'Edit Service Details' : 'Add New Service'}</DrawerTitle>
            </DrawerHeader>
            <form onSubmit={handleCatalogSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold text-zinc-700">Service Title *</Label>
                <Input id="title" value={catalogForm.title} onChange={e => setCatalogForm(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-bold text-zinc-700">Price (₹)</Label>
                  <Input id="price" type="number" value={catalogForm.price} onChange={e => setCatalogForm(prev => ({ ...prev, price: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-zinc-700">Category *</Label>
                  <select id="category" className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-white" value={catalogForm.categoryId} onChange={e => setCatalogForm(prev => ({ ...prev, categoryId: e.target.value }))} required>
                    <option value="">Choose...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-zinc-700">Description</Label>
                <Textarea id="description" value={catalogForm.description} onChange={e => setCatalogForm(prev => ({ ...prev, description: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <DrawerClose asChild><Button type="button" variant="outline" className="flex-1">Cancel</Button></DrawerClose>
                <Button type="submit" disabled={isSubmittingCatalog} className="flex-1">{isSubmittingCatalog ? 'Saving...' : 'Save Service'}</Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Delete "{deleteTarget.title}"?</h3>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setDeleteTarget(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleDeleteItem} disabled={isDeleting} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white">{isDeleting ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper Component for Kanban Cards
function LeadCard({ lead, openWhatsApp, handleLeadStatusChange, isUpdatingStatus }: any) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200 hover:border-zinc-300 transition-all">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-zinc-900 text-sm truncate">{lead.customerName}</h4>
        <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">{formatDistanceToNow(new Date(lead.createdAt))}</span>
      </div>
      <p className="text-xs text-zinc-500 font-medium mb-3 line-clamp-1">{lead.catalogItem?.title}</p>
      
      {lead.customerRequirement && (
        <p className="text-[11px] text-zinc-500 italic bg-zinc-50 p-2 rounded-lg mb-3 border border-zinc-100">
          "{lead.customerRequirement}"
        </p>
      )}

      <div className="flex gap-2">
        <button 
          onClick={() => openWhatsApp(lead.customerPhone, lead.customerName, lead.catalogItem?.title)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-[11px] font-bold py-2 rounded-lg shadow-sm"
        >
          <Phone className="w-3 h-3 fill-current" /> WhatsApp
        </button>
        <Select value={lead.status} onValueChange={(val) => handleLeadStatusChange(lead.id, val)}>
          <SelectTrigger className="w-[100px] h-8 text-[10px] font-bold rounded-lg border-zinc-200">
            {isUpdatingStatus === lead.id ? 'Updating...' : <SelectValue placeholder="Status" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="CONVERTED">Converted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
