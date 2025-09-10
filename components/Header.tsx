import React, { useState, useRef, useEffect } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import NewsTicker from './NewsTicker.tsx';
import { DEFAULT_ACADEMY_LOGO_URL } from '../constants.ts';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';

const navLinksList = [
    { to: "/", text: "Home" },
    { to: "/about", text: "About" },
    { to: "/courses", text: "Courses" },
    { to: "/admissions", text: "Admissions" },
    { to: "/gallery", text: "Gallery" },
    { to: "/faq", text: "FAQ" },
    { to: "/blog", text: "Blog" },
    { to: "/contact", text: "Contact" },
];

const Logo = () => {
    const [logoUrl] = useLocalStorage('academyLogoUrl', DEFAULT_ACADEMY_LOGO_URL);
    return (
         <ReactRouterDOM.NavLink to="/" className="flex items-center">
            <img src={logoUrl} alt="Learners Academy Logo" className="h-12 w-auto" />
            <span className="ml-3 text-xl font-bold text-brand-dark hidden sm:inline">Reliant Learners Academy</span>
        </ReactRouterDOM.NavLink>
    );
};

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const loginRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
                setIsLoginOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    return (
        <>
            <NewsTicker />
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-4 flex justify-between items-center">
                    <Logo />
                    <div className="flex items-center">
                        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
                            {navLinksList.map(link => (
                                <ReactRouterDOM.NavLink 
                                    key={link.to} 
                                    to={link.to} 
                                    className={({ isActive }) => 
                                        `font-semibold text-sm lg:text-base ${isActive ? 'text-brand-red' : 'text-brand-dark'} hover:text-brand-red transition-colors px-2 py-1 rounded-md`
                                    }
                                >
                                    {link.text}
                                </ReactRouterDOM.NavLink>
                            ))}
                        </nav>
                         {/* Desktop Login Button */}
                        <div ref={loginRef} className="hidden md:block relative ml-4">
                            <button
                                onClick={() => setIsLoginOpen(prev => !prev)}
                                className="bg-brand-red text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-700 transition-colors flex items-center"
                                aria-haspopup="true"
                                aria-expanded={isLoginOpen}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login
                            </button>
                            {isLoginOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border animate-fade-in-down">
                                    <ReactRouterDOM.Link to="/login?role=student" onClick={() => setIsLoginOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Student Portal</ReactRouterDOM.Link>
                                    <ReactRouterDOM.Link to="/login?role=faculty" onClick={() => setIsLoginOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Faculty Portal</ReactRouterDOM.Link>
                                </div>
                            )}
                             <style>{`
                                @keyframes fade-in-down {
                                    0% { opacity: 0; transform: translateY(-10px); }
                                    100% { opacity: 1; transform: translateY(0); }
                                }
                                .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
                            `}</style>
                        </div>

                        <div className="md:hidden ml-4">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
                                <svg className="w-6 h-6 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen' : 'max-h-0'} overflow-hidden`}>
                    <nav className="flex flex-col space-y-1 px-4 pb-4">
                        {navLinksList.map(link => (
                            <ReactRouterDOM.NavLink 
                                key={link.to} 
                                to={link.to} 
                                className={({ isActive }) => 
                                    `block py-2 px-3 text-base font-medium rounded-md ${isActive ? 'text-brand-red bg-red-50' : 'text-brand-dark hover:bg-gray-100'}`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.text}
                            </ReactRouterDOM.NavLink>
                        ))}
                        <div className="border-t my-2"></div>
                        <ReactRouterDOM.Link to="/login?role=student" className="block py-2 px-3 text-base font-medium rounded-md text-brand-dark hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                            Student Login
                        </ReactRouterDOM.Link>
                        <ReactRouterDOM.Link to="/login?role=faculty" className="block py-2 px-3 text-base font-medium rounded-md text-brand-dark hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                            Faculty Login
                        </ReactRouterDOM.Link>
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Header;