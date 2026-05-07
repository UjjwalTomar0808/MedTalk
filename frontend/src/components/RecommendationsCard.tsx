"use client";

import React from 'react';
import { Lightbulb, AlertTriangle, ClipboardList, Apple, Activity, HeartPulse } from 'lucide-react';

interface RecommendationsCardProps {
  recommendations: string[];
}

export default function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  // Helper to determine the appropriate icon and colors based on text
  const getIconConfig = (text: string) => {
    const lower = text.toLowerCase();
    
    if (lower.includes("urgent") || lower.includes("immediate")) {
      return { icon: AlertTriangle, bg: "bg-red-50", color: "text-[#FF5A5F]" };
    }
    if (lower.includes("critical") || lower.includes("obesity") || lower.includes("hypertension") || lower.includes("blood pressure")) {
      return { icon: HeartPulse, bg: "bg-orange-50", color: "text-[#FF9F43]" };
    }
    if (lower.includes("diet") || lower.includes("weight") || lower.includes("lifestyle")) {
      return { icon: Apple, bg: "bg-green-50", color: "text-[#4CD964]" };
    }
    if (lower.includes("monitor") || lower.includes("test")) {
      return { icon: Activity, bg: "bg-blue-50", color: "text-[#1D4ED8]" };
    }
    if (lower.includes("general") || lower.includes("exercise")) {
      return { icon: ClipboardList, bg: "bg-purple-50", color: "text-purple-500" };
    }
    
    // Default
    return { icon: Lightbulb, bg: "bg-gray-100", color: "text-gray-600" };
  };

  return (
    <div className="bg-white rounded-[24px] p-6 card-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#EAF2FF] p-2 rounded-lg text-[#1D4ED8]">
          <Lightbulb className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-[#172B4D] text-lg">Actionable Recommendations</h3>
      </div>
      
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => {
            // Remove the emoji prefix if it exists to keep it clean (e.g. "🔴 URGENT:")
            const cleanRec = rec.replace(/^[\u2600-\u27BF\uD83C-\uD83E][\uDC00-\uDFFF]?\s*/, '');
            const { icon: Icon, bg, color } = getIconConfig(cleanRec);
            
            return (
              <div key={index} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/50">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${bg} ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-[#172B4D] font-medium leading-relaxed">{cleanRec}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-[#5E6C84] py-4 text-center">
          No recommendations available.
        </div>
      )}
    </div>
  );
}
