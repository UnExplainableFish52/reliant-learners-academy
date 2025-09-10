import React from 'react';
import { COURSES } from '../constants.ts';
import type { Course } from '../types.ts';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection.tsx';

const CourseDetailCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100 mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4">{course.title}</h2>
        <p className="text-gray-600 text-lg mb-6">{course.description}</p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div className="bg-brand-beige p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Key Information</h4>
                <p><strong>Duration:</strong> {course.duration}</p>
                <p><strong>Eligibility:</strong> {course.eligibility}</p>
            </div>
             <div className="bg-brand-beige p-6 rounded-lg md:col-span-2">
                <h4 className="font-bold text-lg mb-2">Core Papers</h4>
                <ul className="list-disc list-inside text-gray-700 columns-1 sm:columns-2">
                    {course.papers.map(paper => <li key={paper}>{paper}</li>)}
                </ul>
            </div>
        </div>

        <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
             <a href="/brochure.pdf" download className="bg-brand-dark text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-80 transition-colors inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Brochure
            </a>
            <ReactRouterDOM.Link to={`/courses/${course.id}`} className="bg-brand-red text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-80 transition-colors inline-flex items-center">
                View Details & Syllabus &rarr;
            </ReactRouterDOM.Link>
        </div>
    </div>
);


const CoursesPage: React.FC = () => {
    return (
        <div className="bg-brand-beige">
             <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">ACCA Courses</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">Explore our comprehensive ACCA study pathways and the associated fee structure.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                {COURSES.map(course => (
                    <AnimatedSection key={course.id}>
                        <CourseDetailCard course={course} />
                    </AnimatedSection>
                ))}
            </div>
        </div>
    );
};

export default CoursesPage;