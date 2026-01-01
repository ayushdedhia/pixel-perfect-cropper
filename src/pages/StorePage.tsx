import { ArrowLeft, Coins, Loader2, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import logoSvg from "../assets/brand/logo.svg";
import { CreditDisplay } from "../components/CreditDisplay";
import { UserMenu } from "../components/UserMenu";
import { PremiumModal } from "../components/PremiumModal";
import { useAuth } from "../contexts/AuthContext";
import { creditsApi, type CreditPack } from "../utils/api";
import { loadRazorpayScript, openRazorpayCheckout } from "../utils/razorpay";

export function StorePage() {
  const { user, wallet, updateWallet } = useAuth();
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await creditsApi.getPacks();
        setPacks(response.packs);
      } catch (error) {
        console.error("Failed to fetch credit packs:", error);
        toast.error("Failed to load credit packs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPacks();
  }, []);

  const handlePurchase = async (pack: CreditPack) => {
    if (purchasingPackId) return;
    setPurchasingPackId(pack.id);

    try {
      // Create order
      const order = await creditsApi.createOrder(pack.id);

      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Open Razorpay checkout
      const paymentResponse = await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "PixelPerfect Cropper",
        description: `${pack.name} - ${pack.totalCredits} Credits`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#8b5cf6",
        },
      });

      // Verify payment
      const result = await creditsApi.verifyPurchase({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        packId: pack.id,
      });

      // Update wallet
      updateWallet({ balance: result.newBalance });
      toast.success(`Successfully purchased ${result.creditsGranted} credits!`);
    } catch (error) {
      console.error("Purchase failed:", error);
      if (error instanceof Error && error.message !== "Payment cancelled by user") {
        toast.error("Purchase failed. Please try again.");
      }
    } finally {
      setPurchasingPackId(null);
    }
  };

  const getPackIcon = (index: number) => {
    const icons = [Coins, Zap, Sparkles, Sparkles];
    const Icon = icons[index] || Coins;
    return <Icon className="w-6 h-6" />;
  };

  const getPackColor = (index: number) => {
    const colors = [
      "from-slate-600 to-slate-700",
      "from-blue-600 to-blue-700",
      "from-violet-600 to-purple-600",
      "from-amber-500 to-orange-500",
    ];
    return colors[index] || colors[0];
  };

  const getPackBadge = (index: number) => {
    if (index === 2) return "Popular";
    if (index === 3) return "Best Value";
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <img src={logoSvg} alt="PixelCropper" className="w-8 h-8" />
              <h1 className="text-lg font-bold">Credit Store</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditDisplay />
            <UserMenu onOpenPremiumModal={() => setShowPremiumModal(true)} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Wallet Overview */}
        {wallet && (
          <div className="mb-8 p-6 bg-gradient-to-br from-violet-950/50 to-slate-900/50 rounded-2xl border border-violet-500/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Your Balance</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-8 h-8 text-amber-400" />
                  <span className="text-4xl font-bold">{wallet.balance}</span>
                  <span className="text-slate-400 text-lg">credits</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Monthly Refresh</p>
                <p className="text-lg font-semibold">
                  {wallet.monthlyCreditsRemaining} / {wallet.monthlyCreditsLimit}
                </p>
                <p className="text-xs text-slate-500">
                  Resets in {wallet.daysUntilReset} days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Credit Packs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6">Buy Credits</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packs.map((pack, index) => {
                const badge = getPackBadge(index);
                const isPurchasing = purchasingPackId === pack.id;

                return (
                  <div
                    key={pack.id}
                    className={`relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 ${
                      badge ? "ring-2 ring-violet-500/50" : ""
                    }`}
                  >
                    {badge && (
                      <div className="absolute top-0 right-0 bg-violet-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {badge}
                      </div>
                    )}

                    <div className={`p-6 bg-gradient-to-br ${getPackColor(index)}`}>
                      <div className="flex items-center gap-3 text-white">
                        {getPackIcon(index)}
                        <span className="text-xl font-bold">{pack.name}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">{pack.credits}</span>
                          {pack.bonusCredits > 0 && (
                            <span className="text-emerald-400 font-semibold">
                              +{pack.bonusCredits}
                            </span>
                          )}
                          <span className="text-slate-400 text-sm ml-1">credits</span>
                        </div>
                        {pack.bonusCredits > 0 && (
                          <p className="text-xs text-emerald-400 mt-1">
                            Bonus credits included!
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <span className="text-2xl font-bold">{pack.priceFormatted}</span>
                      </div>

                      <button
                        onClick={() => handlePurchase(pack)}
                        disabled={isPurchasing || !!purchasingPackId}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Buy Now"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-bold mb-4">How Credits Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-400">
            <div>
              <p className="font-semibold text-white mb-2">Export Costs</p>
              <ul className="space-y-1">
                <li>Base export: 2 credits</li>
                <li>Premium format (WebP): +1 credit</li>
                <li>High-quality JPEG: +1 credit</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Monthly Refresh</p>
              <ul className="space-y-1">
                <li>Free users: 50 credits/month</li>
                <li>Premium: 150 credits/month</li>
                <li>Purchased credits never expire</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Premium Benefits</p>
              <ul className="space-y-1">
                <li>Free watermark removal</li>
                <li>3x monthly credits</li>
                <li>One-time payment of Rs 299</li>
              </ul>
            </div>
          </div>

          {!user?.isPremium && (
            <button
              onClick={() => setShowPremiumModal(true)}
              className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade to Premium - Rs 299
            </button>
          )}
        </div>
      </main>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
