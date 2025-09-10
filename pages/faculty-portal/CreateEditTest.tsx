import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFaculty } from './hooks.ts';
import { getItems, saveItems } from '../../services/dataService.ts';
import type { MockTest, Question, MCQOption } from '../../types';
import ScheduleTestModal from '../../components/faculty-portal/ScheduleTestModal.tsx';

const CreateEditTest: React.FC = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { facultyMember } = useFaculty();
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const [test, setTest] = useState<Omit<MockTest, 'id' | 'createdByFacultyId'>>({
        title: '',
        paper: facultyMember.assignedPapers[0] || '',
        status: 'Draft',
        durationMinutes: 180,
        questions: [],
        isLocked: false,
    });
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
        if (testId) {
            const allTests = getItems<MockTest[]>('mockTests', []);
            const existingTest = allTests.find(t => t.id === Number(testId));
            if (existingTest) {
                setTest(existingTest);
            }
        }
        setIsLoaded(true);
    }, [testId]);

    const handleTestDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTest(prev => ({ ...prev, [name]: name === 'durationMinutes' ? Number(value) : value }));
    };

    const addQuestion = (type: 'MCQ' | 'Theoretical') => {
        const newQuestion: Question = {
            id: Date.now(),
            type,
            questionText: '',
            points: 10,
            mcqOptions: type === 'MCQ' ? [{ id: Date.now(), text: '', isCorrect: true }] : [],
        };
        setTest(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    };

    const updateQuestion = (qId: number, field: keyof Question, value: any) => {
        setTest(prev => ({
            ...prev,
            questions: prev.questions.map(q => q.id === qId ? { ...q, [field]: value } : q),
        }));
    };
    
    const removeQuestion = (qId: number) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            setTest(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== qId) }));
        }
    };

    const addOption = (qId: number) => {
        setTest(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId && q.type === 'MCQ') {
                    // When adding a new option, if no option is correct yet, make the new one correct by default.
                    const hasCorrectOption = q.mcqOptions?.some(opt => opt.isCorrect);
                    return { ...q, mcqOptions: [...(q.mcqOptions || []), { id: Date.now(), text: '', isCorrect: !hasCorrectOption }] };
                }
                return q;
            }),
        }));
    };

    const updateOption = (qId: number, oId: number, text: string) => {
        setTest(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId && q.type === 'MCQ') {
                    return { ...q, mcqOptions: q.mcqOptions?.map(o => o.id === oId ? { ...o, text } : o) };
                }
                return q;
            }),
        }));
    };

    const setCorrectOption = (qId: number, oId: number) => {
        setTest(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId && q.type === 'MCQ') {
                    return { ...q, mcqOptions: q.mcqOptions?.map(o => ({ ...o, isCorrect: o.id === oId })) };
                }
                return q;
            }),
        }));
    };
    
    const removeOption = (qId: number, oId: number) => {
        setTest(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId && q.type === 'MCQ') {
                    const newOptions = q.mcqOptions?.filter(o => o.id !== oId);
                    // If the deleted option was the correct one, make the first remaining option correct.
                    if (q.mcqOptions?.find(o => o.id === oId)?.isCorrect && newOptions && newOptions.length > 0) {
                        newOptions[0].isCorrect = true;
                    }
                    return { ...q, mcqOptions: newOptions };
                }
                return q;
            }),
        }));
    };

    const handleSave = (status: 'Draft' | 'Published', scheduledTime?: string) => {
        if (status === 'Published' && test.questions.length === 0) {
            alert('A test cannot be published with zero questions. Please add questions or save as a draft.');
            return;
        }

        const allTests = getItems<MockTest[]>('mockTests', []);
        const finalTest: MockTest = {
            ...test,
            status,
            id: testId ? Number(testId) : Date.now(),
            createdByFacultyId: facultyMember.id,
            publishDate: status === 'Published' && !test.publishDate ? new Date().toISOString() : test.publishDate,
            scheduledStartTime: scheduledTime
        };

        let updatedTests;
        if (testId) {
            updatedTests = allTests.map(t => t.id === Number(testId) ? finalTest : t);
        } else {
            updatedTests = [...allTests, finalTest];
        }

        saveItems('mockTests', updatedTests);
        navigate('/faculty-portal/mock-tests');
    };
    
    const handleScheduleSave = (scheduledTime: string) => {
        handleSave('Published', scheduledTime);
        setIsScheduleModalOpen(false);
    };


    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-brand-dark">{testId ? 'Edit Mock Test' : 'Create New Mock Test'}</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Test Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="title" value={test.title} onChange={handleTestDetailChange} placeholder="Test Title" className="md:col-span-2 p-2 border rounded-md bg-white" required/>
                    <select name="paper" value={test.paper} onChange={handleTestDetailChange} className="p-2 border rounded-md bg-white">
                        {facultyMember.assignedPapers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div>
                         <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                         <input name="durationMinutes" type="number" value={test.durationMinutes} onChange={handleTestDetailChange} className="w-full p-2 border rounded-md bg-white"/>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Questions</h2>
                <div className="space-y-4">
                    {test.questions.map((q, qIndex) => (
                        <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg text-gray-800">Question {qIndex + 1} ({q.type})</h3>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(q.id)}
                                    className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                    aria-label={`Delete question ${qIndex + 1}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Delete
                                </button>
                            </div>
                            <textarea
                                value={q.questionText}
                                onChange={e => updateQuestion(q.id, 'questionText', e.target.value)}
                                rows={3}
                                className="w-full p-2 border rounded-md mt-2 bg-white"
                                placeholder="Enter question text..."
                            />
                            {q.type === 'MCQ' && (
                                <div className="mt-2 space-y-2">
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Select the correct answer by clicking the radio button:</label>
                                    {q.mcqOptions?.map(opt => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <input type="radio" name={`correct-opt-${q.id}`} checked={opt.isCorrect} onChange={() => setCorrectOption(q.id, opt.id)} className="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300"/>
                                            <input type="text" value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)} placeholder="Option text" className="flex-grow p-1 border rounded bg-white"/>
                                            <button type="button" onClick={() => removeOption(q.id, opt.id)} className="text-red-500 text-xs">Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOption(q.id)} className="text-xs font-semibold text-blue-600">+ Add Option</button>
                                </div>
                            )}
                             <div className="mt-2 text-right">
                                <label className="text-sm">Points: </label>
                                <input type="number" value={q.points} onChange={e => updateQuestion(q.id, 'points', Number(e.target.value))} className="w-20 p-1 border rounded text-center bg-white" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex gap-4">
                    <button type="button" onClick={() => addQuestion('MCQ')} className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-md text-sm">+ Add Multiple Choice</button>
                    <button type="button" onClick={() => addQuestion('Theoretical')} className="bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-md text-sm">+ Add Theoretical</button>
                </div>
            </div>
            
            <div className="flex justify-end gap-4">
                <button type="button" onClick={() => handleSave('Draft')} className="bg-yellow-500 text-white px-6 py-2 rounded-md font-semibold">Save as Draft</button>
                <button type="button" onClick={() => navigate('/faculty-portal/mock-tests')} className="bg-gray-200 px-6 py-2 rounded-md font-semibold">Cancel</button>
                <button type="button" onClick={() => setIsScheduleModalOpen(true)} className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold">Schedule Test...</button>
            </div>
            <ScheduleTestModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSchedule={handleScheduleSave}
                testTitle={test.title}
            />
        </div>
    );
};

export default CreateEditTest;
