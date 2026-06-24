'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'customer',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toast.success('Your message has been sent successfully!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pt-20 pb-16 px-6 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Get In Touch</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">We're here to help</h1>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            Have questions about catalog settings, booking systems, or finding merchants? Send us a message and our local support team will respond shortly.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Info Cards (lg:span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6.5 space-y-6 backdrop-blur-md">
              <h3 className="font-extrabold text-lg text-white">Support Channels</h3>
              
              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Email Support", val: "support@nearbybazar.in", href: "mailto:support@nearbybazar.in" },
                  { icon: Phone, label: "Helpline Hotline", val: "+91-8929294892", href: "tel:+918929294892" },
                  { icon: MapPin, label: "Headquarters Office", val: "NearByBazar Technologies, Tech Hub Sector-62, Haryana, India", href: "#" },
                  { icon: Clock, label: "Active Support Hours", val: "Monday – Saturday, 9:00 AM – 7:00 PM IST", href: "" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                      <item.icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider leading-none mb-1">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-zinc-300 font-bold hover:text-emerald-400 transition-colors break-words">
                          {item.val}
                        </a>
                      ) : (
                        <p className="text-sm text-zinc-300 font-bold break-words">{item.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Focus Callout */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 space-y-2">
              <span className="inline-block text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/10 tracking-widest">
                Regional Hubs
              </span>
              <h4 className="font-extrabold text-sm text-white">Punjab & Haryana Onboarding Centers</h4>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                We operate physical vendor registration and verification kiosks across Gurugram, Karnal, Panipat, Ludhiana, Jalandhar, and Amritsar.
              </p>
            </div>

          </div>

          {/* Column 2: Form/Success Card (lg:span-7) */}
          <div className="lg:col-span-7">
            
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden min-h-[460px] flex items-center">
              
              {!isSent ? (
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xl text-white">Send Inquiries</h3>
                    <p className="text-xs text-zinc-550 font-semibold">We typically reply within 2 hours during working periods.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">Your Name *</label>
                      <Input
                        required
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-zinc-950 border-zinc-850 focus:border-emerald-500 rounded-xl h-11 text-sm font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">Email Address *</label>
                      <Input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-zinc-950 border-zinc-850 focus:border-emerald-500 rounded-xl h-11 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">Reason for Contact</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl h-11 px-3 text-sm font-semibold text-zinc-300 focus:outline-none"
                    >
                      <option value="customer">Customer Support & Queries</option>
                      <option value="vendor">Storefront Onboarding / Claims</option>
                      <option value="advertising">Merchant Ads & Premium Tiers</option>
                      <option value="other">General / Others</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">Message *</label>
                    <Textarea
                      required
                      rows={5}
                      placeholder="Write your requirement or questions here..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="bg-zinc-950 border-zinc-850 focus:border-emerald-500 rounded-xl text-sm font-semibold resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black h-12 rounded-xl shadow-lg shadow-emerald-500/10 transition-all inline-flex items-center justify-center gap-2 active:scale-98 disabled:opacity-55"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="w-full text-center space-y-6 py-12 animate-in fade-in zoom-in-95 duration-500">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-xl shadow-emerald-500/5">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-2xl text-white">Message Received!</h3>
                    <p className="text-xs text-zinc-450 max-w-sm mx-auto font-semibold leading-relaxed">
                      Thank you for contacting us, <span className="text-white font-bold">{formData.name}</span>. A support ticket has been registered, and we will email you back shortly.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        setIsSent(false);
                        setFormData({ name: '', email: '', subject: 'customer', message: '' });
                      }}
                      className="bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-850 px-6 h-10 rounded-xl font-bold text-xs"
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
