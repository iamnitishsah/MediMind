import Image from "next/image"
import Link from "next/link"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand & Purpose */}
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-4">
                            <Image src="/logo.svg" alt="MediMind" height={32} width={32} />
                            <span className="ml-2 text-xl font-semibold text-white">
                MediMind
              </span>
                        </div>

                        <p className="max-w-md text-sm leading-relaxed text-gray-400">
                            MediMind is a personal, professional-grade project designed to
                            support independent doctors with secure patient management and
                            AI-assisted clinical workflows. Built with privacy, clarity, and
                            clinical responsibility in mind.
                        </p>

                        <p className="mt-4 text-xs text-gray-500">
                            AI features are assistive only and do not replace professional
                            medical judgment.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                            Navigation
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#features" className="hover:text-white transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-white transition-colors">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-white transition-colors">
                                    Get Started
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-white transition-colors">
                                    Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                            Legal & Support
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                <span className="cursor-not-allowed text-gray-500">
                  Help Center (Coming Soon)
                </span>
                            </li>
                            <li>
                <span className="cursor-not-allowed text-gray-500">
                  Contact Support
                </span>
                            </li>
                            <li>
                <span className="cursor-not-allowed text-gray-500">
                  Privacy Policy
                </span>
                            </li>
                            <li>
                <span className="cursor-not-allowed text-gray-500">
                  Terms of Use
                </span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-500">
                    © 2025 MediMind. Personal project built for educational and professional exploration.
                </div>
            </div>
        </footer>
    )
}
