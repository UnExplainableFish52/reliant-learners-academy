import React, { useState, useMemo, useEffect } from 'react';
import { getItems, saveItems } from '../../services/dataService';
import type { AdminConversation, Student, FacultyMember } from '../../types';
import { STUDENTS, FACULTY_MEMBERS } from '../../constants';

const NewMessageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSend: (recipient: { id: number; role: 'student' | 'faculty' }, subject: string, message: string) => void;
}> = ({ isOpen, onClose, onSend }) => {
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const students = getItems<Student[]>('students', STUDENTS);
    const faculty = getItems<FacultyMember[]>('faculty', FACULTY_MEMBERS);

    const handleSubmit = () => {
        if (!recipient || !subject.trim() || !message.trim()) {
            alert('Please select a recipient and fill out the subject and message.');
            return;
        }
        const [role, id] = recipient.split('-');
        onSend({ id: Number(id), role: role as 'student' | 'faculty' }, subject, message);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-dark">New Message</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recipient</label>
                        <select value={recipient} onChange={e => setRecipient(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white">
                            <option value="">Select a recipient...</option>
                            <optgroup label="Students">
                                {students.map(s => <option key={`student-${s.id}`} value={`student-${s.id}`}>{s.name} ({s.studentId})</option>)}
                            </optgroup>
                             <optgroup label="Faculty">
                                {faculty.map(f => <option key={`faculty-${f.id}`} value={`faculty-${f.id}`}>{f.name}</option>)}
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-1 block w-full p-2 border rounded-md bg-white"/>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="bg-brand-red text-white px-4 py-2 rounded-md">Send Message</button>
                </div>
            </div>
        </div>
    );
};

const Inbox: React.FC = () => {
    const [conversations, setConversations] = useState<AdminConversation[]>(() => getItems('adminConversations', []));
    const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');
    const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        saveItems('adminConversations', conversations);
    }, [conversations]);

    const filteredConversations = useMemo(() => {
        return conversations
            .filter(c => c.participantRole === activeTab)
            .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
    }, [conversations, activeTab]);

    const handleReply = () => {
        if (!selectedConversation || !replyText.trim()) return;

        const updatedConversation: AdminConversation = {
            ...selectedConversation,
            lastUpdate: new Date().toISOString(),
            messages: [
                ...selectedConversation.messages,
                { sender: 'admin', text: replyText.trim(), timestamp: new Date().toISOString() }
            ]
        };

        const updatedList = conversations.map(c => c.id === updatedConversation.id ? updatedConversation : c);
        setConversations(updatedList);
        setSelectedConversation(updatedConversation);
        setReplyText('');
    };
    
    const handleNewMessage = (recipient: { id: number; role: 'student' | 'faculty' }, subject: string, message: string) => {
        const students = getItems<Student[]>('students', STUDENTS);
        const faculty = getItems<FacultyMember[]>('faculty', FACULTY_MEMBERS);

        let participantName = '';
        if (recipient.role === 'student') {
            participantName = students.find(s => s.id === recipient.id)?.name || 'Unknown Student';
        } else {
            participantName = faculty.find(f => f.id === recipient.id)?.name || 'Unknown Faculty';
        }

        const newConversation: AdminConversation = {
            id: Date.now(),
            participantId: recipient.id,
            participantRole: recipient.role,
            participantName,
            subject,
            status: 'Resolved', // Admin-initiated messages are considered resolved
            lastUpdate: new Date().toISOString(),
            messages: [{ sender: 'admin', text: message, timestamp: new Date().toISOString() }]
        };

        const updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        setIsModalOpen(false);
        setActiveTab(recipient.role);
        setSelectedConversation(newConversation);
    };
    
    const handleToggleStatus = (conversationId: number, newStatus: 'Pending' | 'Resolved') => {
        const updatedList = conversations.map(c => 
            c.id === conversationId ? { ...c, status: newStatus, lastUpdate: new Date().toISOString() } : c
        );
        setConversations(updatedList);
        const updatedSelected = updatedList.find(c => c.id === conversationId);
        if (updatedSelected) {
            setSelectedConversation(updatedSelected);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-brand-dark">Inbox</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md">New Message</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">
                <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-1 h-full flex flex-col">
                    <div className="border-b mb-2">
                        <button onClick={() => setActiveTab('student')} className={`py-2 px-4 font-semibold ${activeTab === 'student' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}>Students</button>
                        <button onClick={() => setActiveTab('faculty')} className={`py-2 px-4 font-semibold ${activeTab === 'faculty' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}>Faculty</button>
                    </div>
                    <ul className="space-y-2 overflow-y-auto">
                        {filteredConversations.map(c => (
                            <li key={c.id}>
                                <button onClick={() => setSelectedConversation(c)} className={`w-full text-left p-3 rounded-lg border-l-4 ${selectedConversation?.id === c.id ? 'bg-red-50 border-brand-red' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                                    <div className="flex justify-between text-xs">
                                        <p className="font-bold">{c.participantName}</p>
                                        <span className={`font-bold ${c.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>{c.status}</span>
                                    </div>
                                    <p className="font-semibold text-sm truncate mt-1">{c.subject}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md lg:col-span-2 h-full flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedConversation.subject}</h2>
                                        <p className="text-sm text-gray-500">With: {selectedConversation.participantName}</p>
                                    </div>
                                     {selectedConversation.status === 'Pending' ? (
                                        <button onClick={() => handleToggleStatus(selectedConversation.id, 'Resolved')} className="bg-green-600 text-white font-semibold px-3 py-1 rounded text-sm hover:bg-green-700">Mark as Resolved</button>
                                    ) : (
                                        <button onClick={() => handleToggleStatus(selectedConversation.id, 'Pending')} className="bg-yellow-500 text-white font-semibold px-3 py-1 rounded text-sm hover:bg-yellow-600">Reopen</button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {selectedConversation.messages.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'admin' ? 'justify-end' : ''}`}>
                                        {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>}
                                        <div className={`text-sm p-3 rounded-lg max-w-sm ${msg.sender === 'admin' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t">
                                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your reply..." className="w-full p-2 border rounded-md bg-white"/>
                                <button onClick={handleReply} className="mt-2 w-full bg-brand-dark text-white py-2 rounded-md font-semibold hover:bg-black">Send Reply</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">Select a conversation to view.</div>
                    )}
                </div>
            </div>
             <NewMessageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSend={handleNewMessage} />
        </div>
    );
};

export default Inbox;