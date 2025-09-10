import React from 'react';
// FIX: Add '.ts' to constants import to resolve module not found error.
import { ACCA_FEE_STRUCTURE } from '../constants.ts';
import type { AccaFeeCategory } from '../types';

const FeeTable: React.FC<{ feeCategories: AccaFeeCategory[] }> = ({ feeCategories }) => {
    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '-';
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="overflow-x-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg">
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
                            <tr className="bg-brand-dark text-white">
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
                            {category.notes && (
                                <tr>
                                    <td colSpan={4} className="p-3 text-xs text-gray-600 bg-gray-50 italic">
                                        Note: {category.notes}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
             <div className="mt-6 text-center text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg">
                <p><strong>Disclaimer:</strong> All fees are subject to change without prior notice. The external fees payable to ACCA are based on current exchange rates and may vary. Please confirm the latest fees with our admissions office.</p>
                <p className="mt-1">The UK fees are indicative and calculated based on an assumed exchange rate. Please verify the current rate at the time of payment.</p>
            </div>
        </div>
    );
};

const FeeStructurePage: React.FC = () => {
    return (
        <div className="bg-brand-beige">
            <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">ACCA Fee Structure</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">A comprehensive breakdown of college tuition fees and external fees payable to ACCA UK.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                <FeeTable feeCategories={ACCA_FEE_STRUCTURE} />
            </div>
        </div>
    );
};

export default FeeStructurePage;
