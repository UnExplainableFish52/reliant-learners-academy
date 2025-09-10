
import React, { useState, useEffect } from 'react';
import { FAQ_DATA } from '../constants.ts';
import Accordion from '../components/Accordion.tsx';
import AnimatedSection from '../components/AnimatedSection.tsx';
import { getItems } from '../services/dataService.ts';
import type { FAQItem } from '../types.ts';

const FAQPage: React.FC = () => {
    const [faqData, setFaqData] = useState<FAQItem[]>(() => getItems('faqData', FAQ_DATA));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'faqData') {
                setFaqData(getItems('faqData', FAQ_DATA));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div className="bg-brand-beige">
            <div className="bg-brand-red text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">Find answers to common questions about our courses, admissions, and more.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                <AnimatedSection className="max-w-4xl mx-auto">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                        <Accordion items={faqData} />
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
};

export default FAQPage;
