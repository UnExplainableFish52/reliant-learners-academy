import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { COURSES } from '../../constants.ts';
import { useStudent } from '../StudentPortalPage.tsx';

const MyCourses: React.FC = () => {
    const { student } = useStudent();

    // This hardcoded data simulates progress for various papers.
    // In a real application, this would come from a database.
    const paperDetails = { 
        'LW: Corporate and Business Law': { progress: 80, instructor: 'Ms. Emily White', nextDeadline: 'Quiz 3: Aug 5' },
        'PM: Performance Management': { progress: 60, instructor: 'Mr. Robert Brown', nextDeadline: 'Assignment 2: Aug 12' },
        'TX: Taxation': { progress: 95, instructor: 'Ms. Emily White', nextDeadline: 'Final Mock: Aug 20' },
        'FR: Financial Reporting': { progress: 75, instructor: 'Dr. Jane Smith', nextDeadline: 'Assignment 3: Aug 15' },
        'AA: Audit and Assurance': { progress: 45, instructor: 'Dr. Jane Smith', nextDeadline: 'Case Study: Aug 18' },
        'FM: Financial Management': { progress: 50, instructor: 'Mr. Robert Brown', nextDeadline: 'Quiz 4: Aug 9' },
        'AB: Accountant in Business': { progress: 90, instructor: 'Kabin Pyakurel', nextDeadline: 'Final Mock: Aug 25' },
        'MA: Management Accounting': { progress: 85, instructor: 'Emily White', nextDeadline: 'Assignment 4: Aug 22' },
        'FA: Financial Accounting': { progress: 92, instructor: 'Robert Brown', nextDeadline: 'Case Study: Aug 28' },
    };

     const allPapersMap = useMemo(() => {
        const map = new Map<string, { fullName: string; level: string }>();
        COURSES.forEach(course => {
            course.papers.forEach(paperName => {
                const paperCode = paperName.split(':')[0].trim();
                map.set(paperCode, {
                    fullName: paperName,
                    level: course.level
                });
            });
        });
        return map;
    }, []);

    if (!student) {
        return <div>Loading student data...</div>;
    }

    const course = COURSES.find(c => c.level === student.currentLevel);
    
    if (!course) {
         return <div>Error: Could not determine course level for this student.</div>;
    }


    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">My Courses</h1>
            <div className="space-y-8">
                <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-brand-red mb-1">{course.title}</h2>
                    <p className="text-gray-600 mt-1 mb-6 border-b pb-4">{course.level}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {student.enrolledPapers.map(paperCode => {
                            const paperInfo = allPapersMap.get(paperCode);
                            if (!paperInfo) return null; // Should not happen with good data

                            const details = paperDetails[paperInfo.fullName as keyof typeof paperDetails];
                            
                            return (
                                <div key={paperCode} className="bg-brand-beige p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-bold text-lg text-brand-dark">{paperInfo.fullName}</p>
                                        <p className="text-sm text-gray-500 mb-4">Instructor: {details?.instructor || 'TBA'}</p>
                                        
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs font-medium text-gray-700">Progress</span>
                                                <span className="text-xs font-medium text-brand-red">{details?.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-300 rounded-full h-2">
                                                <div className="bg-brand-red h-2 rounded-full" style={{ width: `${details?.progress || 0}%`}}></div>
                                            </div>
                                        </div>

                                        <div className="mt-4 bg-white p-3 rounded-md border text-sm">
                                            <p className="font-semibold text-gray-500">Next Deadline:</p>
                                            <p className="font-bold text-brand-dark">{details?.nextDeadline || 'None'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <Link 
                                            to={`/student-portal/classes?paper=${encodeURIComponent(paperInfo.fullName)}`} 
                                            className="w-full text-center bg-brand-dark text-white py-2 px-4 rounded-md font-semibold hover:bg-opacity-80 transition-colors block"
                                        >
                                            View Resources
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                        {student.enrolledPapers.length === 0 && (
                            <p className="text-gray-500 md:col-span-2 lg:col-span-3">You are not currently enrolled in any papers for this level.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyCourses;