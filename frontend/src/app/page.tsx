"use client";

import { useState } from "react";
import Sidebar, { PatientFormData } from "@/components/Sidebar";
import RiskCard from "@/components/RiskCard";
import FeatureImpactCard from "@/components/FeatureImpactCard";
import NarrativeCard from "@/components/NarrativeCard";
import RecommendationsCard from "@/components/RecommendationsCard";
import ChatAssistant from "@/components/ChatAssistant";

interface AnalysisResult {
  probability: number;
  result: string;
  risk_level: string;
  shap_values: any[];
  clinical_story: string;
  recommendations: string[];
  context: any;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch analysis");
      }
      
      const responseData = await res.json();
      setResult(responseData);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("There was an error connecting to the backend. Please ensure the FastAPI server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] pl-[260px] pr-[384px] py-6 relative">
      <Sidebar onSubmit={handleAnalyze} isLoading={isLoading} />
      
      <main className="px-6 max-w-6xl mx-auto flex flex-col gap-6">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-[#1D4ED8] rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-[#172B4D]">Analyzing Patient Data</h2>
            <p className="text-[#5E6C84] mt-2 text-center max-w-md">
              Running Random Forest model, generating SHAP explanations, and synthesizing clinical narrative...
            </p>
          </div>
        ) : result ? (
          <>
            <RiskCard probability={result.probability} riskLevel={result.risk_level} />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
              <div className="lg:col-span-5">
                <NarrativeCard story={result.clinical_story} />
              </div>
              <div className="lg:col-span-7">
                <FeatureImpactCard data={result.shap_values} />
              </div>
            </div>
            
            <RecommendationsCard recommendations={result.recommendations} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-[24px] border border-dashed border-gray-300 card-shadow">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#172B4D]">Ready for Analysis</h2>
            <p className="text-[#5E6C84] mt-2 text-center max-w-sm">
              Enter patient data in the sidebar and click "Analyze Patient" to view the comprehensive risk assessment.
            </p>
          </div>
        )}
      </main>

      <ChatAssistant context={result?.context || null} />
    </div>
  );
}
