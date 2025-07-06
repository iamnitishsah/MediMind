'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  allergies: string;
  medical_history: string;
}

interface PrescriptionItem {
  medicine: string;
  dosage: string;
  instructions: string;
}

interface Prescription {
  id: number;
  prescription_date: string;
  doctor: number;
  patient: number;
  symptoms: string;
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

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>({
    name: '',
    age: 0,
    gender: '',
    allergies: '',
    medical_history: ''
  });

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error('Please login to view patient details');
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/patients/${patientId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPatient(data);
          setFormData({
            name: data.name,
            age: data.age,
            gender: data.gender,
            allergies: data.allergies || '',
            medical_history: data.medical_history || ''
          });
          
          // Fetch prescriptions after patient data is loaded
          fetchPrescriptions();
        } else if (response.status === 401) {
          toast.error('Session expired. Please login again');
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push('/login');
        } else if (response.status === 404) {
          toast.error('Patient not found');
          router.push('/patients');
        } else {
          toast.error('Failed to load patient details');
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast.error('Network error. Please check your connection');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPrescriptions = async () => {
      setIsLoadingPrescriptions(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/prescriptions/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter prescriptions for current patient
          const patientPrescriptions = data.filter((prescription: Prescription) => 
            prescription.patient === parseInt(patientId)
          );
          setPrescriptions(patientPrescriptions);
        } else if (response.status === 401) {
          toast.error('Session expired while loading prescriptions');
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to load prescriptions');
      } finally {
        setIsLoadingPrescriptions(false);
      }
    };

    fetchPatient();
  }, [patientId, router]);

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

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Updating patient...');

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error('Please login to update patient');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/patients/${patientId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: formData.age,
          gender: formData.gender,
          allergies: formData.allergies.trim() || null,
          medical_history: formData.medical_history.trim() || null
        }),
      });

      if (response.ok) {
        toast.success('Patient updated successfully!', {
          icon: '✅',
          duration: 3000
        });
        router.push("/patients");
      } else if (response.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again');
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push('/login');
      } else {
        const errorData = await response.json();
        toast.dismiss(loadingToast);
        toast.error(errorData.message || 'Failed to update patient');
        setErrors(errorData.errors || {});
      }
    } catch (error) {
      console.error('Update patient error:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const loadingToast = toast.loading('Deleting patient...');

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error('Please login to delete patient');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/patients/${patientId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('Patient deleted successfully!', {
          icon: '🗑️',
          duration: 3000
        });
        setTimeout(() => {
          router.push('/patients');
        }, 1000);
      } else if (response.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again');
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push('/login');
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to delete patient');
      }
    } catch (error) {
      console.error('Delete patient error:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    if (patient) {
      setFormData({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        allergies: patient.allergies || '',
        medical_history: patient.medical_history || ''
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Patient Not Found</h2>
          <p className="mt-2 text-gray-600">The patient you're looking for doesn't exist.</p>
          <Link
            href="/patients"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center min-w-0 flex-1">
              <Link
                href="/patients"
                className="mr-3 sm:mr-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {isEditing ? 'Edit Patient' : 'Patient Details'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {isEditing ? 'Update patient information' : 'View and manage patient information'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-shrink-0">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 sm:px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base ${
                      isSaving
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isSaving && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {/* Patient Information */}
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Patient ID */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                    <div className="mt-1 bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-900">
                      #{patient.id}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </>
                    ) : (
                      <div className="mt-1 text-sm text-gray-900">{patient.name}</div>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age *
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          min="1"
                          max="150"
                          value={formData.age}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.age ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                        {errors.age && (
                          <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                        )}
                      </>
                    ) : (
                      <div className="mt-1 text-sm text-gray-900">{patient.age} years old</div>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender *
                    </label>
                    {isEditing ? (
                      <>
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
                      </>
                    ) : (
                      <div className="mt-1 text-sm text-gray-900">{patient.gender}</div>
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
                    {isEditing ? (
                      <textarea
                        id="allergies"
                        name="allergies"
                        rows={3}
                        value={formData.allergies}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="List any known allergies..."
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-900">
                        {patient.allergies || (
                          <span className="text-gray-500 italic">No known allergies</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Medical History */}
                  <div>
                    <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700">
                      Medical History
                    </label>
                    {isEditing ? (
                      <textarea
                        id="medical_history"
                        name="medical_history"
                        rows={4}
                        value={formData.medical_history}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Describe medical history..."
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-900">
                        {patient.medical_history || (
                          <span className="text-gray-500 italic">No medical history recorded</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prescriptions Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Prescriptions ({prescriptions.length})
                </h3>

                {isLoadingPrescriptions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading prescriptions...</span>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      This patient doesn't have any prescriptions yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        {/* Prescription Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              Prescription #{prescription.id}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Date: {new Date(prescription.prescription_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          </div>
                        </div>

                        {/* Prescription Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Symptoms</h5>
                            <p className="text-sm text-gray-900">{prescription.symptoms}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Diagnosis</h5>
                            <p className="text-sm text-gray-900">{prescription.diagnosis}</p>
                          </div>
                        </div>

                        {/* Notes */}
                        {prescription.notes && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Notes</h5>
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{prescription.notes}</p>
                          </div>
                        )}

                        {/* Prescription Items */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Medications</h5>
                          <div className="space-y-3">
                            {prescription.prescription_items.map((item, index) => (
                              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h6 className="font-medium text-blue-900">{item.medicine}</h6>
                                    <p className="text-sm text-blue-700 mt-1">
                                      <span className="font-medium">Dosage:</span> {item.dosage}
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                      <span className="font-medium">Instructions:</span> {item.instructions}
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Patient</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete patient <strong>{patient.name}</strong>? 
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`flex-1 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center ${
                      isDeleting
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isDeleting && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}