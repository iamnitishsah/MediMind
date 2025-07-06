'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface PrescriptionRequest {
  name: string;
  age: number;
  gender: string;
  allergies: string;
  medical_history: string;
  symptoms: string;
}

interface PrescriptionItem {
  medicine: string;
  dosage: string;
  instructions: string;
}

interface PrescriptionResponse {
  diagnosis: string;
  notes: string;
  prescription_items: PrescriptionItem[];
}

interface FormErrors {
  [key: string]: string;
}

const genderOptions = [
  'Male',
  'Female',
  'Other'
];

export default function GeneratePrescriptionPage() {

  const [formData, setFormData] = useState<PrescriptionRequest>({
    name: '',
    age: 0,
    gender: '',
    allergies: '',
    medical_history: '',
    symptoms: ''
  });
  
  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.age || formData.age < 1 || formData.age > 150) {
      newErrors.age = 'Please enter a valid age between 1 and 150';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = 'Symptoms are required';
    } else if (formData.symptoms.trim().length < 10) {
      newErrors.symptoms = 'Please provide more detailed symptoms (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleGeneratePrescription = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before generating prescription');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Generating AI prescription...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_URL}/generate_prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: formData.age,
          gender: formData.gender,
          allergies: formData.allergies.trim() || '',
          medical_history: formData.medical_history.trim() || '',
          symptoms: formData.symptoms.trim()
        }),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data: PrescriptionResponse = await response.json();
        setPrescription(data);
        toast.success('Prescription generated successfully!', {
          icon: '🩺',
          duration: 3000
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to generate prescription');
      }
    } catch (error) {
      console.error('Generate prescription error:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      age: 0,
      gender: '',
      allergies: '',
      medical_history: '',
      symptoms: ''
    });
    setPrescription(null);
    setErrors({});
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#3b82f6',
            },
          },
        }}
      />

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/patients"
                className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  AI Prescription Generator
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Generate AI-powered medical prescriptions based on patient symptoms
                </p>
              </div>
            </div>
            {prescription && (
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
                {prescription && (
                  <button
                    onClick={handleReset}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Reset Form
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Patient Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter patient's full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="1"
                      max="150"
                      value={formData.age || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.age ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Age"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.gender ? 'border-red-300' : 'border-gray-300'
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    >
                      <option value="">Select gender</option>
                      {genderOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                    )}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                    Known Allergies
                  </label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    rows={2}
                    value={formData.allergies}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="List any known allergies (e.g., Penicillin, Shellfish)"
                  />
                </div>

                {/* Medical History */}
                <div>
                  <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700">
                    Medical History
                  </label>
                  <textarea
                    id="medical_history"
                    name="medical_history"
                    rows={3}
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe relevant medical history (e.g., Hypertension, Type 2 Diabetes)"
                  />
                </div>

                {/* Symptoms */}
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
                    Current Symptoms *
                  </label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    rows={4}
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.symptoms ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Describe the patient's current symptoms in detail..."
                  />
                  {errors.symptoms && (
                    <p className="mt-1 text-sm text-red-600">{errors.symptoms}</p>
                  )}
                </div>

                {/* Generate Button */}
                <div className="pt-4">
                  <button
                    onClick={handleGeneratePrescription}
                    disabled={isGenerating}
                    className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white transition duration-150 ease-in-out ${
                      isGenerating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                  >
                    {isGenerating && (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isGenerating ? 'Generating Prescription...' : 'Generate AI Prescription'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Prescription */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generated Prescription
              </h2>

              {!prescription ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No prescription generated yet</p>
                  <p className="text-sm">Fill out the patient information and click "Generate AI Prescription"</p>
                </div>
              ) : (
                <div className="space-y-6" id="prescription-content">
                  {/* Patient Info Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Patient: {formData.name}</h3>
                    <p className="text-sm text-gray-600">Age: {formData.age} • Gender: {formData.gender}</p>
                    <p className="text-xs text-gray-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Diagnosis
                    </h4>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-blue-900 font-medium">{prescription.diagnosis}</p>
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Prescribed Medications
                    </h4>
                    <div className="space-y-3">
                      {prescription.prescription_items.map((item, index) => (
                        <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-green-900">{item.medicine}</h5>
                            <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                              {item.dosage}
                            </span>
                          </div>
                          <p className="text-sm text-green-800 leading-relaxed">{item.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Clinical Notes
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-yellow-900 text-sm leading-relaxed">{prescription.notes}</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h5 className="font-medium text-red-900">Important Disclaimer</h5>
                        <p className="text-sm text-red-800 mt-1">
                          This prescription was generated by AI and should be reviewed by a licensed medical professional before administration. 
                          Always consult with a doctor for proper medical diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #prescription-content, #prescription-content * {
            visibility: visible;
          }
          #prescription-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}