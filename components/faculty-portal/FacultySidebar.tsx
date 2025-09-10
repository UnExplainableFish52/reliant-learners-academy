import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { FacultyMember } from '../../types.ts';
import { logout } from '../../services/authService.ts';
import ConfirmModal from '../ConfirmModal.tsx';

const icons = {
    dashboard: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>,
    classes: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
    grading: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
    profile: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
    logout: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
    announcements: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.277 0 7.423-4.586 6.357-8.455A4.002 4.002 0 0118 4v6c0 .635-.21 1.223-.592 1.699l-2.147 6.15a1.76 1.76 0 01-3.417-.592V5.882z"></path></svg>,
    schedule: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
    questions: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
    students: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    salary: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
    mockTests: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>,
    submissions: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>,
    contactAdmin: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
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

interface FacultySidebarProps {
    isOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    facultyMember: FacultyMember;
}

const FacultySidebar: React.FC<FacultySidebarProps> = ({ isOpen, setIsSidebarOpen, facultyMember }) => {
    const navigate = useNavigate();
    const sidebarRef = useRef<HTMLElement>(null);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsSidebarOpen]);

    const handleLogoutClick = () => {
        setIsLogoutConfirmOpen(true);
    };

    const handleConfirmLogout = () => {
        logout();
        setIsSidebarOpen(false);
        navigate('/');
    };
    
    const handleLinkClick = () => {
        setIsSidebarOpen(false);
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
            <aside
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full w-64 bg-brand-dark text-white flex flex-col p-4 z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed`}
            >
                <div className="flex items-center mb-10 px-2">
                    <img src={facultyMember.imageUrl} alt={`${facultyMember.name}'s profile picture`} className="w-10 h-10 rounded-full" />
                    <div className="ml-3">
                        <p className="text-lg font-bold leading-tight">{facultyMember.name}</p>
                        <p className="text-xs text-gray-400">Faculty</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-2">
                    <SidebarLink to="/faculty-portal/dashboard" icon={icons.dashboard} onClick={handleLinkClick}>Dashboard</SidebarLink>
                    <SidebarLink to="/faculty-portal/classes" icon={icons.classes} onClick={handleLinkClick}>My Classes</SidebarLink>
                    <SidebarLink to="/faculty-portal/my-students" icon={icons.students} onClick={handleLinkClick}>My Students</SidebarLink>
                    <SidebarLink to="/faculty-portal/mock-tests" icon={icons.mockTests} onClick={handleLinkClick}>Manage Tests</SidebarLink>
                    <SidebarLink to="/faculty-portal/submissions" icon={icons.submissions} onClick={handleLinkClick}>Test Submissions</SidebarLink>
                    <SidebarLink to="/faculty-portal/announcements" icon={icons.announcements} onClick={handleLinkClick}>Announcements</SidebarLink>
                    <SidebarLink to="/faculty-portal/schedule" icon={icons.schedule} onClick={handleLinkClick}>My Schedule</SidebarLink>
                    <SidebarLink to="/faculty-portal/student-questions" icon={icons.questions} onClick={handleLinkClick}>Student Questions</SidebarLink>
                    <SidebarLink to="/faculty-portal/salary" icon={icons.salary} onClick={handleLinkClick}>My Salary</SidebarLink>
                     <SidebarLink to="/faculty-portal/contact-admin" icon={icons.contactAdmin} onClick={handleLinkClick}>Contact Admin</SidebarLink>
                    <SidebarLink to="/faculty-portal/profile" icon={icons.profile} onClick={handleLinkClick}>My Profile</SidebarLink>
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

export default FacultySidebar;