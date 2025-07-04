'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './payment-success.module.css';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('transactionId');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.checkmarkContainer}>
          <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.subtitle}>Thank you for your payment. Your transaction has been processed successfully.</p>
        
        <div className={styles.details}>
          <h2 className={styles.detailsTitle}>Transaction Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Order/Transaction ID:</span>
              <span className={styles.value}>{orderId || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Amount:</span>
              <span className={styles.value}>{amount ? `${amount} ${currency}` : 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Status:</span>
              <span className={styles.value}>Completed</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Date:</span>
              <span className={styles.value}>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Link href="/payment" className={styles.button}>
            Make Another Payment
          </Link>
          <Link href="/" className={styles.buttonSecondary}>
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
