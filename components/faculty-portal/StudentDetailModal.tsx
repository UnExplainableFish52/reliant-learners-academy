import React, { useRef, useEffect, useMemo } from 'react';
import type { Student } from '../../types';

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    facultyPapers: string[];
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-md text-gray-900">{value}</dd>
    </div>
);


const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, student, facultyPapers }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const facultyPaperCodes = useMemo(() => facultyPapers.map(p => p.split(':')[0].trim()), [facultyPapers]);

    const relevantGrades = useMemo(() => {
        if (!student.grades) return [];
        return Object.entries(student.grades)
            .filter(([code]) => facultyPaperCodes.includes(code))
            .flatMap(([code, grades]) => grades.map(grade => ({ code, ...grade })))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [student.grades, facultyPaperCodes]);
    
    const relevantAttendance = useMemo(() => {
        if (!student.attendance) return [];
        return Object.entries(student.attendance)
            .filter(([code]) => facultyPaperCodes.includes(code))
            .map(([code, percentage]) => ({ code, percentage }));
    }, [student.attendance, facultyPaperCodes]);


    if (!isOpen) return null;


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full border-2 border-brand-red object-cover" />
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark">{student.name}</h2>
                            <p className="text-gray-500 font-mono">{student.studentId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     <section>
                        <h3 className="text-lg font-bold text-brand-red mb-4 border-b pb-2">Personal Details</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <DetailRow label="Email Address" value={student.email} />
                            <DetailRow label="Phone Number" value={student.phone} />
                            <DetailRow label="Address" value={student.address} />
                            <DetailRow label="Date of Birth" value={student.dob} />
                        </dl>
                    </section>
                    
                     <section>
                        <h3 className="text-lg font-bold text-brand-red mb-4 border-b pb-2">Academic Details (My Papers)</h3>
                        <p className="mb-4"><span className="font-semibold">Current ACCA Level:</span> {student.currentLevel}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Mock Exam History</h4>
                                {relevantGrades.length > 0 ? (
                                    <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-2">
                                        {relevantGrades.map((grade, index) => (
                                            <li key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                                <span>{grade.code}</span>
                                                <div className="text-right">
                                                    <span className="font-bold">{grade.score} / 100</span>
                                                    <span className="ml-2 text-gray-500 font-mono text-xs">{grade.date}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500">No grades recorded for my papers yet.</p>}
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2">Attendance</h4>
                                 {relevantAttendance.length > 0 ? (
                                    <ul className="space-y-1 text-sm">
                                        {relevantAttendance.map(({ code, percentage }) => (
                                            <li key={code} className="flex justify-between p-2 bg-gray-50 rounded">
                                                <span>{code}</span>
                                                <span className="font-bold">{percentage}%</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500">No attendance recorded for my papers yet.</p>}
                            </div>
                        </div>
                    </section>
                </div>
                
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-brand-dark text-white font-semibold px-6 py-2 rounded-md hover:bg-black transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;