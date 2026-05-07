"use client";

import React from 'react';
import { Activity } from 'lucide-react';

interface RiskCardProps {
  probability: number;
  riskLevel: string;
}

export default function RiskCard({ probability, riskLevel }: RiskCardProps) {
  const percentage = (probability * 100).toFixed(1);
  
  // Determine text color based on riskLevel
  let colorClass = "text-[#4CD964]";
  if (riskLevel.includes("HIGH")) colorClass = "text-[#FF5A5F]";
  else if (riskLevel.includes("MODERATE-HIGH")) colorClass = "text-[#FF9F43]";
  else if (riskLevel.includes("MODERATE")) colorClass = "text-[#FFC93C]";

  // The Risk Meter bar positions
  // We can just use a simple gradient and a marker
  const markerPosition = `${Math.min(Math.max(probability * 100, 5), 95)}%`;

  return (
    <div className="bg-white rounded-[24px] p-6 card-shadow flex gap-8 items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
          <Activity className="w-8 h-8 text-[#FF5A5F]" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-[#5E6C84]">Diabetes Risk Prediction</h2>
          <div className={`text-4xl font-bold mt-1 ${colorClass}`}>
            {percentage}%
          </div>
        </div>
      </div>

      {/* Right Section (Risk Meter) */}
      <div className="flex-1 max-w-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wider">Risk Level</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            riskLevel.includes("HIGH") && !riskLevel.includes("MODERATE") ? "bg-red-50 text-[#FF5A5F]" :
            riskLevel.includes("MODERATE-HIGH") ? "bg-orange-50 text-[#FF9F43]" :
            riskLevel.includes("MODERATE") ? "bg-yellow-50 text-[#FFC93C]" :
            "bg-green-50 text-[#4CD964]"
          }`}>
            {riskLevel || "Pending"}
          </span>
        </div>
        
        <div className="relative h-3 w-full bg-gray-100 rounded-full mt-2">
          {/* Gradient bar */}
          <div 
            className="absolute top-0 left-0 h-full w-full rounded-full" 
            style={{
              background: 'linear-gradient(to right, #4CD964 0%, #FFC93C 40%, #FF9F43 70%, #FF5A5F 100%)'
            }}
          ></div>
          
          {/* Marker */}
          {probability > 0 && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white rounded-[4px] border-2 border-[#172B4D] shadow-sm transition-all duration-1000 ease-out"
              style={{ left: `calc(${markerPosition} - 8px)` }}
            ></div>
          )}
        </div>
        <div className="flex justify-between text-[10px] text-[#5E6C84] mt-2 font-medium">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}
