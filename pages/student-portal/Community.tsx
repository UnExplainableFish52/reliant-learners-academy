import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStudent } from '../StudentPortalPage.tsx';
import { getItems, saveItems } from '../../services/dataService.ts';
import { CHAT_MESSAGES, STUDENTS, TEACHER_QUESTIONS, SHARED_RESOURCES, COURSES, ADMIN_CONVERSATIONS } from '../../constants.ts';
import type { Student, ChatMessage, TeacherQuestion, ChatAttachment, SharedResource, AdminConversation, ConversationMessage } from '../../types.ts';

// ==================================
// SHARED COMPONENTS
// ==================================
const RenderAttachment = ({ attachment }: { attachment: ChatAttachment }) => {
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
                    <img src={attachment.url} alt={attachment.name || 'attachment'} className="rounded-lg max-w-xs max-h-64 object-cover" />
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
            return (
                <a href={attachment.url} download={attachment.name} className="mt-2 flex items-center p-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-fit">
                    <svg className="w-6 h-6 mr-2 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span className="text-sm font-medium text-brand-dark truncate">{attachment.name}</span>
                </a>
            );
        case 'link':
            return (
                 <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="mt-2 block p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    <p className="text-sm font-semibold text-blue-600">Link</p>
                    <p className="text-xs text-gray-700 truncate">{attachment.url}</p>
                </a>
            );
        default:
            return null;
    }
};

const ChatAttachmentPreview = ({ attachment, onRemove }: { attachment: ChatAttachment; onRemove: () => void; }) => (
    <div className="p-2 border-t relative bg-gray-50">
        <div className="flex items-center text-sm">
            {attachment.type === 'image' && <img src={attachment.url} alt="preview" className="w-12 h-12 object-cover rounded-md mr-2"/>}
            <div className="truncate">
                <p className="font-semibold truncate">{attachment.name}</p>
                <p className="text-gray-500 capitalize">{attachment.type}</p>
            </div>
        </div>
        <button onClick={onRemove} className="absolute top-1 right-1 bg-gray-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-brand-red">&times;</button>
    </div>
);


// ==================================
// STUDENT CHAT COMPONENT
// ==================================
const StudentChat = ({ studentMap }: { studentMap: Map<number, Student> }) => {
    const { student: currentUser } = useStudent();

    const allPapersMap = useMemo(() => {
        const map = new Map<string, string>();
        COURSES.forEach(course => {
            [...course.papers, ...(course.options || [])].forEach(paperName => {
                const paperCode = paperName.split(':')[0].trim();
                map.set(paperCode, paperName);
            });
        });
        return map;
    }, []);

    const enrolledPaperCodes = currentUser.enrolledPapers;
    const [activePaperCode, setActivePaperCode] = useState(enrolledPaperCodes[0] || '');
    
    const [messages, setMessages] = useState<{ [paperCode: string]: ChatMessage[] }>(() => getItems('communityChatMessages', CHAT_MESSAGES));
    const [newMessage, setNewMessage] = useState('');
    const [attachmentPreview, setAttachmentPreview] = useState<ChatAttachment | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        saveItems('communityChatMessages', messages);
    }, [messages]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activePaperCode]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachmentPreview) || !activePaperCode) return;
        
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let finalAttachment = attachmentPreview;
        
        if (!finalAttachment && newMessage.match(urlRegex)) {
            const url = newMessage.match(urlRegex)![0];
             finalAttachment = { type: 'link', url };
        }

        const newMsg: ChatMessage = {
            id: Date.now(),
            studentId: currentUser.id,
            text: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: finalAttachment || undefined,
        };

        setMessages(prev => {
            const updatedMessages = { ...prev };
            const channelMessages = updatedMessages[activePaperCode] || [];
            updatedMessages[activePaperCode] = [...channelMessages, newMsg];
            return updatedMessages;
        });

        setNewMessage('');
        setAttachmentPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let type: ChatAttachment['type'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        if (file.type.startsWith('video/')) type = 'video';

        const fileUrl = URL.createObjectURL(file);
        setAttachmentPreview({ type, url: fileUrl, name: file.name });
    };

    const activeChannelMessages = messages[activePaperCode] || [];
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
            {/* Channels Sidebar */}
            <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-1 h-full flex flex-col">
                <h3 className="font-bold text-lg text-brand-dark mb-4 border-b pb-2">Study Groups</h3>
                <nav className="space-y-2 overflow-y-auto">
                    {enrolledPaperCodes.map(code => (
                        <button key={code} onClick={() => setActivePaperCode(code)} className={`w-full text-left p-3 rounded-md font-semibold text-sm transition-colors ${activePaperCode === code ? 'bg-brand-red text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                            # {allPapersMap.get(code) || code}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Chat Window */}
            <div className="bg-white rounded-lg shadow-md lg:col-span-3 h-full flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-dark">#{allPapersMap.get(activePaperCode) || activePaperCode}</h2>
                    <p className="text-sm text-gray-500">Discuss topics and ask questions with your classmates.</p>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {activeChannelMessages.map(msg => {
                        const student = studentMap.get(msg.studentId);
                        if (!student) return null;
                        const isCurrentUserMsg = student.id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUserMsg ? 'justify-end' : ''}`}>
                                {!isCurrentUserMsg && <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full" />}
                                <div>
                                    <div className={`text-sm p-3 rounded-lg max-w-sm ${isCurrentUserMsg ? 'bg-brand-red text-white' : 'bg-gray-100'}`}>
                                        <p className={`font-bold mb-1 ${isCurrentUserMsg ? 'hidden' : 'block'}`}>{student.name}</p>
                                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                        {msg.attachment && <RenderAttachment attachment={msg.attachment} />}
                                    </div>
                                    <p className={`text-xs text-gray-400 mt-1 ${isCurrentUserMsg ? 'text-right' : ''}`}>{msg.timestamp}</p>
                                </div>
                                {isCurrentUserMsg && <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full" />}
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>
                 <div className="mt-auto border-t">
                    {attachmentPreview && <ChatAttachmentPreview attachment={attachmentPreview} onRemove={() => setAttachmentPreview(null)} />}
                    <form onSubmit={handleSendMessage} className="flex items-center p-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-brand-red">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </button>
                        <input 
                            type="text" 
                            placeholder={`Message #${allPapersMap.get(activePaperCode) || activePaperCode}...`} 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 border-none p-2 focus:outline-none focus:ring-0 bg-white" 
                        />
                        <button type="submit" className="bg-brand-red text-white px-4 py-2 rounded-md hover:bg-red-700">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ==================================
// ASK A TEACHER COMPONENT
// ==================================
const AskATeacher = ({ studentMap }: { studentMap: Map<number, Student> }) => {
    const { student: currentUser } = useStudent();
    const [questions, setQuestions] = useState<TeacherQuestion[]>(() => getItems('teacherQuestions', TEACHER_QUESTIONS));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<ChatAttachment | null>(null);
    
    useEffect(() => {
        saveItems('teacherQuestions', questions);
    }, [questions]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setAttachment(null);
            setAttachmentPreview(null);
            return;
        }

        setAttachment(file);

        let type: ChatAttachment['type'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        if (file.type.startsWith('video/')) type = 'video';
        
        const fileUrl = URL.createObjectURL(file);
        setAttachmentPreview({ type, url: fileUrl, name: file.name });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        
        const fileToBase64 = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
        };
        
        let questionAttachment: ChatAttachment | undefined = undefined;
        if (attachment && attachmentPreview) {
            const dataUrl = await fileToBase64(attachment);
            questionAttachment = {
                ...attachmentPreview,
                url: dataUrl
            };
        }

        const newQuestion: TeacherQuestion = {
            id: Date.now(),
            studentId: currentUser.id,
            studentName: currentUser.name,
            paper: formData.get('paper') as string,
            question: formData.get('question') as string,
            status: 'Pending',
            askedDate: new Date().toISOString().split('T')[0],
            questionAttachment,
        };
        
        setQuestions(prev => [newQuestion, ...prev]);

        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
        form.reset();
        setAttachment(null);
        setAttachmentPreview(null);
    };

    const myQuestions = questions.filter(q => q.studentId === currentUser.id);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Ask a Teacher</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Select Paper</label>
                        <select id="paper" name="paper" className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red">
                            {COURSES.flatMap(c => c.papers).map(paper => <option key={paper}>{paper}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-700">Your Question</label>
                        <textarea id="question" name="question" rows={5} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" placeholder="Type your academic question here..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">Attach File (Optional)</label>
                        <input type="file" id="attachment" name="attachment" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                    </div>
                    {attachmentPreview && (
                        <ChatAttachmentPreview 
                            attachment={attachmentPreview} 
                            onRemove={() => {
                                setAttachment(null);
                                setAttachmentPreview(null);
                                const fileInput = document.getElementById('attachment') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                            }} 
                        />
                    )}
                     <button type="submit" className="w-full bg-brand-red text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 transition-colors">Submit Question</button>
                     {isSubmitted && <p className="text-sm text-green-600 text-center">Your question has been submitted successfully!</p>}
                </form>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-brand-dark mb-4">Your Question History</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {myQuestions.map(q => (
                        <div key={q.id} className="border rounded-lg overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                     <div>
                                        <p className="font-semibold">{q.question}</p>
                                        {q.questionAttachment && (
                                            <div className="mt-2">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Your Attachment:</p>
                                                <RenderAttachment attachment={q.questionAttachment} />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${q.status === 'Answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{q.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{q.paper} - Asked on {q.askedDate}</p>
                            </div>
                            {q.status === 'Answered' && (
                                <div className="bg-green-50 p-4 border-t">
                                    <p className="font-semibold text-sm text-green-800">Answer from {q.answeredBy}:</p>
                                    {q.answer && <p className="text-gray-700 mt-1 text-sm">{q.answer}</p>}
                                    {q.answerAttachment && <div className="mt-2"><RenderAttachment attachment={q.answerAttachment} /></div>}
                                </div>
                            )}
                        </div>
                    ))}
                    {myQuestions.length === 0 && <p className="text-center text-gray-500 py-8">You haven't asked any questions yet.</p>}
                </div>
            </div>
        </div>
    );
}

// ==================================
// SHARED RESOURCES COMPONENT
// ==================================
const SharedResources = ({ studentMap }: { studentMap: Map<number, Student> }) => {
    const { student: currentUser } = useStudent();
    const [resources, setResources] = useState<SharedResource[]>(() => getItems('sharedResources', SHARED_RESOURCES));
    const [filter, setFilter] = useState('All');
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    useEffect(() => {
        saveItems('sharedResources', resources);
    }, [resources]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newResource: SharedResource = {
            id: Date.now(),
            studentId: currentUser.id,
            studentName: currentUser.name,
            studentAvatarUrl: currentUser.avatarUrl,
            paper: formData.get('paper') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            url: formData.get('url') as string,
            timestamp: new Date().toISOString()
        };
        setResources(prev => [newResource, ...prev]);
        e.currentTarget.reset();
        setIsFormVisible(false);
    };

    const filteredResources = useMemo(() => {
        if (filter === 'All') return resources;
        return resources.filter(r => r.paper === filter);
    }, [resources, filter]);

    const allPapers = useMemo(() => ['All', ...new Set(resources.map(r => r.paper))], [resources]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-brand-dark">Student Shared Resources</h2>
                 <button onClick={() => setIsFormVisible(prev => !prev)} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">
                    {isFormVisible ? 'Cancel' : '+ Share a Resource'}
                 </button>
            </div>
            
            {isFormVisible && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">Title</label><input name="title" required className="mt-1 w-full p-2 border rounded bg-white"/></div>
                            <div><label className="block text-sm font-medium">Paper</label><select name="paper" required className="mt-1 w-full p-2 border rounded bg-white"><option value="">Select Paper</option>{COURSES.flatMap(c=>c.papers).map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                        </div>
                        <div><label className="block text-sm font-medium">URL</label><input name="url" type="url" required placeholder="https://..." className="mt-1 w-full p-2 border rounded bg-white"/></div>
                        <div><label className="block text-sm font-medium">Description</label><textarea name="description" rows={3} required className="mt-1 w-full p-2 border rounded bg-white"/></div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Submit Resource</button>
                    </form>
                </div>
            )}
            
             <div className="flex justify-end">
                <select value={filter} onChange={e => setFilter(e.target.value)} className="p-2 border rounded-md bg-white">
                    {allPapers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map(res => (
                    <div key={res.id} className="bg-white p-4 rounded-lg shadow-md border flex flex-col">
                        <div className="flex items-center mb-3">
                            <img src={res.studentAvatarUrl} alt={res.studentName} className="w-10 h-10 rounded-full mr-3" />
                            <div><p className="font-semibold text-sm">{res.studentName}</p><p className="text-xs text-gray-500">{new Date(res.timestamp).toLocaleDateString()}</p></div>
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-brand-dark">{res.title}</h4>
                            <p className="text-sm text-gray-500 font-semibold">{res.paper}</p>
                            <p className="text-sm text-gray-700 my-2">{res.description}</p>
                        </div>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="mt-auto text-sm font-semibold text-blue-600 hover:underline self-start">
                            View Resource &rarr;
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==================================
// CONTACT ADMIN COMPONENT
// ==================================
const ContactAdmin = () => {
    const { student: currentUser } = useStudent();
    const [conversations, setConversations] = useState<AdminConversation[]>(() => getItems('adminConversations', ADMIN_CONVERSATIONS));
    const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [notification, setNotification] = useState('');

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
            .filter(m => m.participantId === currentUser.id && m.participantRole === 'student')
            .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
    }, [conversations, currentUser.id]);
    
    const handleSelectConversation = (conv: AdminConversation) => {
        setSelectedConversation(conv);
        setIsCreatingNew(false);
    };

    const handleSendMessage = () => {
        const text = message.trim();
        if (!text) return;

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
                participantId: currentUser.id,
                participantName: currentUser.name,
                participantRole: 'student',
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
    );
};


// ==================================
// MAIN HUB COMPONENT
// ==================================
const Community: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'chat' | 'ask' | 'resources' | 'contact'>('chat');
    const [allStudents] = useState<Student[]>(() => getItems('students', STUDENTS));
    const studentMap = useMemo(() => new Map(allStudents.map(s => [s.id, s])), [allStudents]);
    
    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">Community Hub</h1>
            <div className="mb-6 flex border-b overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('chat')} 
                    className={`py-2 px-6 font-semibold whitespace-nowrap ${activeTab === 'chat' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}
                >
                    Study Groups
                </button>
                <button 
                    onClick={() => setActiveTab('ask')} 
                    className={`py-2 px-6 font-semibold whitespace-nowrap ${activeTab === 'ask' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}
                >
                    Ask a Teacher
                </button>
                 <button 
                    onClick={() => setActiveTab('resources')} 
                    className={`py-2 px-6 font-semibold whitespace-nowrap ${activeTab === 'resources' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}
                >
                    Shared Resources
                </button>
                 <button 
                    onClick={() => setActiveTab('contact')} 
                    className={`py-2 px-6 font-semibold whitespace-nowrap ${activeTab === 'contact' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}
                >
                    Contact Admin
                </button>
            </div>

            <div>
                {activeTab === 'chat' && <StudentChat studentMap={studentMap} />}
                {activeTab === 'ask' && <AskATeacher studentMap={studentMap} />}
                {activeTab === 'resources' && <SharedResources studentMap={studentMap} />}
                {activeTab === 'contact' && <ContactAdmin />}
            </div>
        </div>
    );
};

export default Community;