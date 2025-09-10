import React from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';

const navLinks = [
    { to: "/", text: "Home" },
    { to: "/about", text: "About" },
    { to: "/courses", text: "Courses" },
    { to: "/admissions", text: "Admissions" },
    { to: "/gallery", text: "Gallery" },
    { to: "/faq", text: "FAQ" },
    { to: "/contact", text: "Contact" },
];

const NavigationBar: React.FC = () => {
    return (
        <nav className="bg-brand-beige shadow-sm hidden md:flex">
            <div className="container mx-auto px-6 py-3 flex justify-center items-center space-x-4">
                {navLinks.map((link, index) => (
                    <React.Fragment key={link.to}>
                        <ReactRouterDOM.NavLink 
                            to={link.to} 
                            className={({ isActive }) => 
                                `font-medium ${isActive ? 'text-brand-red' : 'text-brand-dark'} hover:text-brand-red transition-colors duration-300`
                            }
                        >
                            {link.text}
                        </ReactRouterDOM.NavLink>
                        {index < navLinks.length - 1 && (
                            <span className="text-gray-300">|</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </nav>
    );
};

export default NavigationBar;