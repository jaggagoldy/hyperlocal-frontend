'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Tag, Shield, Megaphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NotifPref {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  enabled: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();

  const [prefs, setPrefs] = useState<NotifPref[]>([
    {
      id: 'new_matches',
      icon: Bell,
      iconBg: 'bg-primary/8',
      iconColor: 'text-primary',
      title: 'New Matches & Updates',
      desc: 'Get notified when a service provider responds to your enquiry.',
      enabled: true,
    },
    {
      id: 'promotions',
      icon: Tag,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      title: 'Promotions & Offers',
      desc: 'Receive exclusive deals and seasonal discounts from top pros.',
      enabled: false,
    },
    {
      id: 'announcements',
      icon: Megaphone,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      title: 'Platform Announcements',
      desc: 'Stay informed about new features and platform updates.',
      enabled: true,
    },
    {
      id: 'security',
      icon: Shield,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      title: 'Security Alerts',
      desc: 'Be alerted about new logins and important account activity.',
      enabled: true,
    },
  ]);

  const toggle = (id: string) => {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Notifications</h1>
          <p className="text-zinc-500 text-sm mb-8">Choose what you want to hear about</p>

          <div className="space-y-3">
            {prefs.map((pref) => (
              <div
                key={pref.id}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${pref.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <pref.icon className={`w-5 h-5 ${pref.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">{pref.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{pref.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={() => toggle(pref.id)}
                  className="ml-4 flex-shrink-0"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-400 text-center mt-6">
            Notification preferences are saved locally. Push notifications coming in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
