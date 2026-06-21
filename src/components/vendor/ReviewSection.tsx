'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Review {
  id: string;
  rating: number;
  content: string;
  authorName: string;
  createdAt: string;
}

interface ReviewSectionProps {
  vendorId: string;        // BusinessProfile id (API param is named vendorId for legacy reasons)
  ratingAvg?: number;      // aggregate from BusinessProfile.rating; falls back to computed avg
}

// Backend GET /reviews/vendor/:id returns { id, rating, comment, createdAt, customer:{ name, customerName } }.
// Normalise it to the shape this component renders.
function mapReview(r: any): Review {
  return {
    id: r.id,
    rating: r.rating ?? 0,
    content: r.comment ?? r.content ?? '',
    authorName: r.customer?.customerName || r.customer?.name || r.authorName || 'A customer',
    createdAt: r.createdAt,
  };
}

export function ReviewSection({ vendorId, ratingAvg }: ReviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // The review list (public — no auth required).
  const loadReviews = async () => {
    try {
      const res = await apiClient.get(`/reviews/vendor/${vendorId}`);
      const list = res.data?.data ?? res.data ?? [];
      setReviews(Array.isArray(list) ? list.map(mapReview) : []);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    setLoadingReviews(true);
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  // Review count + average derive from the fetched list (avg falls back to the prop).
  const reviewCount = reviews.length;
  const computedAvg = reviewCount > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const displayAvg = ratingAvg && ratingAvg > 0 ? ratingAvg : computedAvg;

  useEffect(() => {
    const checkEligibility = async () => {
      if (!isAuthenticated) {
        setCheckingEligibility(false);
        return;
      }
      try {
        const res = await apiClient.get(`/orders/eligibility?businessProfileId=${vendorId}`);
        if (res.data.status === 'success') {
          setIsEligible(res.data.data.eligible);
        }
      } catch (e) {
        setIsEligible(false);
      } finally {
        setCheckingEligibility(false);
      }
    };
    checkEligibility();
  }, [vendorId, isAuthenticated]);

  const handleOpenChange = (open: boolean) => {
    if (open && !isAuthenticated) {
      toast.error('Please login to write a review');
      router.push('/login');
      return;
    }
    setIsOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/reviews`, { vendorId, rating, content });
      toast.success('Review submitted successfully!');
      setIsOpen(false);
      setRating(0);
      setContent('');
      await loadReviews(); // reflect the new review immediately
    } catch (error: any) {
      // 403 = backend gate (no COMPLETED order); show its message and lock the form.
      if (error.response?.status === 403) {
        setIsEligible(false);
        setIsOpen(false);
        toast.error(error.response?.data?.message || 'You can only review businesses you have ordered from.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit review.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="ml-1 font-bold text-lg">{displayAvg.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground text-sm">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>

        {checkingEligibility ? (
          <Button variant="outline" className="h-10 font-semibold rounded-lg" disabled>Checking...</Button>
        ) : !isEligible ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <Lock className="w-4 h-4" />
            <span>You can only review restaurants you have ordered from.</span>
          </div>
        ) : (
          <Drawer open={isOpen} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="h-10 font-semibold rounded-lg">Write Review</Button>
            </DrawerTrigger>
            <DrawerContent>
              <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Rate & Review</DrawerTitle>
                  <DrawerDescription>Share your experience with this vendor.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0 flex flex-col gap-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`w-10 h-10 transition-colors ${
                            star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea 
                    placeholder="Tell us more about your experience (optional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[100px] text-base rounded-xl"
                  />
                </div>
                <DrawerFooter>
                  <Button type="submit" disabled={submitting} className="h-12 text-lg rounded-xl">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="h-12 text-lg rounded-xl">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      <div className="space-y-4">
        {loadingReviews ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/30" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4 bg-muted/30 rounded-xl">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-muted/30 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{review.authorName}</span>
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-1.5 py-0.5 rounded text-xs font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{review.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
