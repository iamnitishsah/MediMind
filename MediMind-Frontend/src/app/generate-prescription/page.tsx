'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  allergies?: string;
  medical_history?: string;
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

export default function GeneratePrescriptionPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState<PrescriptionResponse | null>(null);

  // Fetch patients on component mount
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/patients/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGeneratePrescription = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient first');
      return;
    }

    if (!symptoms.trim()) {
      toast.error('Please enter symptoms');
      return;
    }

    if (symptoms.trim().length < 10) {
      toast.error('Please provide more detailed symptoms');
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
          name: selectedPatient.name,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          allergies: selectedPatient.allergies || '',
          medical_history: selectedPatient.medical_history || '',
          symptoms: symptoms.trim()
        }),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data: PrescriptionResponse = await response.json();
        setPrescription(data);
        setEditedPrescription(data);
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
    setSelectedPatient(null);
    setSymptoms('');
    setPrescription(null);
    setEditedPrescription(null);
    setSearchQuery('');
    setIsEditing(false);
  };

  const handleEditPrescription = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedPrescription(prescription);
    setIsEditing(false);
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient || !editedPrescription) {
      toast.error('Missing patient or prescription data');
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving prescription...');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error('Please login to save prescription');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/prescriptions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient: selectedPatient.id,
          symptoms: symptoms.trim(),
          diagnosis: editedPrescription.diagnosis,
          notes: editedPrescription.notes,
          prescription_items: editedPrescription.prescription_items
        }),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        setPrescription(editedPrescription);
        setIsEditing(false);
        toast.success('Prescription saved successfully!', {
          icon: '💾',
          duration: 3000
        });
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to save prescription');
      }
    } catch (error) {
      console.error('Save prescription error:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiagnosisChange = (value: string) => {
    if (editedPrescription) {
      setEditedPrescription({
        ...editedPrescription,
        diagnosis: value
      });
    }
  };

  const handleNotesChange = (value: string) => {
    if (editedPrescription) {
      setEditedPrescription({
        ...editedPrescription,
        notes: value
      });
    }
  };

  const handleMedicationChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    if (editedPrescription) {
      const updatedItems = [...editedPrescription.prescription_items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      setEditedPrescription({
        ...editedPrescription,
        prescription_items: updatedItems
      });
    }
  };

  const handleAddMedication = () => {
    if (editedPrescription) {
      setEditedPrescription({
        ...editedPrescription,
        prescription_items: [
          ...editedPrescription.prescription_items,
          { medicine: '', dosage: '', instructions: '' }
        ]
      });
    }
  };

  const handleRemoveMedication = (index: number) => {
    if (editedPrescription && editedPrescription.prescription_items.length > 1) {
      const updatedItems = editedPrescription.prescription_items.filter((_, i) => i !== index);
      setEditedPrescription({
        ...editedPrescription,
        prescription_items: updatedItems
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
      <div className="bg-white/95 backdrop-blur-sm shadow-sm">
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
                  Generate Prescription
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Select a patient and generate AI-powered medical prescriptions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Patient Selection & Symptoms */}
          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Select Patient
              </h2>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading patients...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPatient?.id === patient.id
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-600">
                            {patient.age} years • {patient.gender}
                          </div>
                          {patient.phone && (
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {patient.phone}
                            </div>
                          )}
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <div className="text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && searchQuery && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-600">No patients found matching &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                  {filteredPatients.length === 0 && !searchQuery && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-600">Create a patient before generating prescription</p>
                    </div>
                  )}
                </div>
              )}

              {selectedPatient && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                  <h3 className="font-medium text-indigo-900 mb-2">Selected Patient</h3>
                  <div className="text-indigo-800">
                    <p className="font-semibold">{selectedPatient.name}</p>
                    <p className="text-sm">{selectedPatient.age} years • {selectedPatient.gender}</p>
                    {selectedPatient.allergies && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Allergies:</span> {selectedPatient.allergies}
                      </p>
                    )}
                    {selectedPatient.medical_history && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Medical History:</span> {selectedPatient.medical_history}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Symptoms Input */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Current Symptoms
              </h2>
              
              <textarea
                rows={6}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm resize-none"
                placeholder="Describe the patient's current symptoms in detail..."
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleGeneratePrescription}
                  disabled={isGenerating || !selectedPatient || !symptoms.trim()}
                  className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                    isGenerating || !selectedPatient || !symptoms.trim()
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                  }`}
                >
                  {isGenerating && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isGenerating ? 'Generating...' : '🤖 Generate AI Prescription'}
                </button>
                
                <button
                  onClick={handleReset}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-150 ease-in-out"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Generated Prescription */}
          <div className="space-y-6">
            {prescription ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generated Prescription
                </h2>

                <div className="space-y-6" id="prescription-content">
                  {/* Patient Info Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900">Patient: {selectedPatient?.name}</h3>
                    <p className="text-sm text-gray-600">Age: {selectedPatient?.age} • Gender: {selectedPatient?.gender}</p>
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
                    {isEditing ? (
                      <textarea
                        value={editedPrescription?.diagnosis || ''}
                        onChange={(e) => handleDiagnosisChange(e.target.value)}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-blue-900 font-medium"
                        rows={2}
                        placeholder="Enter diagnosis..."
                      />
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-blue-900 font-medium">{prescription.diagnosis}</p>
                      </div>
                    )}
                  </div>

                  {/* Medications */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Prescribed Medications
                      </div>
                      {isEditing && (
                        <button
                          onClick={handleAddMedication}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add
                        </button>
                      )}
                    </h4>
                    <div className="space-y-3">
                      {(isEditing ? editedPrescription?.prescription_items : prescription.prescription_items)?.map((item, index) => (
                        <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-green-800 mb-1">Medicine</label>
                                    <input
                                      type="text"
                                      value={item.medicine}
                                      onChange={(e) => handleMedicationChange(index, 'medicine', e.target.value)}
                                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      placeholder="Enter medicine name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-green-800 mb-1">Dosage</label>
                                    <input
                                      type="text"
                                      value={item.dosage}
                                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      placeholder="Enter dosage"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-green-800 mb-1">Instructions</label>
                                    <textarea
                                      value={item.instructions}
                                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      rows={2}
                                      placeholder="Enter instructions"
                                    />
                                  </div>
                                </div>
                                {(editedPrescription?.prescription_items.length || 0) > 1 && (
                                  <button
                                    onClick={() => handleRemoveMedication(index)}
                                    className="ml-3 text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-semibold text-green-900">{item.medicine}</h5>
                                <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                  {item.dosage}
                                </span>
                              </div>
                              <p className="text-sm text-green-800 leading-relaxed">{item.instructions}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {(prescription.notes || isEditing) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Clinical Notes
                      </h4>
                      {isEditing ? (
                        <textarea
                          value={editedPrescription?.notes || ''}
                          onChange={(e) => handleNotesChange(e.target.value)}
                          className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50 text-yellow-900"
                          rows={3}
                          placeholder="Enter clinical notes..."
                        />
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-yellow-900 text-sm leading-relaxed">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={handleEditPrescription}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Prescription
                        </button>
                        <button
                          onClick={handlePrint}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print Prescription
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleSavePrescription}
                          disabled={isSaving}
                          className={`${
                            isSaving
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:-translate-y-0.5'
                          } text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg transform`}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescription Generated</h3>
                  <p className="text-gray-600">
                    Select a patient and enter symptoms to generate a prescription
                  </p>
                </div>
              </div>
            )}
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