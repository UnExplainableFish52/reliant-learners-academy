import React, { useState } from 'react';
import type { FAQItem } from '../types.ts';

interface AccordionProps {
    items: FAQItem[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="border-b border-gray-200">
                    <button
                        onClick={() => toggleAccordion(index)}
                        className="w-full flex justify-between items-center text-left py-4 px-2 focus:outline-none"
                    >
                        <span className="text-lg font-medium text-brand-dark">{item.question}</span>
                        <span className="transform transition-transform duration-300">
                           <svg
                                className={`w-6 h-6 text-brand-red transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : 'rotate-0'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </span>
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            activeIndex === index ? 'max-h-96' : 'max-h-0'
                        }`}
                    >
                        <p className="py-4 px-2 text-gray-600">{item.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Accordion;