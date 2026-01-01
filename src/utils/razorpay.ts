/**
 * Razorpay Checkout Integration
 * Handles loading the Razorpay script and opening the checkout modal
 */

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let scriptLoaded = false;
let scriptLoading: Promise<boolean> | null = null;

/**
 * Load the Razorpay checkout script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  // If already loaded, return immediately
  if (scriptLoaded && window.Razorpay) {
    return Promise.resolve(true);
  }

  // If currently loading, return the existing promise
  if (scriptLoading) {
    return scriptLoading;
  }

  // Start loading the script
  scriptLoading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = null;
      resolve(true);
    };

    script.onerror = () => {
      scriptLoading = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return scriptLoading;
}

/**
 * Open Razorpay checkout modal
 * @param options Razorpay checkout options
 * @returns Promise that resolves with payment response or rejects on cancel/error
 */
export function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "handler" | "modal">
): Promise<RazorpaySuccessResponse> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay script not loaded"));
      return;
    }

    const razorpay = new window.Razorpay({
      ...options,
      handler: (response) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled by user"));
        },
      },
    });

    razorpay.open();
  });
}

/**
 * Helper to format amount in paise to rupees string
 */
export function formatAmountInRupees(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toFixed(0)}`;
}
