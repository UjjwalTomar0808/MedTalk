"use client";

import React, { useState } from 'react';
import { Heart, Activity, Users, PieChart, FileText, Shield, ChevronRight } from 'lucide-react';

export interface PatientFormData {
  age: number;
  bmi: number;
  HbA1c_level: number;
  blood_glucose_level: number;
  hypertension: number;
  heart_disease: number;
  gender: string;
  smoking_history: string;
}

interface SidebarProps {
  onSubmit: (data: PatientFormData) => void;
  isLoading: boolean;
}

export default function Sidebar({ onSubmit, isLoading }: SidebarProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    age: 45,
    bmi: 32.5,
    HbA1c_level: 7.1,
    blood_glucose_level: 160,
    hypertension: 1,
    heart_disease: 0,
    gender: 'Female',
    smoking_history: 'non-smoker'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'bmi' || name === 'HbA1c_level' || name === 'blood_glucose_level' || name === 'hypertension' || name === 'heart_disease'
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-[260px] h-screen bg-white flex flex-col shadow-sm fixed left-0 top-0 overflow-y-auto">
      {/* Branding */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1D4ED8] rounded-xl flex items-center justify-center">
          <Heart className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-[#172B4D] text-lg leading-tight">Diabetes AI</h1>
          <p className="text-xs text-[#5E6C84]">Clinical Support</p>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 pb-6 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF4FF] text-[#1D4ED8] rounded-lg font-medium cursor-pointer">
          <Activity className="w-5 h-5" />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 text-[#5E6C84] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <Users className="w-5 h-5" />
          <span>Patients</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 text-[#5E6C84] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <PieChart className="w-5 h-5" />
          <span>Analytics</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 text-[#5E6C84] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <FileText className="w-5 h-5" />
          <span>Reports</span>
        </div>
      </div>

      {/* Patient Data Form */}
      <div className="flex-1 px-4">
        <h2 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-3 px-3">Patient Data</h2>
        <form onSubmit={handleSubmit} className="space-y-3 px-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#5E6C84] font-medium">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]" required />
            </div>
            <div>
              <label className="text-[10px] text-[#5E6C84] font-medium">BMI</label>
              <input type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#5E6C84] font-medium">HbA1c (%)</label>
              <input type="number" step="0.1" name="HbA1c_level" value={formData.HbA1c_level} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]" required />
            </div>
            <div>
              <label className="text-[10px] text-[#5E6C84] font-medium">Glucose</label>
              <input type="number" name="blood_glucose_level" value={formData.blood_glucose_level} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]" required />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#5E6C84] font-medium">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#5E6C84] font-medium">Smoking History</label>
            <select name="smoking_history" value={formData.smoking_history} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]">
              <option value="never">Never</option>
              <option value="No Info">No Info</option>
              <option value="current">Current</option>
              <option value="former">Former</option>
              <option value="ever">Ever</option>
              <option value="not current">Not current</option>
              <option value="non-smoker">Non-smoker</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#5E6C84] font-medium">Hypertension</label>
              <select name="hypertension" value={formData.hypertension} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]">
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#5E6C84] font-medium">Heart Disease</label>
              <select name="heart_disease" value={formData.heart_disease} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#1D4ED8]">
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-[#1D4ED8] hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzing..." : "Analyze Patient"}
            {!isLoading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* HIPAA Card */}
      <div className="p-4 mt-auto">
        <div className="bg-[#F8FAFC] rounded-xl p-3 flex items-start gap-3 border border-gray-100">
          <div className="bg-green-100 p-1.5 rounded-lg text-green-600 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#172B4D]">HIPAA Compliant</h4>
            <p className="text-[10px] text-[#5E6C84] mt-0.5 leading-tight">Patient data is encrypted and secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
