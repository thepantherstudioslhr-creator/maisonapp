import React from 'react';
import { Apartment } from '../types';
import { format } from 'date-fns';

interface ApartmentCardProps {
  apartment: Apartment;
  onClick: () => void;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onClick }) => {
  const getStatusColor = () => {
    switch (apartment.status) {
      case 'available':
        return 'bg-green-500';
      case 'booked':
        return 'bg-red-500';
      case 'checkout_today':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-neutral-500';
      default:
        return 'bg-neutral-500';
    }
  };

  const getStatusText = () => {
    switch (apartment.status) {
      case 'available':
        return 'Available';
      case 'booked':
        return 'Booked';
      case 'checkout_today':
        return 'Check-out Today';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900 border-2 ${
        apartment.status === 'available'
          ? 'border-green-500 cursor-pointer hover:border-green-400'
          : 'border-neutral-700'
      } rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-yellow-500/20`}
    >
      {/* Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className={`${getStatusColor()} w-4 h-4 rounded-full animate-pulse`}></div>
        <span className="text-neutral-400 text-sm">{getStatusText()}</span>
      </div>

      {/* Apartment Name */}
      <h3 className="text-yellow-500 text-lg mb-3">{apartment.name}</h3>

      {/* Booking Info */}
      {apartment.current_booking ? (
        <div className="space-y-2 text-sm">
          <p className="text-white">
            <span className="text-neutral-400">Guest:</span> {apartment.current_booking.client_name}
          </p>
          <p className="text-neutral-300">
            <span className="text-neutral-400">Check-in:</span>{' '}
            {format(new Date(apartment.current_booking.check_in), 'MMM dd, yyyy')}
          </p>
          <p className="text-neutral-300">
            <span className="text-neutral-400">Check-out:</span>{' '}
            {format(new Date(apartment.current_booking.check_out), 'MMM dd, yyyy')}
          </p>
          <p className="text-yellow-500">
            <span className="text-neutral-400">Price:</span> Rs {apartment.current_booking.price_per_night}/night
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-neutral-400 text-sm">No active booking</p>
          <p className="text-yellow-500">Rs {apartment.price_per_night}/night</p>
        </div>
      )}

      {/* Action Button */}
      {apartment.status === 'available' && (
        <button className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded transition-colors">
          Book Now
        </button>
      )}
    </div>
  );
};

export default ApartmentCard;
