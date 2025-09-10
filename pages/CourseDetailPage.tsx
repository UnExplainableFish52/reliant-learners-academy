import React, { useState, useEffect } from 'react';
// FIX: Consolidating all react-router-dom imports to resolve module export errors.
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Add missing ACCA_FEE_STRUCTURE import.
import { COURSES, FACULTY_MEMBERS, ACCA_FEE_STRUCTURE } from '../constants.ts';
import type { FacultyMember, AccaFeeCategory } from '../types.ts';

const SyllabusAccordion: React.FC<{ syllabus: { topic: string; details: string }[] }> = ({ syllabus }) => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {syllabus.map((item, index) => (
                <div key={index} className="border rounded-md overflow-hidden">
                    <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex justify-between items-center text-left p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                        aria-expanded={openIndex === index}
                        aria-controls={`syllabus-content-${index}`}
                    >
                        <span className="font-semibold text-brand-dark">{item.topic}</span>
                        <svg 
                            className={`w-5 h-5 text-brand-red transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div
                        id={`syllabus-content-${index}`}
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                    >
                        <p className="p-4 text-gray-600 border-t">{item.details}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


const FacultyCard: React.FC<{ member: FacultyMember }> = ({ member }) => (
    <div className="text-center bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <img src={member.imageUrl} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white shadow-sm" />
        <h4 className="text-md font-bold">{member.name}</h4>
        <p className="text-brand-red text-sm">{member.qualification}</p>
    </div>
);

const CourseFeeStructure: React.FC<{ feeCategories: AccaFeeCategory[] }> = ({ feeCategories }) => {
    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '-';
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (feeCategories.length === 0) {
        return <p className="text-gray-600">Fee information for this level is not available at the moment. Please contact admissions for details.</p>;
    }

    return (
        <div className="overflow-x-auto bg-brand-beige p-4 sm:p-6 rounded-lg">
            <table className="w-full text-left min-w-[700px]">
                <thead className="border-b-2 border-brand-red">
                    <tr>
                        <th className="p-3 font-bold text-brand-dark uppercase tracking-wider text-sm w-[30%]">Paper</th>
                        <th className="p-3 font-bold text-brand-dark uppercase tracking-wider text-sm">Details</th>
                        <th className="p-3 font-bold text-brand-dark uppercase tracking-wider text-sm text-right">UK Fees (NRS)</th>
                        <th className="p-3 font-bold text-brand-dark uppercase tracking-wider text-sm text-right">College Fees (NRS)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {feeCategories.map((category, catIndex) => (
                        <React.Fragment key={catIndex}>
                            <tr className="bg-gray-700 text-white">
                                <td colSpan={4} className="p-3 font-bold">
                                    {category.level}
                                    {category.description && <span className="font-normal text-sm block text-gray-300">{category.description}</span>}
                                </td>
                            </tr>
                            {category.items.map((item, itemIndex) => (
                                <tr key={itemIndex} className="hover:bg-gray-50 align-top">
                                    <td className="p-3 font-semibold">{item.paper || '-'}</td>
                                    <td className="p-3">{item.details}</td>
                                    <td className="p-3 text-right font-mono">{formatCurrency(item.ukFeesNrs)}</td>
                                    <td className="p-3 text-right font-mono">{formatCurrency(item.collegeFeesNrs)}</td>
                                </tr>
                            ))}
                            {category.subtotals && (
                                <tr className="bg-yellow-100 font-bold">
                                    <td colSpan={2} className="p-3 text-right text-brand-dark">Subtotal</td>
                                    <td className="p-3 text-right font-mono text-brand-dark">{formatCurrency(category.subtotals.ukFeesNrs)}</td>
                                    <td className="p-3 text-right font-mono text-brand-dark">{formatCurrency(category.subtotals.collegeFeesNrs)}</td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
             <div className="mt-6 text-center text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg">
                <p><strong>Disclaimer:</strong> All fees are subject to change without prior notice. The external fees payable to ACCA are based on current exchange rates and may vary. Please confirm the latest fees with our admissions office.</p>
            </div>
        </div>
    );
};


const CourseDetailPage: React.FC = () => {
    const { courseId } = ReactRouterDOM.useParams<{ courseId: string }>();
    const course = COURSES.find(c => c.id === courseId);
    const [allFaculty, setAllFaculty] = useState<FacultyMember[]>([]);

    useEffect(() => {
        const storedFaculty = localStorage.getItem('faculty');
        setAllFaculty(storedFaculty ? JSON.parse(storedFaculty) : FACULTY_MEMBERS);
    }, []);
    
    if (!course) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
                <h1 className="text-3xl font-bold">Course Not Found</h1>
                <p className="mt-4">The course you are looking for does not exist.</p>
                <ReactRouterDOM.Link to="/courses" className="mt-6 inline-block bg-brand-red text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700">
                    Back to Courses
                </ReactRouterDOM.Link>
            </div>
        );
    }
    
    const courseFaculty = allFaculty.filter(member => course.facultyIds.includes(member.id));
    
    const courseLevelMapping: { [key: string]: string[] } = {
        'Applied Knowledge': ['ACCA Knowledge Level'],
        'Applied Skills': ['ACCA Skills Level'],
        'Strategic Professional': ['Strategic Professional'],
    };

    const relevantFeeLevels = courseLevelMapping[course.level] || [];
    const courseFeeCategories = ACCA_FEE_STRUCTURE.filter(cat => relevantFeeLevels.includes(cat.level));


    return (
        <div className="bg-white">
            <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">{course.level}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <ReactRouterDOM.Link to="/courses" className="inline-flex items-center text-brand-red font-semibold hover:underline mb-6 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Courses
                        </ReactRouterDOM.Link>
                        <section id="description" className="mb-12">
                             <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 border-b-2 border-brand-red pb-2">Course Overview</h2>
                             <p className="text-gray-700 leading-relaxed">{course.description}</p>
                        </section>
                        
                        <section id="syllabus" className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 border-b-2 border-brand-red pb-2">Syllabus</h2>
                            <SyllabusAccordion syllabus={course.syllabus} />
                        </section>

                        <section id="outcomes" className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 border-b-2 border-brand-red pb-2">Learning Outcomes</h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4 text-base">
                                {course.learningOutcomes.map((outcome, index) => <li key={index}>{outcome}</li>)}
                            </ul>
                        </section>

                         <section id="fees">
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 border-b-2 border-brand-red pb-2">Fee Structure</h2>
                            <CourseFeeStructure feeCategories={courseFeeCategories} />
                        </section>
                    </div>

                    <aside className="lg:col-span-1">
                        <div className="bg-brand-beige p-6 rounded-lg shadow-lg sticky top-28">
                            <h3 className="text-2xl font-bold text-brand-dark mb-4">Meet Your Instructors</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {courseFaculty.length > 0 ? (
                                    courseFaculty.map(member => <FacultyCard key={member.id} member={member} />)
                                ) : (
                                    <p className="col-span-2 text-gray-600">Instructor information coming soon.</p>
                                )}
                            </div>
                            <ReactRouterDOM.Link to="/admissions" className="mt-8 block w-full text-center bg-brand-red text-white py-3 rounded-md font-semibold hover:bg-red-700 transition-colors shadow-md">
                                Apply for this Course
                            </ReactRouterDOM.Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;