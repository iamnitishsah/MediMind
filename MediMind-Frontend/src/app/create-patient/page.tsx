'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface PatientData {
  name: string;
  age: string;
  gender: string;
  allergies: string;
  medical_history: string;
}

interface FormErrors {
  [key: string]: string;
}

const genderOptions = [
  'Male',
  'Female',
  'Other'
];

export default function CreatePatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    allergies: '',
    medical_history: ''
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
        newErrors.age = 'Please enter a valid age between 1 and 150';
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Allergies validation (optional but if provided, should be meaningful)
    if (formData.allergies.trim() && formData.allergies.trim().length < 2) {
      newErrors.allergies = 'If providing allergies, please be more specific';
    }

    // Medical history validation (optional but if provided, should be meaningful)
    if (formData.medical_history.trim() && formData.medical_history.trim().length < 3) {
      newErrors.medical_history = 'If providing medical history, please be more specific';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Creating patient...');
    
    try {
      // CREATE PATIENT
      const token = localStorage.getItem("access_token");
      if(!token) {
        toast.dismiss(loadingToast);
        toast.error('Please login to create patients');
        router.push("/login");
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/patients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: parseInt(formData.age),
          gender: formData.gender,
          allergies: formData.allergies.trim() || null,
          medical_history: formData.medical_history.trim() || null
        }),
      });

      if (response.ok) {
        const newPatient = await response.json();
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`Patient "${formData.name}" created successfully!`, {
          duration: 4000,
          icon: '👨‍⚕️'
        });
        
        // Small delay to show the success toast before navigation
        setTimeout(() => {
          router.push(`/patients`);
        }, 1000);
      } else if (response.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again');
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push('/login');
      } else {
        const errorData = await response.json();
        toast.dismiss(loadingToast);
        toast.error(errorData.message || 'Failed to create patient. Please try again.');
        setErrors(errorData.errors || { general: 'Failed to create patient. Please try again.' });
      }
    } catch (error) {
      console.error('Create patient error:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection and try again.');
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/patients');
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
            duration: 4000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 5000,
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
                <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new patient record in your system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              {/* Patient Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
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

                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      required
                      min="1"
                      max="150"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.age ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="35"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
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
              </div>

              {/* Medical Information Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Medical Information
                </h3>

                <div className="space-y-6">
                  {/* Allergies */}
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                      Known Allergies
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      List any known allergies (e.g., Penicillin, Shellfish, Peanuts). Leave blank if none.
                    </p>
                    <textarea
                      id="allergies"
                      name="allergies"
                      rows={3}
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.allergies ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Penicillin, Shellfish"
                    />
                    {errors.allergies && (
                      <p className="mt-1 text-sm text-red-600">{errors.allergies}</p>
                    )}
                  </div>

                  {/* Medical History */}
                  <div>
                    <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700">
                      Medical History
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      List any significant medical conditions or history (e.g., Hypertension, Type 2 Diabetes, Previous surgeries).
                    </p>
                    <textarea
                      id="medical_history"
                      name="medical_history"
                      rows={4}
                      value={formData.medical_history}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.medical_history ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Hypertension, Type 2 Diabetes"
                    />
                    {errors.medical_history && (
                      <p className="mt-1 text-sm text-red-600">{errors.medical_history}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex space-x-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    } transition duration-150 ease-in-out flex items-center`}
                  >
                    {isLoading && (
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? 'Creating Patient...' : 'Create Patient'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}