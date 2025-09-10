import React, { useState, useEffect } from 'react';
import { FACULTY_MEMBERS } from '../constants.ts';
import AnimatedSection from '../components/AnimatedSection.tsx';
import type { FacultyMember } from '../types.ts';
import { getItems } from '../services/dataService.ts';

const ListItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <li className="flex items-start">
        <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
            <h4 className="font-bold text-lg text-brand-dark">{title}</h4>
            <p className="text-gray-600 text-base">{children}</p>
        </div>
    </li>
);

const AboutPage: React.FC = () => {
    const [faculty, setFaculty] = useState<FacultyMember[]>(() => getItems('faculty', FACULTY_MEMBERS));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'faculty') {
                setFaculty(getItems('faculty', FACULTY_MEMBERS));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div className="bg-white">
            <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">📘 About Us – Reliant Learners Academy</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">At Reliant Learners Academy, we believe education is more than just passing exams — it’s about building the skills, confidence, and mindset to succeed in the professional world. Founded with the vision of guiding ambitious learners toward global qualifications, we specialize in providing comprehensive training for ACCA and other professional courses.</p>
                </div>
            </div>

            <AnimatedSection>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <p className="text-lg text-gray-700">
                             Our academy is built on three core values: excellence, integrity, and dedication. We are committed to ensuring that every student receives not just classroom teaching, but a holistic learning experience that combines knowledge, practice, mentorship, and real-world exposure.
                        </p>
                    </div>
                </div>
            </AnimatedSection>
            
            <AnimatedSection>
                <div className="bg-brand-beige py-12 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-brand-red mb-4">🎯 Our Mission</h2>
                                 <p className="text-gray-600 mb-6 text-lg">
                                    To empower students with world-class education, personalized guidance, and career-focused training, helping them achieve professional success and contribute positively to society.
                                </p>
                                <h2 className="text-2xl md:text-3xl font-bold text-brand-red mb-4">🌍 Our Vision</h2>
                                <p className="text-gray-600 text-lg">
                                    To be the most trusted and result-oriented academy for ACCA and professional qualifications, shaping the next generation of finance and business leaders.
                                </p>
                            </div>
                            <div>
                                <img src="https://picsum.photos/seed/vision-mission/600/400" alt="Our Mission" className="rounded-lg shadow-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            <AnimatedSection>
                 <div className="py-12 md:py-20 bg-white">
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold">📌 Why Choose Reliant Learners Academy?</h2>
                        </div>
                        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-8">
                            <ul className="space-y-6">
                                <ListItem title="Expert Faculty">Highly qualified tutors with years of teaching and industry experience.</ListItem>
                                <ListItem title="Structured Learning">Well-designed study plans, mock tests, and exam-focused sessions.</ListItem>
                                <ListItem title="Student-Centered Approach">Small batches, personalized attention, and one-on-one mentoring.</ListItem>
                            </ul>
                            <ul className="space-y-6">
                                <ListItem title="Modern Facilities">Comfortable classrooms, digital learning support, and updated study resources.</ListItem>
                                <ListItem title="Proven Results">Consistent track record of students passing ACCA exams on the first attempt.</ListItem>
                            </ul>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

             <AnimatedSection>
                 <div className="bg-brand-beige py-12 md:py-20">
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold">✨ What We Offer</h2>
                        </div>
                        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-8">
                            <ul className="space-y-6">
                                <ListItem title="ACCA Coaching">Complete guidance for all levels — Applied Knowledge, Applied Skills, and Strategic Professional.</ListItem>
                                <ListItem title="Workshops & Seminars">Regular sessions on exam techniques, career guidance, and industry insights.</ListItem>
                            </ul>
                            <ul className="space-y-6">
                                <ListItem title="Learning Support">Online and offline resources, doubt-clearing sessions, and continuous progress tracking.</ListItem>
                            </ul>
                        </div>
                         <p className="text-center mt-12 text-lg text-gray-700 font-semibold max-w-3xl mx-auto">
                            At Reliant Learners Academy, your goals are our goals. Whether you’re starting your ACCA journey or preparing for advanced levels, we are here to ensure you learn, grow, and succeed.
                        </p>
                    </div>
                </div>
            </AnimatedSection>

            <AnimatedSection>
                <div className="py-12 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold">Meet the Team</h2>
                            <p className="text-gray-600 mt-2">Our leadership and faculty comprise seasoned professionals passionate about ACCA education.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                            {faculty.map(member => (
                                <div key={member.id} className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border">
                                    <img src={member.imageUrl} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-brand-red" />
                                    <h3 className="text-xl font-bold">{member.name}</h3>
                                    <p className="text-brand-red mb-2 text-sm font-semibold">{member.qualification}</p>
                                    <p className="text-base text-gray-600">{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </div>
    );
};

export default AboutPage;