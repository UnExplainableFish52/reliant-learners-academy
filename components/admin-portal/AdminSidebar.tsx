import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ADMIN_USER, DEFAULT_ACADEMY_LOGO_URL } from '../../constants';
import { logout } from '../../services/authService';
import ConfirmModal from '../../components/ConfirmModal.tsx';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const icons = {
    dashboard: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>,
    inbox: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
    students: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    faculty: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.24.232-.487.34-.737m-4.118 6.075c.62-1.299 1.154-2.697 1.6-4.125m.001-3.75v.01c0 .218.01.437.028.65m-3.75 0c.056.126.118.25.185.375m-3.75 0a9.348 9.348 0 019-5.334c1.5 0 2.896.398 4.121.952A4.125 4.125 0 009 12.348M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    courses: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
    admissions: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>,
    announcements: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.277 0 7.423-4.586 6.357-8.455A4.002 4.002 0 0118 4v6c0 .635-.21 1.223-.592 1.699l-2.147 6.15a1.76 1.76 0 01-3.417-.592V5.882z"></path></svg>,
    fees: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>,
    salary: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
    mockTests: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>,
    ratings: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>,
    content: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
    settings: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
    logout: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
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

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const sidebarRef = useRef<HTMLElement>(null);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [logoUrl] = useLocalStorage('academyLogoUrl', DEFAULT_ACADEMY_LOGO_URL);

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

    const admin = ADMIN_USER;

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
            <aside
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full w-64 bg-brand-dark text-white flex flex-col p-4 z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed`}
            >
                <div className="flex items-center mb-10 px-2">
                    <img src={logoUrl} alt={`${admin.name}'s profile picture`} className="w-10 h-10 rounded-full" />
                    <div className="ml-3">
                        <p className="text-lg font-bold leading-tight">{admin.name}</p>
                        <p className="text-xs text-gray-400">Administrator</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
                    <SidebarLink to="/admin-portal/dashboard" icon={icons.dashboard} onClick={handleLinkClick}>Dashboard</SidebarLink>
                    <SidebarLink to="/admin-portal/inbox" icon={icons.inbox} onClick={handleLinkClick}>Inbox</SidebarLink>
                    <SidebarLink to="/admin-portal/students" icon={icons.students} onClick={handleLinkClick}>Students</SidebarLink>
                    <SidebarLink to="/admin-portal/faculty" icon={icons.faculty} onClick={handleLinkClick}>Faculty</SidebarLink>
                    <SidebarLink to="/admin-portal/courses" icon={icons.courses} onClick={handleLinkClick}>Courses</SidebarLink>
                    <SidebarLink to="/admin-portal/admissions" icon={icons.admissions} onClick={handleLinkClick}>Admissions</SidebarLink>
                    <SidebarLink to="/admin-portal/announcements" icon={icons.announcements} onClick={handleLinkClick}>Announcements</SidebarLink>
                    <SidebarLink to="/admin-portal/fees" icon={icons.fees} onClick={handleLinkClick}>Fee Management</SidebarLink>
                    <SidebarLink to="/admin-portal/salary" icon={icons.salary} onClick={handleLinkClick}>Manage Salary</SidebarLink>
                    <SidebarLink to="/admin-portal/mock-tests" icon={icons.mockTests} onClick={handleLinkClick}>Mock Tests & Submissions</SidebarLink>
                    <SidebarLink to="/admin-portal/ratings" icon={icons.ratings} onClick={handleLinkClick}>Teacher Ratings</SidebarLink>
                    <SidebarLink to="/admin-portal/content" icon={icons.content} onClick={handleLinkClick}>Site Content</SidebarLink>
                    <SidebarLink to="/admin-portal/settings" icon={icons.settings} onClick={handleLinkClick}>Settings</SidebarLink>
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

export default AdminSidebar;