import React, { useState, useMemo } from 'react';
import type { GradeEntry } from '../../types.ts';
import { useStudent } from '../StudentPortalPage.tsx';


const Results: React.FC = () => {
    const { student } = useStudent();
    
    const flattenedResults = useMemo(() => {
        if (!student?.grades) return [];
        // FIX: Added type assertion to resolve 'map' on 'unknown' error.
        return Object.entries(student.grades).flatMap(([paperCode, grades]: [string, GradeEntry[]]) => 
            grades.map(grade => ({
                id: `${paperCode}-${grade.date}`,
                paper: paperCode,
                score: grade.score,
                date: grade.date,
                examType: grade.examType,
                grade: grade.score >= 50 ? 'Pass' : 'Fail',
            }))
        );
    }, [student]);

    const [isDownloading, setIsDownloading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'score'; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });

    const sortedAndFilteredResults = useMemo(() => {
        return flattenedResults
            .filter(result =>
                result.paper.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                let comparison = 0;
                if (sortConfig.key === 'score') {
                    comparison = a.score - b.score;
                } else { // 'date'
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                }
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
    }, [flattenedResults, searchTerm, sortConfig]);

    const ResultsSummary = () => {
        const papersAttempted = flattenedResults.length;
        const papersPassed = flattenedResults.filter(r => r.grade === 'Pass').length;
        const passRate = papersAttempted > 0 ? ((papersPassed / papersAttempted) * 100).toFixed(1) : 0;
        const averageScore = papersAttempted > 0 ? (flattenedResults.reduce((acc, r) => acc + r.score, 0) / papersAttempted).toFixed(1) : 0;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Exams Taken</h3>
                    <p className="text-3xl font-bold mt-1 text-blue-600">{papersAttempted}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Papers Passed</h3>
                    <p className="text-3xl font-bold mt-1 text-green-600">{papersPassed}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Pass Rate</h3>
                    <p className="text-3xl font-bold mt-1 text-yellow-600">{passRate}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Average Score</h3>
                    <p className="text-3xl font-bold mt-1 text-purple-600">{averageScore}</p>
                </div>
            </div>
        );
    };

    const handleDownload = () => {
        setIsDownloading(true);
        setTimeout(() => {
            alert('Transcript download started!');
            setIsDownloading(false);
        }, 1000);
    };
    
     const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, direction] = e.target.value.split('-') as ['score' | 'date', 'ascending' | 'descending'];
        setSortConfig({ key, direction });
    };

    if (!student) return null;

    return (
         <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">My Results</h1>
                <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center disabled:bg-red-300 w-full sm:w-auto"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    {isDownloading ? 'Preparing...' : 'Download Transcript'}
                </button>
            </div>

            <ResultsSummary />

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search by paper name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 bg-white"
                        />
                         <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={`${sortConfig.key}-${sortConfig.direction}`}
                            onChange={handleSortChange}
                            className="w-full appearance-none border rounded-lg py-2 pl-3 pr-10 bg-white"
                            aria-label="Sort results"
                        >
                            <option value="date-descending">Date: Newest to Oldest</option>
                            <option value="date-ascending">Date: Oldest to Newest</option>
                            <option value="score-descending">Score: High to Low</option>
                            <option value="score-ascending">Score: Low to High</option>
                        </select>
                        <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Paper</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Exam Type</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Date</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Score</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sortedAndFilteredResults.length > 0 ? (
                                sortedAndFilteredResults.map(result => (
                                    <tr key={result.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{result.paper}</td>
                                        <td className="p-4">{result.examType}</td>
                                        <td className="p-4 font-mono text-sm">{result.date}</td>
                                        <td className="p-4 text-center font-mono">{result.score} / 100</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                result.grade === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {result.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-gray-500">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Results;