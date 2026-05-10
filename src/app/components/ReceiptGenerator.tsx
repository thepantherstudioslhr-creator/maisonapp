import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Booking, APARTMENTS } from '../types';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReceiptContent } from './ReceiptContent';
import logoImage from '../../imports/555031729_122102984955033682_4637142757421852213_n.jpg';

interface ReceiptGeneratorProps {
  bookingId: string;
  onClose: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ bookingId, onClose }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBooking();
    loadLogoAsBase64();
  }, [bookingId]);

  const loadLogoAsBase64 = () => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          setLogoBase64(dataURL);
          console.log('Logo converted to base64 successfully');
        }
      } catch (error) {
        console.error('Error converting logo to base64:', error);
        setLogoBase64(logoImage);
      }
    };
    img.onerror = (error) => {
      console.error('Failed to load logo image:', error);
      setLogoBase64(logoImage);
    };
    img.src = logoImage;
  };

  const loadBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      const apartment = APARTMENTS.find((a) => a.id === data.apartment_id);
      setBooking({
        ...data,
        apartment_name: apartment?.name,
      });
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!booking || !receiptRef.current) return;

    try {
      const element = receiptRef.current;

      // Wait for logo base64 to be ready
      if (!logoBase64) {
        alert('Logo is still loading. Please try again in a moment.');
        return;
      }

      // Wait for images to load
      const images = element.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Longer delay to ensure rendering and base64 images are complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the element as canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Ensure all images in the cloned document use base64
          const clonedImages = clonedDoc.getElementsByTagName('img');
          Array.from(clonedImages).forEach((img) => {
            if (img.src.includes('555031729')) {
              img.src = logoBase64;
            }
          });
        },
      });

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10; // 10mm margins on all sides

      // Available space after margins
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);

      // Calculate image dimensions in mm (assuming 96 DPI)
      const imgWidthMM = (canvas.width / 96) * 25.4;
      const imgHeightMM = (canvas.height / 96) * 25.4;

      // Calculate scale to fit within available space while maintaining aspect ratio
      const scaleX = availableWidth / imgWidthMM;
      const scaleY = availableHeight / imgHeightMM;
      const scale = Math.min(scaleX, scaleY);

      // Final dimensions maintaining aspect ratio
      const finalWidth = imgWidthMM * scale;
      const finalHeight = imgHeightMM * scale;

      // Center the image on the page
      const xOffset = margin + (availableWidth - finalWidth) / 2;
      const yOffset = margin + (availableHeight - finalHeight) / 2;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Add image maintaining aspect ratio
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`Maison-Royale-Receipt-${booking.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const shareWhatsApp = () => {
    if (!booking) return;

    const cashPart = booking.cash_amount && booking.cash_amount > 0 ? `\n💵 Cash: Rs ${booking.cash_amount.toLocaleString()}` : '';
    const onlinePart = booking.online_amount && booking.online_amount > 0 ? `\n💳 Online: Rs ${booking.online_amount.toLocaleString()}` : '';
    const discountPart = booking.discount > 0 ? `\n🎁 Discount: -Rs ${booking.discount.toLocaleString()}` : '';

    const message = `✨ *MAISON ROYALE RESIDENCY* ✨
━━━━━━━━━━━━━━━━━━━━━
*🎊 BOOKING CONFIRMED 🎊*

📋 *Booking Details:*
🆔 ID: ${booking.id.substring(0, 8).toUpperCase()}
👤 Client: ${booking.client_name}
📱 Phone: ${booking.phone}
🏨 Apartment: ${booking.apartment_name}

📅 *Stay Duration:*
📥 Check-In: ${format(new Date(booking.check_in), 'MMM dd, yyyy')}
📤 Check-Out: ${format(new Date(booking.check_out), 'MMM dd, yyyy')}
🌙 Nights: ${booking.nights}

💰 *Payment Breakdown:*
💵 Price/Night: Rs ${booking.price_per_night.toLocaleString()}
📊 Subtotal (${booking.nights}×${booking.price_per_night.toLocaleString()}): Rs ${(booking.nights * booking.price_per_night).toLocaleString()}${discountPart}
━━━━━━━━━━━━━━━━━━━━━
✅ *Total Amount: Rs ${booking.total_amount.toLocaleString()}*${cashPart}${onlinePart}
━━━━━━━━━━━━━━━━━━━━━
💚 Paid: Rs ${booking.advance_payment.toLocaleString()}
${booking.balance > 0 ? `⚠️ Balance Due: Rs ${booking.balance.toLocaleString()}` : '✅ Fully Paid - Thank You!'}

🌟 _Thank you for choosing Maison Royale Residency!_
We look forward to hosting you! 🏰`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg p-8">
          <p className="text-white">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg max-w-2xl w-full my-8">
        {/* Success Header */}
        <div className="bg-green-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl text-white">Booking Confirmed!</h2>
              <p className="text-green-100">Receipt generated successfully</p>
            </div>
          </div>
        </div>

        {/* Receipt */}
        <div ref={receiptRef} style={{ backgroundColor: '#ffffff', color: '#000000', maxWidth: '800px', margin: '0 auto' }}>
          <ReceiptContent booking={booking} logoSrc={logoBase64} />
        </div>

        {/* Actions */}
        <div className="p-6 bg-neutral-900 border-t border-neutral-800 rounded-b-lg">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF
            </button>
            <button
              onClick={shareWhatsApp}
              className="bg-green-600 hover:bg-green-500 text-white py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Share WhatsApp
            </button>
            <button
              onClick={onClose}
              className="bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;