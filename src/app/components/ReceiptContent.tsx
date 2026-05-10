import React from 'react';
import { format } from 'date-fns';
import logoImage from '../../imports/555031729_122102984955033682_4637142757421852213_n.jpg';

interface ReceiptContentProps {
  booking: {
    id: string;
    apartment_name?: string;
    client_name: string;
    phone: string;
    cnic: string;
    guests: number;
    check_in: string;
    check_out: string;
    nights: number;
    price_per_night: number;
    discount: number;
    extra_charges: number;
    total_amount: number;
    cash_amount?: number;
    online_amount?: number;
    advance_payment: number;
    balance: number;
    created_at: string;
  };
  logoSrc?: string;
}

export const ReceiptContent: React.FC<ReceiptContentProps> = ({ booking, logoSrc }) => {
  const logo = logoSrc || logoImage;
  const styles = {
    container: {
      position: 'relative' as const,
      padding: '20px',
      background: '#ffffff',
      backgroundColor: '#ffffff',
      color: '#000000',
      overflow: 'hidden' as const,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box' as const,
      width: '100%',
    },
    watermark: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '300px',
      height: '300px',
      opacity: 0.05,
      objectFit: 'contain' as const,
      pointerEvents: 'none' as const,
    },
    content: {
      position: 'relative' as const,
      zIndex: 10,
    },
    topBorder: {
      height: '8px',
      background: 'linear-gradient(to right, #d97706, #eab308, #d97706)',
      borderRadius: '6px 6px 0 0',
      marginBottom: '12px',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '3px double #d97706',
    },
    logo: {
      width: '70px',
      height: '70px',
      margin: '0 auto 10px',
      borderRadius: '50%',
      border: '3px solid #f59e0b',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'block',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #92400e, #a16207, #92400e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '6px',
    },
    subtitle: {
      display: 'inline-block',
      padding: '4px 16px',
      background: 'linear-gradient(to right, #fef3c7, #fef08a)',
      borderRadius: '999px',
      border: '2px solid #fbbf24',
      fontSize: '14px',
      fontWeight: '600',
      color: '#92400e',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      fontSize: '11px',
    },
    section: {
      marginBottom: '12px',
    },
    sectionHeader: (bgGradient: string) => ({
      background: bgGradient,
      color: '#ffffff',
      padding: '6px 12px',
      borderRadius: '6px 6px 0 0',
      fontSize: '14px',
      fontWeight: 'bold',
    }),
    sectionBody: (bgGradient: string, borderColor: string) => ({
      background: bgGradient,
      padding: '12px',
      borderRadius: '0 0 6px 6px',
      border: `2px solid ${borderColor}`,
      borderTop: 'none',
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
    },
    fieldLabel: (color: string) => ({
      fontSize: '9px',
      fontWeight: '600',
      color: color,
      marginBottom: '3px',
      textTransform: 'uppercase' as const,
    }),
    fieldValue: {
      fontWeight: 'bold',
      color: '#111827',
      fontSize: '13px',
    },
    paymentBox: {
      marginBottom: '12px',
      background: 'linear-gradient(to bottom right, #fef3c7, #fde68a, #fef3c7)',
      border: '3px solid #f59e0b',
      borderRadius: '8px',
      overflow: 'hidden' as const,
    },
    paymentHeader: {
      background: 'linear-gradient(to right, #d97706, #eab308, #d97706)',
      color: '#ffffff',
      padding: '8px 12px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    paymentBody: {
      padding: '12px',
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px dashed #d1d5db',
      fontSize: '13px',
    },
    discountCard: {
      background: '#fef2f2',
      padding: '8px 10px',
      borderRadius: '6px',
      border: '2px solid #fca5a5',
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalCard: {
      background: 'linear-gradient(to right, #fde68a, #fef08a)',
      padding: '12px',
      borderRadius: '8px',
      border: '3px solid #fbbf24',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    paymentBreakdown: {
      background: '#f0fdf4',
      padding: '10px',
      borderRadius: '6px',
      border: '2px solid #86efac',
      marginBottom: '8px',
    },
    balanceCard: (isPaid: boolean) => ({
      background: isPaid ? 'linear-gradient(to right, #dcfce7, #d1fae5)' : 'linear-gradient(to right, #fee2e2, #fecaca)',
      padding: isPaid ? '10px' : '12px',
      borderRadius: '8px',
      border: isPaid ? '2px solid #86efac' : '3px solid #f87171',
      display: 'flex',
      justifyContent: isPaid ? 'center' : 'space-between',
      alignItems: 'center',
    }),
    footer: {
      textAlign: 'center' as const,
      marginTop: '12px',
      paddingTop: '10px',
      borderTop: '3px double #d97706',
    },
    bottomBorder: {
      height: '8px',
      background: 'linear-gradient(to right, #d97706, #eab308, #d97706)',
      borderRadius: '0 0 6px 6px',
      marginTop: '12px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Background Watermark */}
      <img src={logo} alt="Watermark" style={styles.watermark} />

      {/* Content */}
      <div style={styles.content}>
        {/* Top Border */}
        <div style={styles.topBorder}></div>

        {/* Header */}
        <div style={styles.header}>
          <img src={logo} alt="Maison Royale" style={styles.logo} />
          <h1 style={styles.title}>MAISON ROYALE RESIDENCY</h1>
          <div style={styles.subtitle}>✨ Booking Receipt ✨</div>
        </div>

        {/* Quick Info */}
        <div style={styles.infoRow}>
          <div><strong>ID:</strong> {booking.id.substring(0, 8).toUpperCase()}</div>
          <div><strong>Date:</strong> {format(new Date(booking.created_at), 'MMM dd, yyyy')}</div>
        </div>

        {/* Client Details */}
        <div style={styles.section}>
          <div style={styles.sectionHeader('linear-gradient(to right, #f59e0b, #eab308)')}>
            👤 Client Details
          </div>
          <div style={styles.sectionBody('linear-gradient(to bottom right, #fef3c7, #fef08a)', '#fcd34d')}>
            <div style={styles.grid}>
              <div>
                <p style={styles.fieldLabel('#92400e')}>Name</p>
                <p style={styles.fieldValue}>{booking.client_name}</p>
              </div>
              <div>
                <p style={styles.fieldLabel('#92400e')}>Phone</p>
                <p style={styles.fieldValue}>{booking.phone}</p>
              </div>
              <div>
                <p style={styles.fieldLabel('#92400e')}>CNIC</p>
                <p style={styles.fieldValue}>{booking.cnic}</p>
              </div>
              <div>
                <p style={styles.fieldLabel('#92400e')}>Number of Guests</p>
                <p style={styles.fieldValue}>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div style={styles.section}>
          <div style={styles.sectionHeader('linear-gradient(to right, #10b981, #34d399)')}>
            🏨 Booking Details
          </div>
          <div style={styles.sectionBody('linear-gradient(to bottom right, #d1fae5, #a7f3d0)', '#86efac')}>
            <div style={styles.grid}>
              <div>
                <p style={styles.fieldLabel('#065f46')}>Apartment</p>
                <p style={styles.fieldValue}>{booking.apartment_name}</p>
              </div>
              <div>
                <p style={styles.fieldLabel('#065f46')}>Duration</p>
                <p style={styles.fieldValue}>{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</p>
              </div>
              <div>
                <p style={styles.fieldLabel('#065f46')}>Check-In</p>
                <p style={styles.fieldValue}>{format(new Date(booking.check_in), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p style={styles.fieldLabel('#065f46')}>Check-Out</p>
                <p style={styles.fieldValue}>{format(new Date(booking.check_out), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div style={styles.paymentBox}>
          <div style={styles.paymentHeader}>💰 Payment Summary</div>
          <div style={styles.paymentBody}>
            {/* Subtotal */}
            <div style={styles.row}>
              <span style={{ color: '#374151', fontWeight: '600' }}>
                Price ({booking.nights} nights × Rs {booking.price_per_night.toLocaleString()})
              </span>
              <span style={{ fontWeight: 'bold', color: '#111827' }}>
                Rs {(booking.nights * booking.price_per_night).toLocaleString()}
              </span>
            </div>

            {/* Discount */}
            {booking.discount > 0 && (
              <div style={styles.row}>
                <span style={{ color: '#b91c1c', fontWeight: '600' }}>🎁 Discount</span>
                <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
                  - Rs {booking.discount.toLocaleString()}
                </span>
              </div>
            )}

            {/* Extra Charges */}
            {booking.extra_charges > 0 && (
              <div style={styles.row}>
                <span style={{ color: '#c2410c', fontWeight: '600' }}>Extra Charges</span>
                <span style={{ fontWeight: 'bold', color: '#ea580c' }}>
                  + Rs {booking.extra_charges.toLocaleString()}
                </span>
              </div>
            )}

            {/* Total */}
            <div style={styles.totalCard}>
              <span style={{ fontWeight: 'bold', color: '#78350f' }}>💵 Total Amount</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#92400e' }}>
                Rs {booking.total_amount.toLocaleString()}
              </span>
            </div>

            {/* Payment Breakdown */}
            <div style={styles.paymentBreakdown}>
              {booking.cash_amount !== undefined && booking.cash_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '600', color: '#15803d' }}>💵 Cash</span>
                  <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                    Rs {booking.cash_amount.toLocaleString()}
                  </span>
                </div>
              )}
              {booking.online_amount !== undefined && booking.online_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '600', color: '#1e40af' }}>💳 Online</span>
                  <span style={{ fontWeight: 'bold', color: '#2563eb' }}>
                    Rs {booking.online_amount.toLocaleString()}
                  </span>
                </div>
              )}
              <div style={{ paddingTop: '6px', borderTop: '2px solid #86efac', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ fontWeight: 'bold', color: '#166534' }}>Paid</span>
                <span style={{ fontWeight: 'bold', color: '#15803d' }}>
                  Rs {booking.advance_payment.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div style={styles.balanceCard(booking.balance === 0)}>
              {booking.balance > 0 ? (
                <>
                  <span style={{ fontWeight: 'bold', color: '#991b1b' }}>⚠️ Balance Due</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#b91c1c' }}>
                    Rs {booking.balance.toLocaleString()}
                  </span>
                </>
              ) : (
                <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '13px' }}>
                  ✅ Fully Paid - Thank You!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>
            🌟 Thank you for choosing Maison Royale Residency!
          </p>
        </div>

        {/* Bottom Border */}
        <div style={styles.bottomBorder}></div>
      </div>
    </div>
  );
};
