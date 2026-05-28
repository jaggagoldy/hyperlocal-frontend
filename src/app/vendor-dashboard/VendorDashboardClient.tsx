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
    <div className="min-h-screen bg-zinc-50/50 pb-24">
      {/* VENDOR HEADER */}
      <div className="bg-white border-b border-zinc-200/80 px-4 pt-6 pb-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-2xl mx-auto space-y-4">
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 font-sans tracking-tight leading-tight">
                  {vendor?.businessName}
                </h1>
                {vendor?.idVerified && (
                  <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 gap-0.5">
                    <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 text-white" /> Verified
                  </span>
                )}
                {vendor?.membershipTier === 'Pro' && (
                  <span className="inline-flex items-center bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 gap-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                {vendor?.localityName}, {vendor?.city?.name || 'Local'}
              </p>
            </div>

            <div className="relative">
              <Select
                value={vendor?.status}
                onValueChange={handleProfileStatusChange}
                disabled={isUpdatingProfileStatus}
              >
                <SelectTrigger className={`h-10 text-xs font-bold rounded-xl border px-3 flex gap-2 capitalize shadow-sm transition-all focus:ring-0 ${
                  vendor?.status === 'available'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : vendor?.status === 'busy'
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      vendor?.status === 'available'
                        ? 'bg-emerald-500'
                        : vendor?.status === 'busy'
                        ? 'bg-amber-500'
                        : 'bg-zinc-400'
                    }`} />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="available">🟢 Available</SelectItem>
                  <SelectItem value="busy">🟡 Busy / In Field</SelectItem>
                  <SelectItem value="closed">🔴 Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex p-1 bg-zinc-100 rounded-xl gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => handleTabChange('leads')}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'leads'
                  ? 'bg-white text-primary shadow-xs border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t('leads')}
              {newLeadsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                  {newLeadsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('services')}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-white text-primary shadow-xs border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Package className="w-4 h-4" />
              {t('services')}
              <span className="text-[10px] bg-zinc-200/80 px-1.5 py-0.5 rounded-md text-zinc-600 font-bold">
                {catalogItems.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('analytics')}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-primary shadow-xs border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              {t('analytics')}
            </button>

            <button
              onClick={() => handleTabChange('settings')}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-primary shadow-xs border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              {t('settings')}
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ─── LEADS TAB ─── */}
        {activeTab === 'leads' && (
          <div className="space-y-5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap sm:flex-nowrap">
              {[
                { value: 'ALL', label: 'All Leads', count: leads.length },
                { value: 'NEW', label: 'New', count: newLeadsCount },
                { value: 'CONTACTED', label: 'Contacted', count: contactedLeadsCount },
                { value: 'CONVERTED', label: 'Converted', count: convertedLeadsCount },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setLeadFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    leadFilter === f.value
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-800'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {filteredLeads.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-zinc-200 shadow-xs">
                <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 mb-1">No Leads Found</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-4">
                  {leadFilter === 'ALL'
                    ? "You haven't received any customer inquiries yet. Optimize your catalog or share your profile link to get started!"
                    : `No inquiries match the filter "${STATUS_LABELS[leadFilter]}".`}
                </p>
                {leadFilter === 'ALL' && vendor?.slug && (
                  <Button 
                    variant="outline" 
                    className="font-bold gap-2 mx-auto rounded-xl border-zinc-200"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/vendor/${vendor.slug}`);
                      toast.success('Profile link copied to clipboard!');
                    }}
                  >
                    <Copy className="w-4 h-4" /> Copy Profile Link
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map((lead) => (
                  <div
                     key={lead.id}
                     className={`bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden group ${
                       lead.status === 'NEW' ? 'ring-2 ring-primary/10 border-primary/20' : ''
                     }`}
                  >
                    {lead.status === 'NEW' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-zinc-900 text-base leading-tight">
                          {lead.customerName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-zinc-300" />
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      <div className="relative">
                        {isUpdatingStatus === lead.id ? (
                          <div className="flex items-center gap-1 text-[11px] text-zinc-400 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-full">
                            <Loader2 className="w-3 h-3 animate-spin text-zinc-400" /> Updating
                          </div>
                        ) : (
                          <Select
                            value={lead.status}
                            onValueChange={(val) => val && handleLeadStatusChange(lead.id, val)}
                          >
                            <SelectTrigger className={`h-8 text-[11px] font-bold rounded-full border px-2.5 flex gap-1.5 select-none focus:ring-0 ${STATUS_COLORS[lead.status]}`}>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent align="end">
                              <SelectItem value="NEW">🆕 New</SelectItem>
                              <SelectItem value="CONTACTED">💬 Contacted</SelectItem>
                              <SelectItem value="CONVERTED">🤝 Converted</SelectItem>
                              <SelectItem value="REJECTED">🚫 Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="bg-zinc-50 rounded-xl p-3 text-sm border border-zinc-100/50 mt-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-zinc-800 text-[13px] leading-tight">
                          {lead.catalogItem?.title || 'General Service enquiry'}
                        </span>
                        {lead.catalogItem?.price && (
                          <span className="font-bold text-primary text-[13px] whitespace-nowrap">
                            ₹{lead.catalogItem.price}
                          </span>
                        )}
                      </div>
                      {lead.customerRequirement && (
                        <p className="text-zinc-500 text-xs border-t border-zinc-200/50 pt-2 italic leading-relaxed">
                          &ldquo;{lead.customerRequirement}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1 bg-[#25D366] hover:bg-[#128C7E] active:bg-[#075E54] text-white font-bold h-11 rounded-xl shadow-xs gap-1.5 transition-all text-sm"
                        onClick={() => openWhatsApp(lead.customerPhone, lead.customerName, lead.catalogItem?.title)}
                      >
                        <Phone className="h-4.5 w-4.5 fill-current" />
                        WhatsApp Customer
                      </Button>
                    </div>

                    <div className="text-center mt-2">
                      <span className="text-[10px] text-zinc-400 font-bold tracking-wider select-all uppercase">
                        {lead.customerPhone}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SERVICES TAB (CATALOG MANAGER UI) ─── */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-800">My Catalog Services</h2>
                <p className="text-xs text-zinc-400 font-medium">Add or manage services you provide</p>
              </div>
              <Button
                onClick={handleOpenAddCatalog}
                className="rounded-xl font-bold h-10 gap-1 text-xs"
              >
                <Plus className="w-4 h-4" /> Add Service
              </Button>
            </div>

            {catalogItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-zinc-200 shadow-xs">
                <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 mb-1">Catalog is Empty</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-5">
                  Customers can only send inquiries for services listed in your catalog. Add a service to start getting inquiries!
                </p>
                <Button 
                  onClick={handleOpenAddCatalog} 
                  className="rounded-xl font-bold"
                >
                  Create Your First Service
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {catalogItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-4 transition-all relative ${
                      item.isActive ? 'border-zinc-200 hover:border-zinc-300' : 'border-zinc-200/60 bg-zinc-50/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Image Preview Box */}
                      <div className="w-16 h-16 rounded-xl bg-zinc-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200/50">
                        {item.mediaUrl ? (
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-zinc-400" />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-zinc-900 text-sm sm:text-base leading-tight truncate">
                            {item.title}
                          </h3>
                          {item.category?.name && (
                            <span className="inline-flex text-[10px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-150 px-1.5 py-0.5 rounded-md capitalize">
                              {item.category.name}
                            </span>
                          )}
                        </div>
                        {item.description ? (
                          <p className="text-zinc-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        ) : (
                          <p className="text-zinc-300 text-xs italic">No description provided.</p>
                        )}
                      </div>

                      {/* Price tag */}
                      {item.price && (
                        <div className="bg-primary/5 text-primary border border-primary/10 font-extrabold text-sm px-2.5 py-1 rounded-lg shrink-0 select-none">
                          ₹{item.price}
                        </div>
                      )}
                    </div>

                    {/* Bottom Toolbar: Switch & Edit/Delete Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-1.5">
                      {/* Active Status Switch */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold tracking-wide uppercase select-none ${
                          item.isActive ? 'text-emerald-600' : 'text-zinc-400'
                        }`}>
                          {item.isActive ? 'Active' : 'Hidden'}
                        </span>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleToggleItemActive(item.id, item.isActive)}
                        />
                      </div>

                      {/* Action trigger group */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditCatalog(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 text-xs font-semibold transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 text-xs font-semibold transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ANALYTICS TAB ─── */}
        {activeTab === 'analytics' && (() => {
          const totalInquiries = leads.length;
          const pendingActions = leads.filter(l => l.status === 'NEW').length;
          const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
          const calculatedConversionRate = totalInquiries > 0 
            ? Math.round((convertedLeads / totalInquiries) * 100) 
            : 0;

          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-800">Business Analytics</h2>
                <p className="text-xs text-zinc-400 font-medium">Real-time performance metrics</p>
              </div>

              {/* Primary Pipeline Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Inquiries */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden">
                  <div className="space-y-1">
                    <p className="text-zinc-400 text-xs font-bold tracking-wide uppercase">Total Inquiries</p>
                    <p className="text-3xl font-black text-zinc-900">{totalInquiries}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">All-time leads received</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-150">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>

                {/* Pending Actions */}
                <div className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden transition-all ${
                  pendingActions > 0 ? 'border-amber-200 ring-2 ring-amber-500/5' : 'border-zinc-200'
                }`}>
                  <div className="space-y-1">
                    <p className="text-zinc-400 text-xs font-bold tracking-wide uppercase">Pending Actions</p>
                    <p className={`text-3xl font-black ${pendingActions > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>{pendingActions}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Requires your attention</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    pendingActions > 0 
                      ? 'bg-amber-50 border-amber-200 text-amber-600' 
                      : 'bg-zinc-50 border-zinc-150 text-zinc-500'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden col-span-1">
                  <div className="flex items-center justify-between w-full">
                    <div className="space-y-1">
                      <p className="text-zinc-400 text-xs font-bold tracking-wide uppercase">Conversion Rate</p>
                      <p className="text-3xl font-black text-emerald-600">{calculatedConversionRate}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1.5 mt-3">
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-200/50">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${calculatedConversionRate}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                      <span>0%</span>
                      <span>{convertedLeads} of {totalInquiries} Converted</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Discovery Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {/* Profile Views */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4.5 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-[10px] font-bold tracking-wide uppercase">Profile Views</p>
                    <p className="text-2xl font-extrabold text-zinc-900 mt-1">
                      {analytics?.views || 0}
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-5 -mr-4 -mb-4">
                    <Eye className="w-24 h-24" />
                  </div>
                </div>

                {/* Contact Clicks */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4.5 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-[10px] font-bold tracking-wide uppercase">Contact Clicks</p>
                    <p className="text-2xl font-extrabold text-zinc-900 mt-1">
                      {analytics?.totalClicks || 0}
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-5 -mr-4 -mb-4">
                    <Phone className="w-24 h-24" />
                  </div>
                </div>
              </div>

              {/* Contact Breakdown */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Contact Details Breakdown</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#25D366]" /> WhatsApp Inquiries
                    </span>
                    <span className="font-bold text-zinc-800">{analytics?.whatsappClicks || 0} clicks</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Direct Call Clicks
                    </span>
                    <span className="font-bold text-zinc-800">{analytics?.callClicks || 0} clicks</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-500 font-medium">Total Customer Enquiries</span>
                    <span className="font-bold text-primary">{leads.length} leads</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-800">Business Settings</h2>
              <p className="text-xs text-zinc-400 font-medium">Configure profile and operations</p>
            </div>

            {/* Profile Verification Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  vendor?.idVerified 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-800">Identity Verification</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {vendor?.idVerified 
                      ? 'Your business profile is verified and active.' 
                      : 'Verify identity documents to get a verification badge.'}
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-3 flex flex-wrap gap-4 text-xs font-semibold">
                <div className="space-y-0.5">
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Membership Tier</p>
                  <p className="text-zinc-800 flex items-center gap-1 font-bold">
                    <Award className="w-4 h-4 text-amber-500" /> {vendor?.membershipTier || 'Free'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">ID Document Type</p>
                  <p className="text-zinc-800">{vendor?.idType || 'Aadhar Card'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Document ID Number</p>
                  <p className="text-zinc-800 font-mono tracking-widest">{vendor?.idNumber || '•••• •••• ••••'}</p>
                </div>
              </div>
            </div>

            {/* Settings Fields Form */}
            <form onSubmit={handleSettingsSubmit} className="space-y-5">
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-1.5 border-b border-zinc-100 pb-2.5">
                  <Building className="w-4 h-4 text-zinc-400" />
                  Business Profile
                </h3>

                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-xs font-bold text-zinc-700">Business / Pro Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. Rahul Aircon Services"
                    className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                    value={settingsForm.businessName}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, businessName: e.target.value }))}
                    required
                  />
                </div>

                {/* Custom Service Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="customServiceType" className="text-xs font-bold text-zinc-700">Service Specialty Tagline</Label>
                  <Input
                    id="customServiceType"
                    placeholder="e.g. AC Installation & Leakage Repair Specialist"
                    className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                    value={settingsForm.customServiceType}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, customServiceType: e.target.value }))}
                  />
                  <p className="text-[10px] text-zinc-400 font-medium">A short tagline that describes your service expertise.</p>
                </div>

                {/* Locality & Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="localityName" className="text-xs font-bold text-zinc-700">Locality / Area *</Label>
                    <Input
                      id="localityName"
                      placeholder="e.g. Sector 62"
                      className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                      value={settingsForm.localityName}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, localityName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chowkLandmark" className="text-xs font-bold text-zinc-700">Chowk / Landmark</Label>
                    <Input
                      id="chowkLandmark"
                      placeholder="e.g. Near Fortis Hospital"
                      className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                      value={settingsForm.chowkLandmark}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, chowkLandmark: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <Label htmlFor="pincode" className="text-xs font-bold text-zinc-700">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 201301"
                      className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                      value={settingsForm.pincode}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, pincode: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Location Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="locationType" className="text-xs font-bold text-zinc-700">Operation Mode</Label>
                    <select
                      id="locationType"
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none font-medium"
                      value={settingsForm.locationType}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, locationType: e.target.value }))}
                    >
                      <option value="Freelancer">Independent Pro (Freelancer)</option>
                      <option value="Shop">Established Shop / Storefront</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-1.5 border-b border-zinc-100 pb-2.5">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Hours & Availability
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Working Days */}
                  <div className="space-y-1.5">
                    <Label htmlFor="workingDays" className="text-xs font-bold text-zinc-700">Working Days</Label>
                    <Input
                      id="workingDays"
                      placeholder="e.g. Mon - Sat, Every Day"
                      className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                      value={settingsForm.workingDays}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, workingDays: e.target.value }))}
                    />
                  </div>

                  {/* Time Availability */}
                  <div className="space-y-1.5">
                    <Label htmlFor="timeAvailability" className="text-xs font-bold text-zinc-700">Business Hours</Label>
                    <Input
                      id="timeAvailability"
                      placeholder="e.g. 9 AM - 6 PM, 24 Hours"
                      className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                      value={settingsForm.timeAvailability}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, timeAvailability: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-1.5 border-b border-zinc-100 pb-2.5">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  Customize Your Storefront (Themes)
                </h3>
                
                {/* Dynamic Live Preview */}
                <div className={`p-4 rounded-xl border transition-all ${THEME_FLAVORS[settingsForm.themeFlavor as ThemeFlavor]?.colors?.background || 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden" />
                    <div>
                      <div className="font-bold text-sm" style={{ color: 'inherit' }}>{settingsForm.businessName || 'Your Business Name'}</div>
                      <div className="text-xs opacity-70" style={{ color: 'inherit' }}>{settingsForm.customServiceType || 'Your Service'}</div>
                    </div>
                  </div>
                  <div className={`text-[10px] px-2 py-1 inline-flex rounded-full font-bold mb-3 ${THEME_FLAVORS[settingsForm.themeFlavor as ThemeFlavor]?.colors?.badge || 'bg-zinc-100 text-zinc-600'}`}>
                    ✓ Verified Provider
                  </div>
                  <div className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold w-full ${THEME_FLAVORS[settingsForm.themeFlavor as ThemeFlavor]?.colors?.button || 'bg-black text-white'}`}>
                    Request Quote
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.values(THEME_FLAVORS).map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSettingsForm(prev => ({ ...prev, themeFlavor: theme.id }))}
                      className={`relative flex flex-col p-4 rounded-xl border text-left transition-all ${
                        settingsForm.themeFlavor === theme.id 
                          ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' 
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      {theme.isPro && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> PRO
                        </div>
                      )}
                      <span className="text-sm font-bold text-zinc-900">{theme.name}</span>
                      <div className="mt-3 flex gap-2 w-full h-8 rounded-lg overflow-hidden border border-zinc-100">
                        {/* Mini preview blocks */}
                        <div className={`flex-1 ${theme.colors.background}`}></div>
                        <div className={`w-8 ${theme.colors.badge.split(' ')[0]}`}></div>
                        <div className={`w-12 ${theme.colors.button.split(' ')[0]}`}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 z-50 p-4 -mx-5 sm:mx-0 sm:p-0 sm:static bg-white border-t border-zinc-200 sm:border-0 sm:bg-transparent shadow-[0_-10px_30px_rgba(0,0,0,0.05)] sm:shadow-none mt-4">
                <Button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full h-12 rounded-xl text-sm font-bold gap-2 shadow-xs transition-all"
                >
                  {isSavingSettings ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving Settings...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Save Business Profile</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ─── ADD/EDIT CATALOG ITEM DRAWER ─── */}
      <Drawer open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg p-5">
            <DrawerHeader className="px-0 pt-0">
              <DrawerTitle className="text-lg font-bold text-zinc-900">
                {catalogForm.id ? 'Edit Service Details' : 'Add New Service'}
              </DrawerTitle>
              <DrawerDescription>
                Provide details for the service. It will be immediately visible to users.
              </DrawerDescription>
            </DrawerHeader>

            <form onSubmit={handleCatalogSubmit} className="space-y-4 mt-2">
              {/* Service Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold text-zinc-700">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Ceiling Fan Installation, AC Deep Cleaning"
                  className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                  value={catalogForm.title}
                  onChange={(e) => setCatalogForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-bold text-zinc-700">Price (₹)</Label>
                  <Input
                    id="price"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 499"
                    className="h-11 rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                    value={catalogForm.price}
                    onChange={(e) => setCatalogForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-zinc-700">Category *</Label>
                  <select
                    id="category"
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none font-medium"
                    value={catalogForm.categoryId}
                    onChange={(e) => setCatalogForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    required
                  >
                    <option value="">Choose category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-zinc-700">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is included in this service? (e.g. Clean filters, clean condenser coil, clear drainage pipe, test efficiency)"
                  rows={3}
                  className="rounded-xl bg-white border-zinc-200 text-sm focus-visible:ring-primary focus-visible:border-primary"
                  value={catalogForm.description}
                  onChange={(e) => setCatalogForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Image Upload Input */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700">Service Banner Image</Label>
                <div className="flex items-center gap-4">
                  {/* File preview */}
                  <div className="w-16 h-16 rounded-xl bg-zinc-50 border border-zinc-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 cursor-pointer shadow-xs transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {selectedFile ? 'Change Image' : 'Select Photo'}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1.5">Support PNG, JPG, or JPEG formats. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <DrawerClose asChild>
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl text-sm font-bold">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  disabled={isSubmittingCatalog}
                  className="flex-1 h-12 rounded-xl text-sm font-bold gap-2"
                >
                  {isSubmittingCatalog ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Save Service</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ─── DELETE CONFIRMATION DIALOG/OVERLAY ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-all duration-300">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-sm w-full p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900">Delete this Service?</h3>
            <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-zinc-800">"{deleteTarget.title}"</span>? This will permanently remove it from your catalog, and this action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
              >
                No, Keep it
              </button>
              
              <button
                onClick={handleDeleteItem}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
