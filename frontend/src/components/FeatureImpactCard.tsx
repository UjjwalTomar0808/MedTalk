"use client";

import React from 'react';
import { Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface ShapValue {
  feature: string;
  impact: number;
}

interface FeatureImpactCardProps {
  data: ShapValue[];
}

export default function FeatureImpactCard({ data }: FeatureImpactCardProps) {
  // Sort data by absolute impact to show most important features first
  const sortedData = [...data].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 8);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.impact > 0;
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
          <p className="font-medium text-[#172B4D]">{data.feature}</p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-[#FF5A5F]' : 'text-[#1D4ED8]'}`}>
            Impact: {data.impact.toFixed(3)}
          </p>
          <p className="text-xs text-[#5E6C84] mt-1">
            {isPositive ? 'Increases risk' : 'Decreases risk'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[24px] p-6 card-shadow h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-2 rounded-lg text-[#1D4ED8]">
          <Scale className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-[#172B4D] text-lg">Feature Impact (SHAP)</h3>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="feature" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#5E6C84', fontSize: 12, fontWeight: 500 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <ReferenceLine x={0} stroke="#172B4D" strokeWidth={2} />
              <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={24}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.impact > 0 ? '#FF5A5F' : '#1D4ED8'} 
                    radius={entry.impact > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[#5E6C84]">
            No data available. Run analysis to see feature impact.
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-[#5E6C84] font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#1D4ED8]"></div>
          <span>Decreases Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#FF5A5F]"></div>
          <span>Increases Risk</span>
        </div>
      </div>
    </div>
  );
}
