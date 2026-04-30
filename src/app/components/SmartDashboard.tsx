import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SmartDashboardProps {
  checkInsToday: number;
  checkOutsToday: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRooms: number;
  todayRevenue: number;
  occupancyRate: number;
}

export function SmartDashboard({
  checkInsToday,
  checkOutsToday,
  occupiedRooms,
  availableRooms,
  totalRooms,
  todayRevenue,
  occupancyRate,
}: SmartDashboardProps) {
  const stats = [
    {
      title: "Today's Check-Ins",
      value: checkInsToday,
      icon: Calendar,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      title: "Today's Check-Outs",
      value: checkOutsToday,
      icon: CheckCircle,
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
    {
      title: 'Occupied Rooms',
      value: occupiedRooms,
      icon: Users,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-400',
    },
    {
      title: 'Available Rooms',
      value: availableRooms,
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
  ];

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header with Date */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-bold">
            Today's Overview
          </h2>
        </div>
        <span className="text-neutral-400 text-xs sm:text-sm">
          {format(new Date(), 'EEEE, MMMM dd, yyyy')}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} border border-neutral-800 rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-neutral-400 text-xs mb-1">{stat.title}</p>
              <p className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Today's Revenue Card */}
      <div className="mt-4 bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-neutral-400 text-sm">Today's Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-400">
                PKR {todayRevenue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Total Rooms</p>
            <p className="text-xl font-bold text-white">{totalRooms}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
