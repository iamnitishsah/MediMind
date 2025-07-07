'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Patient {
    id: number;
    name: string;
    age: number;
    gender: string;
    doctor: number;
}

interface UserProfile {
    user: {
        id: number,
        first_name: string,
        last_name: string,
        username: string,
        email: string,
    },
    specialization: string,
    license_number: string
}

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDoctorAndPatients = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("access_token");
                if(!token) {
                    router.push("/login");
                    return;
                }

                // First, fetch the current doctor's information
                const doctorResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/me/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!doctorResponse.ok) {
                    throw new Error('Failed to fetch doctor information');
                }

                const doctorData: UserProfile = await doctorResponse.json();

                // Then, fetch patients for this doctor
                const patientsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/patients/doc${doctorData.user.id}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!patientsResponse.ok) {
                    throw new Error('Failed to fetch patients');
                }

                const patientsData = await patientsResponse.json();
                setPatients(patientsData);
            } catch (error) {
                console.error('Error fetching doctor or patients:', error);
                // If there's an authentication error, redirect to login
                if (error instanceof Error && error.message.includes('Failed to fetch doctor')) {
                    router.push("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctorAndPatients();
    }, [router]);

    // Filter patients based on search term
    const filteredPatients = useMemo(() => {
        return patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [patients, searchTerm]);

    const handleAddPatient = async () => {
        router.push("/create-patient");
    };

    const handleViewDetails = (patientId: number) => {
        router.push(`/patients/${patientId}`);
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                        <p className="mt-6 text-lg text-gray-600 font-medium">Loading patients...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 sm:py-8 gap-4">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Patients Dashboard
                                </h1>
                                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 font-medium">
                                    Manage and view all your patients
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <button
                                    onClick={handleAddPatient}
                                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center text-sm sm:text-base"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="sm:inline">Add Patient</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search and Stats */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-2xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search patients by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium shadow-sm"
                                />
                            </div>

                            {/* Stats Cards */}
                            <div className="flex space-x-4">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 px-6 py-4 min-w-[120px]">
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Patients</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        {patients.length}
                                    </p>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 px-6 py-4 min-w-[120px]">
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Showing</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        {filteredPatients.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patients Grid */}
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 max-w-md mx-auto">
                                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm ? 'Try adjusting your search term.' : 'Get started by adding your first patient.'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={handleAddPatient}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                                    >
                                        Add Your First Patient
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {patient.name}
                                                </h3>
                                                <div className="mt-1 flex items-center text-sm text-gray-600">
                                                    <span className="font-medium">Age {patient.age}</span>
                                                    <span className="mx-2 text-gray-400">•</span>
                                                    <span className="capitalize">{patient.gender}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleViewDetails(patient.id)}
                                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}