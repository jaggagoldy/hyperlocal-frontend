'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, Settings, QrCode, Smartphone, ExternalLink, Save, MapPin, AlertCircle, Copy, Check, Image as ImageIcon, FileUp, Trash2 } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function WorkspaceSettingsPage() {
  const { activeBusinessId } = useAuthStore();
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    localityName: '',
    chowkLandmark: '',
    phone: '',
    isActive: true,
    workingDays: '',
    timeAvailability: '',
    connectionMode: 'REQUIRE_APPROVAL',
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    const currentDays = formData.workingDays ? formData.workingDays.split(', ') : [];
    if (currentDays.includes(day)) {
      setFormData({ ...formData, workingDays: currentDays.filter(d => d !== day).join(', ') });
    } else {
      // Sort days logically if needed, but simple append is fine
      setFormData({ ...formData, workingDays: [...currentDays, day].join(', ') });
    }
  };

  useEffect(() => {
    if (!activeBusinessId) return;
    fetchBusinessDetails();
  }, [activeBusinessId]);

  const fetchBusinessDetails = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/business/me/list');
      const bizList = res.data?.data || [];
      const currentBiz = bizList.find((b: any) => b.id === activeBusinessId);
      if (currentBiz) {
        setBusiness(currentBiz);
        const profileMedia = currentBiz.media?.find((m: any) => m.type === 'profile_image');
        setMediaPreview(profileMedia?.secureUrl || null);

        setFormData({
          businessName: currentBiz.businessName || '',
          localityName: currentBiz.localityName || '',
          chowkLandmark: currentBiz.chowkLandmark || '',
          phone: currentBiz.user?.phoneNumber || currentBiz.phone || '',
          isActive: currentBiz.isActive !== false,
          workingDays: currentBiz.workingDays || '',
          timeAvailability: currentBiz.timeAvailability || '',
          connectionMode: currentBiz.connectionMode || 'REQUIRE_APPROVAL',
        });
        
        if (currentBiz.timeAvailability) {
          const [open, close] = currentBiz.timeAvailability.split(' - ');
          setOpenTime(open || '');
          setCloseTime(close || '');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Upload media if changed
      if (mediaFile) {
        const mediaForm = new FormData();
        mediaForm.append('vendorId', activeBusinessId!);
        mediaForm.append('type', 'profile_image');
        mediaForm.append('file', mediaFile);
        
        await apiClient.post('/media/upload', mediaForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const finalTime = openTime && closeTime ? `${openTime} - ${closeTime}` : formData.timeAvailability;
      await apiClient.patch(`/business/update`, { ...formData, timeAvailability: finalTime }, { headers: { 'x-business-id': activeBusinessId }});
      toast.success('Business settings updated successfully!');
      fetchBusinessDetails();
      setMediaFile(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Storefront link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  if (!business) return null;

  // Derive the storefront URL
  const storePath = `/${business.cityName?.toLowerCase() || 'city'}/${business.slug || business.id}`;
  const storeUrl = `https://nearbybazar.com${storePath}`; // In dev, we can display this visually but it's mock
  // For actual QR code, we'll use the window.location.origin
  const localStoreUrl = typeof window !== 'undefined' ? `${window.location.origin}${storePath}` : storeUrl;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Business Settings</h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">Manage your active storefront details and generate your White-labeled App.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: GENERAL SETTINGS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
              <Settings className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-zinc-900">General Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex gap-6 items-start">
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Storefront Name</label>
                    <input 
                      type="text" 
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Primary Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="w-32 h-32 shrink-0">
                  <label className="block text-sm font-bold text-zinc-700 mb-2 text-center">Business Image</label>
                  {mediaPreview ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden group border-2 border-zinc-200">
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => { setMediaPreview(null); setMediaFile(null); }} className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <FileUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 mt-1">Upload Photo</span>
                      <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setMediaFile(file);
                          setMediaPreview(URL.createObjectURL(file));
                        }
                      }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = formData.workingDays?.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            isSelected ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' : 'bg-zinc-100 text-zinc-500 border-2 border-transparent hover:bg-zinc-200'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Opening Time</label>
                    <input 
                      type="time" 
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Closing Time</label>
                    <input 
                      type="time" 
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Locality / Area Name</label>
                  <input 
                    type="text" 
                    value={formData.localityName}
                    onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Chowk / Landmark</label>
                  <input 
                    type="text" 
                    value={formData.chowkLandmark}
                    onChange={(e) => setFormData({ ...formData, chowkLandmark: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <div>
                  <h4 className="font-bold text-zinc-900">Operating Status</h4>
                  <p className="text-sm text-zinc-500 font-medium">Turn off to temporarily stop receiving orders.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {business.businessType !== 'FOOD_BEVERAGE' && (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-zinc-900">Lead Generation Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Connection Mode</label>
                  <p className="text-xs text-zinc-500 mb-4 font-medium">Choose how customers can contact you.</p>
                  
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.connectionMode === 'DIRECT' ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}>
                      <input 
                        type="radio" 
                        name="connectionMode"
                        value="DIRECT"
                        checked={formData.connectionMode === 'DIRECT'}
                        onChange={(e) => setFormData({ ...formData, connectionMode: e.target.value })}
                        className="mt-1 w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-600"
                      />
                      <div>
                        <span className="text-sm font-bold text-zinc-900 block">Direct Connect</span>
                        <span className="text-xs font-medium text-zinc-500 block mt-0.5">Users can call or WhatsApp you instantly.</span>
                      </div>
                    </label>
                    
                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.connectionMode === 'REQUIRE_APPROVAL' ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}>
                      <input 
                        type="radio" 
                        name="connectionMode"
                        value="REQUIRE_APPROVAL"
                        checked={formData.connectionMode === 'REQUIRE_APPROVAL'}
                        onChange={(e) => setFormData({ ...formData, connectionMode: e.target.value })}
                        className="mt-1 w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-600"
                      />
                      <div>
                        <span className="text-sm font-bold text-zinc-900 block">Require Approval (Recommended)</span>
                        <span className="text-xs font-medium text-zinc-500 block mt-0.5">Users must send a booking request. Contact details remain hidden until you accept.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
            <h3 className="text-rose-800 font-bold flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-rose-600 text-sm font-medium mb-4">Deleting this business profile will remove all catalogs, leads, and analytics associated with it.</p>
            <button className="bg-white border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm">
              Delete Business Profile
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: WHITE-LABELED PWA & QR CODE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden relative">
            {/* Abstract Background Design */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-600/20 to-transparent"></div>
            
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-2 text-white mb-6">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold">Your Official App</h2>
              </div>

              <p className="text-zinc-400 text-sm font-medium mb-6">
                Let customers install <strong className="text-white">{business.businessName}</strong> directly on their phones! Have them scan this QR code.
              </p>

              <div className="bg-white p-4 rounded-2xl w-full aspect-square flex items-center justify-center mx-auto max-w-[240px] mb-6 shadow-inner">
                <QRCode 
                  value={`${localStoreUrl}?pwa=true`} 
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Storefront Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/30 text-emerald-400 text-xs font-mono p-2.5 rounded-lg truncate border border-zinc-800">
                    {storeUrl}
                  </div>
                  <button 
                    onClick={() => handleCopyLink(localStoreUrl)}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a 
                    href={localStoreUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* App Icon Preview */}
            <div className="bg-black/40 p-4 border-t border-zinc-800/50 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/50 flex-shrink-0 overflow-hidden border-2 border-emerald-400">
                 {mediaPreview ? (
                   <img src={mediaPreview} alt="App Icon" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-white font-black text-xl">{business.businessName?.charAt(0)}</span>
                 )}
               </div>
               <div>
                 <h4 className="text-white font-bold text-sm leading-tight">App Icon Preview</h4>
                 <p className="text-zinc-500 text-xs mt-0.5">This will appear on their home screen.</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
