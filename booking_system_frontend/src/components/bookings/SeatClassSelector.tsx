import type { SeatClass, Flight } from '../../types';
import { SEAT_CLASSES } from '../../types';
import { Plane, PlaneTakeoff, Sparkles } from 'lucide-react';

interface SeatClassSelectorProps {
  flight: Flight;
  selectedClass: SeatClass;
  onSelectClass: (seatClass: SeatClass) => void;
}

const iconMap = {
  Plane: Plane,
  PlaneTakeoff: PlaneTakeoff,
  Sparkles: Sparkles,
};

export default function SeatClassSelector({
  flight,
  selectedClass,
  onSelectClass,
}: SeatClassSelectorProps) {
  const getSeatsAvailable = (seatClass: SeatClass): number => {
    switch (seatClass) {
      case 'economy':
        return flight.economy_seats;
      case 'business':
        return flight.business_seats;
      case 'galaxium':
        return flight.galaxium_seats;
    }
  };

  const getPrice = (seatClass: SeatClass): number => {
    switch (seatClass) {
      case 'economy':
        return flight.economy_price;
      case 'business':
        return flight.business_price;
      case 'galaxium':
        return flight.galaxium_price;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white mb-4">Select Seat Class</h3>
      
      {(Object.keys(SEAT_CLASSES) as SeatClass[]).map((seatClass) => {
        const classInfo = SEAT_CLASSES[seatClass];
        const seatsAvailable = getSeatsAvailable(seatClass);
        const price = getPrice(seatClass);
        const isAvailable = seatsAvailable > 0;
        const isSelected = selectedClass === seatClass;
        const Icon = iconMap[classInfo.icon as keyof typeof iconMap];

        return (
          <button
            key={seatClass}
            onClick={() => isAvailable && onSelectClass(seatClass)}
            disabled={!isAvailable}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200
              ${isSelected
                ? 'border-white bg-white/10 shadow-lg'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }
              ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="p-3 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${classInfo.color}20` }}
              >
                <Icon
                  size={24}
                  style={{ color: classInfo.color }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-lg font-semibold text-white">
                    {classInfo.name}
                  </h4>
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${classInfo.color}20`,
                      color: classInfo.color,
                    }}
                  >
                    ×{classInfo.multiplier}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">
                  {classInfo.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">
                    ${price.toLocaleString()}
                  </span>
                  
                  <span
                    className={`text-sm ${
                      isAvailable ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isAvailable
                      ? `${seatsAvailable} seat${seatsAvailable !== 1 ? 's' : ''} available`
                      : 'Sold out'
                    }
                  </span>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-purple-600" />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Made with Bob
