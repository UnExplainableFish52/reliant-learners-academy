import React, { useState, useMemo } from 'react';
// FIX: Add '.ts' to constants import to resolve module not found error.
import { STUDENTS, COURSES } from '../../constants.ts';
import type { Student, GradeEntry } from '../../types';

interface FlatResult {
    studentId: number;
    studentName: string;
    studentAvatarUrl: string;
    studentCurrentLevel: string;
    paperCode: string;
    paperFullName: string;
    score: number;
    date: string;
    examType: 'Mock' | 'Internal' | 'Final';
}

const MockResults: React.FC = () => {
    const [students] = useState<Student[]>(() => {
        try {
            const saved = localStorage.getItem('students');
            return saved ? JSON.parse(saved) : STUDENTS;
        } catch {
            return STUDENTS;
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('All');
    const [paperFilter, setPaperFilter] = useState('All');

    const allPapersMap = useMemo(() => {
        const map = new Map<string, string>();
        COURSES.forEach(course => {
            course.papers.forEach(paper => {
                const code = paper.split(':')[0].trim();
                map.set(code, paper);
            });
        });
        return map;
    }, []);

    const allPapers = useMemo(() => Array.from(allPapersMap.values()), [allPapersMap]);

    const flattenedResults = useMemo<FlatResult[]>(() => {
        const results: FlatResult[] = [];
        students.forEach(student => {
            if (student.grades) {
                Object.entries(student.grades).forEach(([paperCode, grades]) => {
                    grades.forEach(grade => {
                        results.push({
                            studentId: student.id,
                            studentName: student.name,
                            studentAvatarUrl: student.avatarUrl,
                            studentCurrentLevel: student.currentLevel,
                            paperCode,
                            paperFullName: allPapersMap.get(paperCode) || paperCode,
                            ...grade,
                        });
                    });
                });
            }
        });
        return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [students, allPapersMap]);

    const filteredResults = useMemo(() => {
        return flattenedResults.filter(result => {
            const searchMatch = searchTerm === '' || 
                result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                result.paperFullName.toLowerCase().includes(searchTerm.toLowerCase());
            
            const levelMatch = levelFilter === 'All' || result.studentCurrentLevel === levelFilter;
            
            const paperMatch = paperFilter === 'All' || result.paperFullName === paperFilter;

            return searchMatch && levelMatch && paperMatch;
        });
    }, [flattenedResults, searchTerm, levelFilter, paperFilter]);

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">All Mock Exam Results</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Student/Paper</label>
                        <input
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="levelFilter" className="block text-sm font-medium text-gray-700">Filter by Level</label>
                        <select
                            id="levelFilter"
                            value={levelFilter}
                            onChange={e => setLevelFilter(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"
                        >
                            <option value="All">All Levels</option>
                            <option value="Applied Knowledge">Applied Knowledge</option>
                            <option value="Applied Skills">Applied Skills</option>
                            <option value="Strategic Professional">Strategic Professional</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="paperFilter" className="block text-sm font-medium text-gray-700">Filter by Paper</label>
                        <select
                            id="paperFilter"
                            value={paperFilter}
                            onChange={e => setPaperFilter(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"
                        >
                            <option value="All">All Papers</option>
                            {allPapers.map(paper => <option key={paper} value={paper}>{paper}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Student</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Paper</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Score</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredResults.map((result, index) => (
                                <tr key={`${result.studentId}-${result.paperCode}-${result.date}-${index}`} className="hover:bg-gray-50">
                                    <td className="p-4 flex items-center">
                                        <img src={result.studentAvatarUrl} alt={result.studentName} className="w-10 h-10 rounded-full mr-3" />
                                        <div>
                                            <p className="font-medium">{result.studentName}</p>
                                            <p className="text-xs text-gray-500">{result.studentCurrentLevel}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{result.paperFullName}</td>
                                    <td className="p-4 text-center font-mono">
                                        <span className={`font-bold ${result.score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.score}
                                        </span> / 100
                                    </td>
                                    <td className="p-4 text-right text-sm font-mono">{result.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredResults.length === 0 && (
                        <p className="text-center py-8 text-gray-500">No results match the current filters.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockResults;
