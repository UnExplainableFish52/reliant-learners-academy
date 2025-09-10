import React, { useState, useMemo, useEffect } from 'react';
import { useFaculty } from './hooks.ts';
import type { AdminConversation, ConversationMessage } from '../../types';
import { getItems, saveItems } from '../../services/dataService';

const ContactAdminPage: React.FC = () => {
    const { facultyMember } = useFaculty();
    const [conversations, setConversations] = useState<AdminConversation[]>(() => getItems('adminConversations', []));
    const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        saveItems('adminConversations', conversations);
    }, [conversations]);
    
     useEffect(() => {
        if (!selectedConversation && !isCreatingNew && myConversations.length > 0) {
            setIsCreatingNew(true);
        }
    }, [selectedConversation, isCreatingNew]);

    const myConversations = useMemo(() => {
        return conversations
            .filter(m => m.participantId === facultyMember.id && m.participantRole === 'faculty')
            .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
    }, [conversations, facultyMember.id]);

     const handleSelectConversation = (conv: AdminConversation) => {
        setSelectedConversation(conv);
        setIsCreatingNew(false);
    };

    const handleSendMessage = () => {
        const text = message.trim();
        if (!text || (isCreatingNew && !subject.trim())) {
            alert("Subject and message cannot be empty.");
            return;
        }

        const now = new Date().toISOString();
        const newMessage: ConversationMessage = { sender: 'user', text, timestamp: now };
        
        let updatedConversations;
        
        if (selectedConversation) {
            // Replying to existing conversation
            const updatedConv: AdminConversation = { 
                ...selectedConversation, 
                messages: [...selectedConversation.messages, newMessage],
                status: 'Pending', // Reopen if it was resolved
                lastUpdate: now
            };
            updatedConversations = conversations.map(c => c.id === selectedConversation.id ? updatedConv : c);
            setSelectedConversation(updatedConv);

        } else if (isCreatingNew) {
            // Creating new conversation
            const newConversation: AdminConversation = {
                id: Date.now(),
                participantId: facultyMember.id,
                participantName: facultyMember.name,
                participantRole: 'faculty',
                subject: subject.trim(),
                status: 'Pending',
                lastUpdate: now,
                messages: [newMessage],
            };
            updatedConversations = [newConversation, ...conversations];
            setSelectedConversation(newConversation);
            setIsCreatingNew(false);
        }

        setConversations(updatedConversations!);
        saveItems('adminConversations', updatedConversations!);
        setMessage('');
        setSubject('');
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-brand-dark">Contact Administration</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">
                 <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-1 h-full flex flex-col">
                    <button onClick={() => { setIsCreatingNew(true); setSelectedConversation(null); }} className={`w-full p-3 rounded-md font-semibold text-sm text-center mb-4 transition-colors ${isCreatingNew ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                        + New Message
                    </button>
                    <h3 className="font-bold text-lg text-brand-dark mb-2 border-b pb-2">Your Conversations</h3>
                    <ul className="space-y-2 overflow-y-auto">
                        {myConversations.map(c => (
                            <li key={c.id}>
                                <button onClick={() => handleSelectConversation(c)} className={`w-full text-left p-3 rounded-lg border-l-4 ${selectedConversation?.id === c.id ? 'bg-red-50 border-brand-red' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                                    <div className="flex justify-between text-xs">
                                        <p className="font-semibold text-gray-600">Admin</p>
                                        <span className={`font-bold ${c.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>{c.status}</span>
                                    </div>
                                    <p className="font-semibold text-sm truncate mt-1">{c.subject}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                 <div className="bg-white rounded-lg shadow-md lg:col-span-2 h-full flex flex-col">
                    {selectedConversation && (
                        <>
                            <div className="p-4 border-b">
                                <h2 className="text-xl font-bold">{selectedConversation.subject}</h2>
                                <p className="text-sm text-gray-500">Status: {selectedConversation.status}</p>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {selectedConversation.messages.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                        {msg.sender === 'admin' && <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0"></div>}
                                        <div className={`text-sm p-3 rounded-lg max-w-sm ${msg.sender === 'user' ? 'bg-brand-red text-white' : 'bg-gray-100'}`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {isCreatingNew && (
                         <div className="p-4 border-b">
                            <h2 className="text-xl font-bold">New Message to Admin</h2>
                        </div>
                    )}
                    {(selectedConversation || isCreatingNew) ? (
                        <div className="p-4 border-t mt-auto">
                            {isCreatingNew && (
                                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full p-2 border rounded-md mb-2 bg-white"/>
                            )}
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Type your message..." className="w-full p-2 border rounded-md bg-white"/>
                            <button onClick={handleSendMessage} className="mt-2 w-full bg-brand-red text-white py-2 rounded-md font-semibold">Send</button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">Select or start a conversation.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactAdminPage;