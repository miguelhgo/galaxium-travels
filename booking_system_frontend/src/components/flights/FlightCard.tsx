import type { Flight } from '../../types';
import { Card, Button } from '../common';
import { Plane, Clock, DollarSign, Users } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, calculateDuration } from '../../utils/formatters';
import { motion } from 'framer-motion';

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
}

export const FlightCard = ({ flight, onBook }: FlightCardProps) => {
  const totalSeats = flight.economy_seats + flight.business_seats + flight.galaxium_seats;
  const isLowSeats = totalSeats <= 2;
  const isSoldOut = totalSeats === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        {/* Route Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cosmic-gradient">
              <Plane className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-star-white">
                {flight.origin} → {flight.destination}
              </h3>
              <p className="text-sm text-star-white/60">
                Flight #{flight.flight_id}
              </p>
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="space-y-3 mb-6 flex-1">
          {/* Departure & Arrival */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-star-white/60 mb-1">Departure</p>
              <p className="text-sm font-medium text-star-white">
                {formatDate(flight.departure_time, 'MMM dd, yyyy')}
              </p>
              <p className="text-lg font-bold text-cosmic-purple">
                {formatTime(flight.departure_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-star-white/60 mb-1">Arrival</p>
              <p className="text-sm font-medium text-star-white">
                {formatDate(flight.arrival_time, 'MMM dd, yyyy')}
              </p>
              <p className="text-lg font-bold text-cosmic-purple">
                {formatTime(flight.arrival_time)}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-star-white/70">
            <Clock size={16} />
            <span className="text-sm">
              Duration: {calculateDuration(flight.departure_time, flight.arrival_time)}
            </span>
          </div>

          {/* Price - Starting from Economy */}
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-alien-green" />
            <span className="text-2xl font-bold text-star-white">
              {formatCurrency(flight.economy_price)}
            </span>
            <span className="text-sm text-star-white/60">starting from</span>
          </div>

          {/* Seat Classes Available */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users size={16} className={isLowSeats ? 'text-solar-orange' : 'text-star-white/70'} />
              <span className={`text-sm ${isLowSeats ? 'text-solar-orange font-semibold' : 'text-star-white/70'}`}>
                {isSoldOut ? 'Sold Out' : `${totalSeats} seats available`}
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              {flight.economy_seats > 0 && (
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                  Economy: {flight.economy_seats}
                </span>
              )}
              {flight.business_seats > 0 && (
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                  Business: {flight.business_seats}
                </span>
              )}
              {flight.galaxium_seats > 0 && (
                <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                  Galaxium: {flight.galaxium_seats}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={() => onBook(flight)}
          disabled={isSoldOut}
          className="w-full"
        >
          {isSoldOut ? 'Sold Out' : 'Book Now'}
        </Button>
      </Card>
    </motion.div>
  );
};

// Made with Bob
