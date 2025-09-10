import React, { useState, useEffect } from 'react';
import { FACULTY_MEMBERS } from '../../constants.ts';
import type { FacultyMember } from '../../types.ts';
import AddFacultyModal from '../../components/admin-portal/AddFacultyModal.tsx';
import FacultyDetailModal from '../../components/admin-portal/FacultyDetailModal.tsx';
import ConfirmModal from '../../components/ConfirmModal.tsx';
import { useNavigate } from 'react-router-dom';
import { getLoggedInUser } from '../../services/authService.ts';

const ManageFaculty: React.FC = () => {
    const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
        try {
            const saved = localStorage.getItem('faculty');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error(`Failed to load faculty from localStorage`, e);
        }
        return FACULTY_MEMBERS;
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
    const [notification, setNotification] = useState('');
    const [facultyToDelete, setFacultyToDelete] = useState<FacultyMember | null>(null);
    const [facultyToImpersonate, setFacultyToImpersonate] = useState<FacultyMember | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            localStorage.setItem('faculty', JSON.stringify(faculty));
        } catch (error) {
            console.error("Failed to save faculty to localStorage", error);
        }
    }, [faculty]);

    const filteredFaculty = faculty.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddFaculty = (newFacultyMember: FacultyMember) => {
        setFaculty(prev => [newFacultyMember, ...prev]);
        setIsAddModalOpen(false);
    };
    
    const handleDeleteClick = (facultyMember: FacultyMember) => {
        setFacultyToDelete(facultyMember);
    };

    const handleConfirmDelete = () => {
        if (facultyToDelete) {
            setFaculty(prev => prev.filter(f => f.id !== facultyToDelete.id));
            setNotification(`Faculty member "${facultyToDelete.name}" has been deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setFacultyToDelete(null);
        }
    };
    
    const handleSaveFaculty = (updatedFaculty: FacultyMember) => {
        setFaculty(prev => prev.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
        setSelectedFaculty(null);
    };

    const handleLoginAsClick = (facultyMember: FacultyMember) => {
        setFacultyToImpersonate(facultyMember);
    };

    const handleConfirmLoginAs = () => {
        if (!facultyToImpersonate) return;

        const { user: adminUser, role: adminRole } = getLoggedInUser();
        if (adminUser && adminRole === 'admin') {
            sessionStorage.setItem('impersonator', JSON.stringify({ user: adminUser, role: adminRole }));
            sessionStorage.setItem('loggedInUser', JSON.stringify(facultyToImpersonate));
            sessionStorage.setItem('userRole', 'faculty');
            navigate('/faculty-portal/dashboard');
        } else {
            alert('Error: Impersonation failed. Not logged in as admin.');
        }
        setFacultyToImpersonate(null);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Manage Faculty</h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search faculty..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 bg-white"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex-shrink-0"
                    >
                        Add New Faculty
                    </button>
                </div>
            </div>

            {notification && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md transition-opacity duration-300">
                    {notification}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Faculty Name</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Email</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Qualification</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Assigned Papers</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredFaculty.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="p-4 flex items-center">
                                        <img src={member.imageUrl} alt={member.name} className="w-10 h-10 rounded-full mr-3" />
                                        <span className="font-medium">{member.name}</span>
                                    </td>
                                    <td className="p-4 text-sm">{member.email}</td>
                                    <td className="p-4 text-sm">{member.qualification}</td>
                                    <td className="p-4 text-sm">
                                        {member.assignedPapers.length > 2 
                                            ? `${member.assignedPapers.slice(0,2).join(', ')}, ...`
                                            : member.assignedPapers.join(', ')
                                        }
                                    </td>
                                    <td className="p-4 space-x-4 whitespace-nowrap">
                                        <button onClick={() => setSelectedFaculty(member)} className="text-sm font-semibold text-blue-600 hover:underline">View Details</button>
                                        <button onClick={() => handleLoginAsClick(member)} className="text-sm font-semibold text-green-600 hover:underline">Go to Portal</button>
                                        <button onClick={() => handleDeleteClick(member)} className="text-sm font-semibold text-brand-red hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddFacultyModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddFaculty={handleAddFaculty}
            />
            {selectedFaculty && (
                <FacultyDetailModal
                    isOpen={!!selectedFaculty}
                    onClose={() => setSelectedFaculty(null)}
                    faculty={selectedFaculty}
                    onSave={handleSaveFaculty}
                />
            )}
             <ConfirmModal
                isOpen={!!facultyToDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to permanently delete the faculty member "${facultyToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setFacultyToDelete(null)}
                confirmText="Delete"
            />
             <ConfirmModal
                isOpen={!!facultyToImpersonate}
                title="Confirm Portal Access"
                message={`Are you sure you want to log in as "${facultyToImpersonate?.name}"? You will be redirected to their faculty portal.`}
                onConfirm={handleConfirmLoginAs}
                onCancel={() => setFacultyToImpersonate(null)}
                confirmText="Log in as Faculty"
                cancelText="Cancel"
            />
        </div>
    );
};

export default ManageFaculty;