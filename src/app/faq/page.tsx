'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, ChevronDown, MessageSquare, ArrowRight, Store, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: any;
  items: FaqItem[];
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndices, setExpandedIndices] = useState<Record<string, boolean>>({});

  const faqData: FaqCategory[] = [
    {
      id: 'customer',
      label: 'For Customers',
      icon: User,
      items: [
        {
          question: "How do I find local shops or service providers near me?",
          answer: "On the NearByBazar homepage or explore view, select your active district (e.g., Gurugram, Ludhiana, Karnal). You can then browse the 16 category verticals or search for specific products, dishes, or businesses directly. You can also toggle the 'Radar Map' view to visually scan service professionals and stores near your location."
        },
        {
          question: "Is there a service booking or order placement commission fee?",
          answer: "No. NearByBazar is a 100% commission-free marketplace discovery engine. We do not process transactions or charge customers for booking slots or placing orders. You deal with and pay the local merchant directly."
        },
        {
          question: "How does the 'Quick Schedule' booking system work?",
          answer: "For bookable categories like Salons, Fitness, or Health, listing cards display a 'Quick Book' or 'Book' CTA. Clicking this opens a scheduler drawer showing the vendor's catalog. Select the desired service, choose an available date and time slot, enter your name/phone details, and submit. The lead is sent directly to the merchant, who will call or WhatsApp you to confirm."
        },
        {
          question: "How do I add restaurant dishes or grocery items to my cart?",
          answer: "In Food & Dining or Grocery explore tabs, select 'Dishes' or 'Products'. You can add catalog items directly from the search cards. A sticky bottom Cart Bar will appear showing your selected items. Click checkout to review your items, enter delivery notes, and finalize your order directly with the vendor."
        },
        {
          question: "Can I contact the business owner directly before booking?",
          answer: "Yes. Every verified listing card displays call and/or WhatsApp buttons. You can click these to dial the business directly or chat with them on WhatsApp for custom requirements or pricing inquiries."
        }
      ]
    },
    {
      id: 'merchant',
      label: 'For Merchants',
      icon: Store,
      items: [
        {
          question: "How do I register my business and list my catalog?",
          answer: "Click the 'Register Your Shop' button in the footer or navigate to '/vendor/register'. Create an account, input your business name and select your vertical, and then access your Vendor Dashboard. You can easily add catalog products or services, set prices, and list service slot durations."
        },
        {
          question: "What is a 'Business Claim' and how does it work?",
          answer: "We import public registry stubs (e.g., from OpenStreetMap) to help users find local services. If you locate your own business listing on NearByBazar marked as 'Unclaimed', click the 'Claim this listing' button. You will be prompted to verify ownership and gain full control over the listing to customize details."
        },
        {
          question: "How do the multi-theme templates work for my storefront?",
          answer: "Inside the Vendor Dashboard App Builder, you can choose from 2-3 premium styled layout templates and color accent themes matching your vertical (e.g., Luxe Dark for premium salons, Clean Academic for coaching centers, Classic Wellness for gyms). Once selected, your public vCard link will automatically display that custom theme to visitors."
        },
        {
          question: "Do I have to pay transaction fees or commissions on orders?",
          answer: "No. NearByBazar charges zero transaction fees or commissions on customer inquiries, bookings, or catalog orders. If you wish to upgrade to premium capabilities like AI Whatsapp automation or customized domains, you can select one of our premium Pro Storefront subscriptions."
        },
        {
          question: "How do I receive customer booking requests or leads?",
          answer: "When a customer submits a lead, booking, or catalog order, it is instantly routed to your Vendor Dashboard under the 'Leads' or 'Orders' tab. You also receive email alerts and, if configured, WhatsApp notifications containing the customer's details and requirements so you can coordinate directly."
        }
      ]
    }
  ];

  const toggleExpand = (catId: string, idx: number) => {
    const key = `${catId}-${idx}`;
    setExpandedIndices(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return faqData;

    return faqData.map(cat => {
      const items = cat.items.filter(
        item => 
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, items };
    }).filter(cat => cat.items.length > 0);
  };

  const filteredData = getFilteredCategories();
  const currentCategory = filteredData.find(c => c.id === activeTab) || filteredData[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pt-20 pb-16 px-6 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <HelpCircle className="w-5.5 h-5.5" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Frequently Asked FAQs</h1>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            Got questions? We've gathered answers to the most common queries about ordering, booking appointments, claiming listings, and setting up storefronts.
          </p>
        </div>

        {/* Real-time search bar */}
        <div className="relative max-w-md mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <Input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 bg-zinc-900/60 border-zinc-850 focus:border-emerald-500 rounded-xl h-12 text-sm font-semibold text-white placeholder-zinc-500"
          />
        </div>

        {/* Categories Tab selector (only show if not searching or if search results match both) */}
        {!searchQuery && (
          <div className="flex justify-center gap-3">
            {faqData.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md shadow-emerald-500/10' 
                      : 'bg-zinc-900/40 text-zinc-400 border-zinc-900 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {searchQuery ? (
            // Search Results Layout
            filteredData.length > 0 ? (
              filteredData.map(cat => (
                <div key={cat.id} className="space-y-4">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 border-b border-zinc-900 pb-1 mt-4">
                    {cat.label}
                  </span>
                  
                  {cat.items.map((item, idx) => {
                    const isExpanded = !!expandedIndices[`${cat.id}-${idx}`];
                    return (
                      <div 
                        key={idx} 
                        className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleExpand(cat.id, idx)}
                          className="w-full text-left p-5 flex items-start justify-between gap-4"
                        >
                          <h4 className="font-extrabold text-sm sm:text-base text-zinc-100 leading-snug">
                            {item.question}
                          </h4>
                          <span className={`w-5 h-5 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center shrink-0 text-zinc-400 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-emerald-400 border-emerald-500/20' : ''
                          }`}>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </span>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed border-t border-zinc-900/45 animate-in fade-in slide-in-from-top-1 duration-200">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-zinc-900/20 border border-zinc-900 rounded-3xl space-y-3">
                <p className="text-sm text-zinc-500 font-bold">No FAQs matched "{searchQuery}"</p>
                <Button 
                  onClick={() => setSearchQuery('')}
                  className="bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-850 font-bold text-xs px-4 h-9 rounded-lg"
                >
                  Clear Search
                </Button>
              </div>
            )
          ) : (
            // Category Tab Layout
            currentCategory && currentCategory.items.map((item, idx) => {
              const isExpanded = !!expandedIndices[`${currentCategory.id}-${idx}`];
              return (
                <div 
                  key={idx} 
                  className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300"
                >
                  <button
                    onClick={() => toggleExpand(currentCategory.id, idx)}
                    className="w-full text-left p-5 flex items-start justify-between gap-4"
                  >
                    <h4 className="font-extrabold text-sm sm:text-base text-zinc-100 leading-snug">
                      {item.question}
                    </h4>
                    <span className={`w-5 h-5 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center shrink-0 text-zinc-400 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-emerald-400 border-emerald-500/20' : ''
                    }`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed border-t border-zinc-900/45 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support CTA footer card */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-extrabold text-lg text-white flex items-center justify-center sm:justify-start gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Still have questions?
            </h3>
            <p className="text-xs text-zinc-450 font-semibold max-w-sm">
              If your question isn't answered here, send a direct ticket to our customer support desk and we'll reply shortly.
            </p>
          </div>

          <Link href="/contact" className="shrink-0">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-6 h-11 rounded-xl shadow-md shadow-emerald-500/10 transition-all inline-flex items-center gap-2 text-xs uppercase tracking-wider">
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
