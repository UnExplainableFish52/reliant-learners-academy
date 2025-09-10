import React, { useState, useEffect, useMemo } from 'react';
import { TEACHER_QUESTIONS, STUDENTS } from '../../constants';
import type { TeacherQuestion, ChatAttachment, Student } from '../../types';
import { useFaculty } from './hooks.ts';

type Tab = 'Pending' | 'Answered';

const RenderFacultyAttachment = ({ attachment }: { attachment: ChatAttachment }) => {
    const downloadLink = (
        <a href={attachment.url} download={attachment.name || 'download'} className="mt-1 flex items-center text-xs font-semibold text-blue-600 hover:underline">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download
        </a>
    );

    switch (attachment.type) {
        case 'image':
            return (
                <div className="mt-2">
                    <img src={attachment.url} alt={attachment.name || 'attachment'} className="rounded-lg max-w-xs max-h-48 object-cover" />
                    {downloadLink}
                </div>
            );
        case 'video':
            return (
                <div className="mt-2">
                    <video src={attachment.url} controls className="rounded-lg max-w-xs" />
                    {downloadLink}
                </div>
            );
        case 'document':
        default:
            return (
                <a href={attachment.url} download={attachment.name} className="mt-2 flex items-center p-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-fit">
                    <svg className="w-5 h-5 mr-2 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span className="text-sm font-medium text-brand-dark truncate">{attachment.name}</span>
                </a>
            );
    }
};


const QuestionCard = ({ question, onAnswer, studentAvatarUrl }: { question: TeacherQuestion; onAnswer: (id: number, answer: string, attachment?: ChatAttachment) => void; studentAvatarUrl?: string; }) => {
    const [isAnswering, setIsAnswering] = useState(false);
    const [answerText, setAnswerText] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    const handleSubmit = () => {
        if (answerText.trim() || attachment) {
             let attachmentPayload: ChatAttachment | undefined = undefined;
            if (attachment) {
                let type: ChatAttachment['type'] = 'document';
                if (attachment.type.startsWith('image/')) type = 'image';
                if (attachment.type.startsWith('video/')) type = 'video';
                attachmentPayload = {
                    name: attachment.name,
                    url: URL.createObjectURL(attachment),
                    type,
                };
            }
            onAnswer(question.id, answerText.trim(), attachmentPayload);
            setIsAnswering(false);
            setAnswerText('');
            setAttachment(null);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-start gap-4">
            <img src={studentAvatarUrl || `https://ui-avatars.com/api/?name=${question.studentName || 'S'}&background=random`} alt={question.studentName || 'Student'} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-gray-800">{question.question}</p>
                        {question.questionAttachment && (
                            <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Student's Attachment:</p>
                                <RenderFacultyAttachment attachment={question.questionAttachment} />
                            </div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            From: <span className="font-semibold">{question.studentName || 'A Student'}</span> | 
                            Paper: <span className="font-semibold">{question.paper}</span> | 
                            Asked: <span className="font-mono">{question.askedDate}</span>
                        </p>
                    </div>
                    {question.status === 'Pending' && !isAnswering && (
                        <button onClick={() => setIsAnswering(true)} className="bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-red-700 flex-shrink-0">
                            Answer
                        </button>
                    )}
                </div>

                {isAnswering && (
                    <div className="mt-4 border-t pt-4 p-4 rounded-b-lg">
                        <textarea 
                            value={answerText}
                            onChange={e => setAnswerText(e.target.value)}
                            rows={4} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red bg-gray-50" 
                            placeholder="Type your answer here..."
                        />
                        <div className="mt-2">
                            <label htmlFor={`attachment-${question.id}`} className="block text-sm font-medium text-gray-700">Attach File (Optional)</label>
                             <input 
                                type="file" 
                                id={`attachment-${question.id}`}
                                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100"
                            />
                        </div>
                         {attachment && (
                            <div className="mt-2 flex items-center text-sm bg-gray-200 p-2 rounded-md">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                <span className="truncate font-medium text-gray-700">{attachment.name}</span>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => { setIsAnswering(false); setAttachment(null); }} className="bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md">Cancel</button>
                            <button onClick={handleSubmit} className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-md">Submit Answer</button>
                        </div>
                    </div>
                )}
                
                {question.status === 'Answered' && (
                     <div className="mt-4 border-t pt-4 bg-green-50 p-3 rounded-md">
                        <p className="font-semibold text-sm text-green-800">Your Answer:</p>
                        {question.answer && <p className="text-gray-700 mt-1 text-sm">{question.answer}</p>}
                        {question.answerAttachment && (
                             <div className="mt-2">
                                <RenderFacultyAttachment attachment={question.answerAttachment} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


const StudentQuestions: React.FC = () => {
    const { facultyMember } = useFaculty();
    const [activeTab, setActiveTab] = useState<Tab>('Pending');
    const [levelFilter, setLevelFilter] = useState('All');
    const [allStudents, setAllStudents] = useState<Student[]>([]);

    useEffect(() => {
        const storedStudents = localStorage.getItem('students');
        setAllStudents(storedStudents ? JSON.parse(storedStudents) : STUDENTS);
    }, []);

    const [questions, setQuestions] = useState<TeacherQuestion[]>(() => {
        const savedQuestions = localStorage.getItem('teacherQuestions');
        return savedQuestions ? JSON.parse(savedQuestions) : TEACHER_QUESTIONS;
    });

    useEffect(() => {
        localStorage.setItem('teacherQuestions', JSON.stringify(questions));
    }, [questions]);
    
    const studentMap = useMemo(() => {
        const map = new Map<number, Student>();
        allStudents.forEach(student => map.set(student.id, student));
        return map;
    }, [allStudents]);

    const handleAnswerQuestion = (id: number, answer: string, attachment?: ChatAttachment) => {
        setQuestions(prev => prev.map(q => 
            q.id === id ? { ...q, status: 'Answered', answer: answer, answerAttachment: attachment, answeredBy: facultyMember.name } : q
        ));
    };

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            if (levelFilter === 'All') return true;
            const student = q.studentId ? studentMap.get(q.studentId) : null;
            return student ? student.currentLevel === levelFilter : false;
        });
    }, [questions, levelFilter, studentMap]);

    const { pending, answered } = useMemo(() => {
        const pending: TeacherQuestion[] = [];
        const answered: TeacherQuestion[] = [];
        filteredQuestions.forEach(q => {
            if (q.status === 'Pending') {
                pending.push(q);
            } else {
                answered.push(q);
            }
        });
        return { pending, answered };
    }, [filteredQuestions]);

    const currentList = activeTab === 'Pending' ? pending : answered;

    if (!facultyMember) return null;

    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">Student Questions</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                         <button
                            onClick={() => setActiveTab('Pending')}
                            className={`${
                                activeTab === 'Pending'
                                    ? 'border-brand-red text-brand-red'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Pending <span className="bg-yellow-200 text-yellow-800 ml-2 py-0.5 px-2 rounded-full text-xs">{pending.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('Answered')}
                            className={`${
                                activeTab === 'Answered'
                                    ? 'border-brand-red text-brand-red'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Answered <span className="bg-gray-200 text-gray-800 ml-2 py-0.5 px-2 rounded-full text-xs">{answered.length}</span>
                        </button>
                    </nav>
                    <div className="mt-4 sm:mt-0">
                        <label htmlFor="levelFilter" className="sr-only">Filter by Level</label>
                        <select
                            id="levelFilter"
                            value={levelFilter}
                            onChange={e => setLevelFilter(e.target.value)}
                            className="block text-sm border-gray-300 focus:outline-none focus:ring-brand-red focus:border-brand-red rounded-md bg-white"
                        >
                            <option value="All">All Levels</option>
                            <option value="Applied Knowledge">Applied Knowledge</option>
                            <option value="Applied Skills">Applied Skills</option>
                            <option value="Strategic Professional">Strategic Professional</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-4">
                    {currentList.length > 0 ? (
                        currentList.map(q => {
                            const student = q.studentId ? studentMap.get(q.studentId) : undefined;
                            return <QuestionCard key={q.id} question={q} onAnswer={handleAnswerQuestion} studentAvatarUrl={student?.avatarUrl} />;
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No {activeTab.toLowerCase()} questions match the current filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentQuestions;
