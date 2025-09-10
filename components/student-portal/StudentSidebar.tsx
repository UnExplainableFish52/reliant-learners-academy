import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { Student } from '../../types.ts';
import { logout } from '../../services/authService.ts';
import ConfirmModal from '../ConfirmModal.tsx';

const icons = {
    dashboard: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>,
    courses: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
    results: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
    profile: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
    community: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    classes: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>,
    fee: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>,
    logout: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
    schedule: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" ><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
    mockTests: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>,
};

const SidebarLink = ({ to, icon, children, onClick }: { to: string; icon: JSX.Element; children: React.ReactNode; onClick?: () => void }) => (
    <NavLink
        to={to}
        end
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center px-4 py-3 space-x-3 rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-brand-red text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
        }
    >
        {icon}
        <span className="font-medium">{children}</span>
    </NavLink>
);

interface StudentSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    student: Student;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, setIsOpen, student }) => {
    const navigate = useNavigate();
    const sidebarRef = useRef<HTMLElement>(null);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    const handleLogoutClick = () => {
        setIsLogoutConfirmOpen(true);
    };

    const handleConfirmLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
            <aside 
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full w-64 bg-brand-dark text-white flex flex-col p-4 z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed`}
            >
                <div className="flex items-center mb-10 px-2">
                    <img src={student.avatarUrl} alt={`${student.name}'s profile picture`} className="w-10 h-10 rounded-full" />
                    <span className="text-xl font-bold ml-3">{student.name}</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <SidebarLink to="/student-portal/dashboard" icon={icons.dashboard} onClick={handleLinkClick}>Dashboard</SidebarLink>
                    <SidebarLink to="/student-portal/courses" icon={icons.courses} onClick={handleLinkClick}>My Courses</SidebarLink>
                    <SidebarLink to="/student-portal/classes" icon={icons.classes} onClick={handleLinkClick}>Classes & Resources</SidebarLink>
                    <SidebarLink to="/student-portal/mock-tests" icon={icons.mockTests} onClick={handleLinkClick}>Mock Tests</SidebarLink>
                    <SidebarLink to="/student-portal/schedule" icon={icons.schedule} onClick={handleLinkClick}>My Schedule</SidebarLink>
                    <SidebarLink to="/student-portal/fee-payment" icon={icons.fee} onClick={handleLinkClick}>Fee Payment</SidebarLink>
                    <SidebarLink to="/student-portal/results" icon={icons.results} onClick={handleLinkClick}>My Results</SidebarLink>
                    <SidebarLink to="/student-portal/community" icon={icons.community} onClick={handleLinkClick}>Community Hub</SidebarLink>
                    <SidebarLink to="/student-portal/profile" icon={icons.profile} onClick={handleLinkClick}>My Profile</SidebarLink>
                </nav>
                <div>
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-3 space-x-3 rounded-lg text-gray-300 hover:bg-red-800 hover:text-white transition-colors duration-200"
                    >
                        {icons.logout}
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
            <ConfirmModal
                isOpen={isLogoutConfirmOpen}
                title="Confirm Logout"
                message="Are you sure you want to log out? Any unsaved changes will be lost."
                onConfirm={handleConfirmLogout}
                onCancel={() => setIsLogoutConfirmOpen(false)}
                confirmText="Log Out"
                cancelText="Cancel"
            />
        </>
    );
};

export default StudentSidebar;
