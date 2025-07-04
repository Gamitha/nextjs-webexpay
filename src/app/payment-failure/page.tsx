'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './payment-failure.module.css';

export default function PaymentFailure() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const error = searchParams.get('error') || 'Payment was not completed';

  return (
    <div className={styles.container}>
      <div className={styles.failureCard}>
        <div className={styles.errorIconContainer}>
          <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        
        <h1 className={styles.title}>Payment Failed</h1>
        <p className={styles.subtitle}>Your payment could not be processed. Please try again.</p>
        
        <div className={styles.details}>
          <h2 className={styles.detailsTitle}>Transaction Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Order ID:</span>
              <span className={styles.value}>{orderId || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Amount:</span>
              <span className={styles.value}>{amount ? `${amount} ${currency}` : 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Status:</span>
              <span className={styles.statusFailed}>Failed</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Error:</span>
              <span className={styles.value}>{error}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Date:</span>
              <span className={styles.value}>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Link href="/payment" className={styles.button}>
            Try Again
          </Link>
          <Link href="/" className={styles.buttonSecondary}>
            Go to Home
          </Link>
        </div>
        
        <div className={styles.helpSection}>
          <h3 className={styles.helpTitle}>Need Help?</h3>
          <p className={styles.helpText}>
            If you continue to experience issues, please contact our support team with your order ID.
          </p>
        </div>
      </div>
    </div>
  );
}
