import React, { useState } from 'react';
// FIX: Consolidating all react-router-dom imports to resolve module export errors.
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import type { UserRole, Student, FacultyMember } from '../types.ts';
// FIX: Add missing STUDENTS import
import { STUDENTS, FACULTY_MEMBERS, ADMIN_USER, DEFAULT_ACADEMY_LOGO_URL } from '../constants.ts';
import { getItems } from '../services/dataService.ts';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';

const getStudents = (): Student[] => getItems('students', STUDENTS);
const getFaculty = (): FacultyMember[] => getItems('faculty', FACULTY_MEMBERS);


const LoginPage: React.FC = () => {
    const [searchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();
    const role = (searchParams.get('role') as UserRole) || 'student';
    
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [logoUrl] = useLocalStorage('academyLogoUrl', DEFAULT_ACADEMY_LOGO_URL);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let user: Student | FacultyMember | undefined;
        let path: string = '/';

        if (role === 'student') {
            const allStudents = getStudents();
            user = allStudents.find(s => s.studentId === id && s.password === password);
            path = '/student-portal/dashboard';
        } else if (role === 'faculty') {
            const allFaculty = getFaculty();
            user = allFaculty.find(f => f.username === id && f.password === password);
            path = '/faculty-portal/dashboard';
        } else if (role === 'admin') {
             if (id === 'admin@learners.edu' && password === 'password') { // Simplified admin check
                sessionStorage.setItem('loggedInUser', JSON.stringify(ADMIN_USER));
                sessionStorage.setItem('userRole', 'admin');
                navigate('/admin-portal/dashboard');
                return;
            }
        }
        
        if (user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            sessionStorage.setItem('userRole', role);
            navigate(path);
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    const roleConfig = {
        student: {
            title: 'Student Portal Login',
            idLabel: 'Student ID',
            idPlaceholder: 'e.g., S12345',
            idType: 'text',
            switchRoleLink: '/login?role=faculty',
            switchRoleText: 'Faculty Login'
        },
        faculty: {
            title: 'Faculty Portal Login',
            idLabel: 'Faculty Username',
            idPlaceholder: 'e.g., kabin.p',
            idType: 'text',
            switchRoleLink: '/login?role=student',
            switchRoleText: 'Student Login'
        },
        admin: {
            title: 'Admin Portal Login',
            idLabel: 'Admin Email',
            idPlaceholder: 'e.g., admin@learners.edu',
            idType: 'email',
            switchRoleLink: '/',
            switchRoleText: ''
        },
    };
    
    const { title, idLabel, idPlaceholder, idType, switchRoleLink, switchRoleText } = roleConfig[role];

    return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-brand-beige">
            <div className="mb-8 text-center">
                <img src={logoUrl} alt="Learners Academy Logo" className="h-20 w-auto mx-auto" />
                <h1 className="text-2xl font-bold text-brand-dark mt-4">Reliant Learners Academy</h1>
            </div>
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="id" className="block text-sm font-medium text-gray-700">{idLabel}</label>
                        <input 
                            type={idType} 
                            name="id" 
                            id="id" 
                            required 
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            placeholder={idPlaceholder}
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-red text-white py-3 px-4 rounded-md font-semibold hover:bg-red-700 transition-colors">Login</button>
                    {role !== 'admin' && (
                        <p className="text-center text-sm text-gray-600">
                           <ReactRouterDOM.Link to={switchRoleLink} className="font-medium text-brand-red hover:underline">{switchRoleText}</ReactRouterDOM.Link>
                        </p>
                    )}
                     <p className="text-center text-xs text-gray-500 mt-4">
                        <ReactRouterDOM.Link to="/" className="hover:underline">← Back to Main Site</ReactRouterDOM.Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;