import React, { useState, useEffect } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { DEFAULT_ACADEMY_LOGO_URL, DEFAULT_CONTACT_DETAILS } from '../constants.ts';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';
import { getItems } from '../services/dataService.ts';
import type { ContactDetails } from '../types.ts';

const Logo = () => {
    const [logoUrl] = useLocalStorage('academyLogoUrl', DEFAULT_ACADEMY_LOGO_URL);
    return (
     <ReactRouterDOM.Link to="/" className="flex items-center">
       <img src={logoUrl} alt="Learners Academy Logo" className="h-12 w-auto" />
    </ReactRouterDOM.Link>
    );
};

const Footer: React.FC = () => {
    const [contactDetails, setContactDetails] = useState<ContactDetails>(() => getItems('contactDetails', DEFAULT_CONTACT_DETAILS));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'contactDetails') {
                setContactDetails(getItems('contactDetails', DEFAULT_CONTACT_DETAILS));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <footer className="bg-brand-dark text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand */}
                    <div className="col-span-1 md:col-span-1">
                         <Logo />
                        <p className="mt-4 text-gray-400 text-sm">Your gateway to a successful career in accounting and finance.</p>
                        <div className="mt-4">
                            <ReactRouterDOM.Link to="/login?role=admin" className="text-xs text-gray-500 hover:text-white">Admin Login</ReactRouterDOM.Link>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-semibold tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-2">
                            <li><ReactRouterDOM.Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</ReactRouterDOM.Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Portals */}
                     <div>
                        <h3 className="font-semibold tracking-wider uppercase">Portals</h3>
                        <ul className="mt-4 space-y-2">
                            <li><ReactRouterDOM.Link to="/login?role=student" className="text-gray-400 hover:text-white transition-colors">Student Portal</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/login?role=faculty" className="text-gray-400 hover:text-white transition-colors">Faculty Portal</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/admissions" className="text-gray-400 hover:text-white transition-colors">Apply Now</ReactRouterDOM.Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h3 className="font-semibold tracking-wider uppercase">Contact Us</h3>
                        <ul className="mt-4 space-y-2 text-gray-400">
                            <li>{contactDetails.address}</li>
                            <li>Email: <a href={`mailto:${contactDetails.email}`} className="hover:text-white transition-colors">{contactDetails.email}</a></li>
                            {contactDetails.phones.map((phone, index) => (
                                <li key={index}>Phone: <a href={`tel:${phone.replace(/-/g, '')}`} className="hover:text-white transition-colors">{phone}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Reliant Learners Academy. All Rights Reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {contactDetails.socials.map(social => (
                            <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label={social.name}>
                                <img src={social.iconUrl} alt={social.name} className="w-6 h-6 object-contain" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;