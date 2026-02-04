'use client';

import Image from 'next/image';
import Link from 'next/link';
import Footer from './components/Footer';

export default function HomePage() {

  const features = [
    {
      title: 'Centralized Patient Records',
      description:
          'Maintain structured, secure patient records with quick access to medical history, allergies, and visit notes.',
      icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
      ),
    },
    {
      title: 'AI-Assisted Clinical Suggestions',
      description:
          'Generate prescription drafts and clinical suggestions based on symptoms and history — always under doctor control.',
      icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
      ),
    },
    {
      title: 'Practice-Level Insights',
      description:
          'Understand trends across visits, prescriptions, and follow-ups with simple, privacy-conscious analytics.',
      icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
      ),
    },
    {
      title: 'Secure & Compliant by Design',
      description:
          'Built with HIPAA-aligned principles, encrypted storage, and strict access boundaries for patient data.',
      icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
      ),
    },
    {
      title: 'Accessible Across Devices',
      description:
          'Designed to work smoothly across desktop, tablet, and mobile — without compromising usability.',
      icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
      ),
    },
    {
      title: 'Optimized Clinical Workflows',
      description:
          'Reduce administrative friction and focus more time on patient care with thoughtfully designed flows.',
      icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
      ),
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description:
          'Set up your professional profile with specialization and credentials.',
    },
    {
      number: '02',
      title: 'Add Patient Records',
      description:
          'Securely record patient details, visit notes, and medical history.',
    },
    {
      number: '03',
      title: 'Use AI Assistance',
      description:
          'Generate AI-assisted prescription drafts while retaining full clinical authority.',
    },
    {
      number: '04',
      title: 'Monitor & Refine',
      description:
          'Track follow-ups and improve care decisions over time.',
    },
  ];

  return (
      <div className="min-h-screen bg-white">
        {/* NAVBAR */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="MediMind" width={32} height={32} />
              <span className="text-xl font-semibold text-gray-900">MediMind</span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="text-gray-600 hover:text-indigo-600">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600">How It Works</a>
              <Link href="/login" className="text-gray-600 hover:text-indigo-600">Sign In</Link>
              <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
            Private Practice • AI-Assisted • Secure
          </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
              A Smarter Way to
              <span className="block text-indigo-600 mt-2">Run Your Medical Practice</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              MediMind is a professional-grade assistant built for solo doctors to
              manage patients, generate AI-assisted prescriptions, and maintain
              accurate clinical records.
            </p>

            <div className="mt-10 flex justify-center gap-4 flex-wrap">
              <Link href="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 shadow-lg">
                Explore MediMind
              </Link>
              <a href="#features" className="px-8 py-4 rounded-lg border border-indigo-200 text-indigo-600 font-semibold hover:border-indigo-300">
                Learn More
              </a>
            </div>

            <div className="mt-12 flex justify-center gap-8 text-sm text-gray-500 flex-wrap">
              {['HIPAA-Oriented', 'Doctor-Controlled AI', 'Privacy First'].map((item) => (
                  <div key={item} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Designed for Independent Doctors
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Every feature is built to support clarity, compliance, and efficiency in solo practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                  <div key={i} className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
                    <div className="text-indigo-600 mb-4">{f.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-gray-600">{f.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                How MediMind Fits Into Your Practice
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {s.number}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-gray-600">{s.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Built With Clinical Responsibility
            </h2>
            <p className="text-lg text-indigo-100 mb-8">
              MediMind is a personal project designed with professional standards,
              focusing on privacy, clarity, and safe AI assistance.
            </p>
            <Link href="/register" className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 shadow-lg">
              Explore MediMind
            </Link>
          </div>
        </section>

        <Footer />
      </div>
  );
}
