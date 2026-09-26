'use client';

import { useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    atlos?: {
      Pay: (options: { merchantId: string; orderId: string; orderAmount: number }) => void;
    };
  }
}

type AtlosPayButtonProps = {
  orderId: string;
  orderAmount: number;
  buttonText?: string;
  className?: string;
};

const MERCHANT_ID = process.env.NEXT_PUBLIC_ATLOS_MERCHANT_ID || '';

export default function AtlosPayButton({
  orderId,
  orderAmount,
  buttonText = 'Payer en Crypto',
  className = '',
}: AtlosPayButtonProps) {
  const [loading, setLoading] = useState(true);

  const startPayment = () => {
    if (!MERCHANT_ID) return;
    window.atlos?.Pay({ merchantId: MERCHANT_ID, orderId, orderAmount });
  };

  return (
    <>
      <Script
        id="atlos-sdk"
        src="https://atlos.io/packages/app/atlos.js"
        strategy="lazyOnload"
        onReady={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      <button
        type="button"
        onClick={startPayment}
        disabled={loading || !MERCHANT_ID || (typeof window !== 'undefined' && !window.atlos?.Pay)}
        className={`inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
      >
        {loading ? 'Chargement…' : buttonText}
      </button>
    </>
  );
}
