import {
  Check,
  CreditCard,
  Crown,
  Info,
  Landmark,
  Loader2,
  Smartphone,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../contexts/AuthContext";
import { paymentApi, referralApi, userApi } from "../utils/api";
import { loadRazorpayScript, openRazorpayCheckout } from "../utils/razorpay";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Referral code state
  const [referralCode, setReferralCode] = useState("");
  const [referralApplied, setReferralApplied] = useState(false);
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsApplyingReferral(true);
    try {
      // Prepend PIXEL- prefix to the code
      const fullCode = `PIXEL-${referralCode.trim().toUpperCase()}`;

      // First validate the code
      const validation = await referralApi.validate(fullCode);

      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }

      // Then apply it
      await referralApi.apply(fullCode);
      setReferralApplied(true);
      setReferrerName(validation.referrerName);
      toast.success("Referral code applied! You get 10% off.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply referral code");
    } finally {
      setIsApplyingReferral(false);
    }
  };

  const handleGetPremium = async () => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order on backend
      const orderData = await paymentApi.createOrder();

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Step 3: Open Razorpay checkout
      const paymentResponse = await openRazorpayCheckout({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PixelPerfect Cropper",
        description: "Premium - Remove Watermarks",
        order_id: orderData.orderId,
        prefill: {
          name: user.name || undefined,
          email: user.email,
        },
        theme: {
          color: "#8b5cf6", // Brand violet color
        },
      });

      // Step 4: Verify payment on backend
      const result = await userApi.upgradeToPremium({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      // Step 5: Update user state
      if (result.success) {
        updateUser({ isPremium: true });
        toast.success("Welcome to Premium! Watermarks removed.");
        onClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Payment cancelled by user") {
          // User closed the payment modal - no error toast needed
          return;
        }
        toast.error(error.message);
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-linear-to-br from-amber-500/20 to-yellow-500/10 rounded-xl border border-amber-400/20">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Go Premium</h2>
            <p className="text-xs text-slate-500">One-time purchase</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-5">
          Export your images without watermarks. Pay once, use forever.
        </p>

        {/* Benefits */}
        <div className="space-y-2.5 mb-5">
          {["No watermarks on exports", "Lifetime access", "Support development"].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5 text-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Referral code input */}
        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
            <Tag className="w-3.5 h-3.5" />
            Have a referral code?
            <div className="relative group ml-0.5">
              <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-10">
                <div className="font-medium text-white mb-1">Get 10% off!</div>
                <p className="text-slate-400 leading-relaxed">
                  Enter a friend's referral code to save ₹30 on your Premium purchase.
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-700"></div>
              </div>
            </div>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 select-none">
                <span className="px-1.5 py-0.5 bg-slate-700/80 rounded text-xs font-mono text-slate-400">
                  PIXEL
                </span>
                <span className="text-slate-500 text-sm">-</span>
              </div>
              <input
                value={referralCode}
                onChange={(e) =>
                  setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                }
                placeholder="Enter code"
                maxLength={6}
                disabled={referralApplied || isLoading}
                className="w-full pl-19 pr-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-sm uppercase placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleApplyReferral}
              disabled={!referralCode.trim() || referralApplied || isApplyingReferral || isLoading}
              className="px-4 py-2.5 bg-violet-500/20 hover:bg-violet-500/30 active:bg-violet-500/40 disabled:bg-violet-500/10 text-violet-400 disabled:text-violet-400/50 rounded-xl text-sm font-medium transition-all disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isApplyingReferral ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : referralApplied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {referralApplied && (
            <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" />
              10% discount applied{referrerName ? ` from ${referrerName}` : ""}!
            </p>
          )}
        </div>

        {/* Price card */}
        <div className="bg-linear-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 mb-5 border border-slate-700/50">
          <div className="flex items-baseline gap-1.5">
            {referralApplied ? (
              <>
                <span className="text-lg line-through text-slate-500">₹299</span>
                <span className="text-3xl font-bold text-white">₹269</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-white">₹299</span>
            )}
            <span className="text-slate-500 text-sm">one-time</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">No subscription, no hidden fees</p>
        </div>

        {/* Payment methods hint */}
        <div className="flex items-center justify-center gap-4 mb-5 text-slate-500">
          <div className="flex items-center gap-1.5 text-xs">
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cards</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Landmark className="w-3.5 h-3.5" />
            <span>Netbanking</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGetPremium}
            disabled={isLoading}
            className="w-full py-3.5 bg-linear-to-r from-violet-600 via-violet-500 to-purple-500 hover:from-violet-500 hover:via-violet-400 hover:to-purple-400 disabled:from-violet-600/50 disabled:via-violet-500/50 disabled:to-purple-500/50 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                Get Premium
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Maybe Later
          </button>
        </div>

        {/* Security note */}
        <p className="text-center text-[10px] text-slate-600 mt-4">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
}
