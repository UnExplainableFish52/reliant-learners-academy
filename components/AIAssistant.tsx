import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types.ts';
import { getAIResponse } from '../services/geminiService.ts';

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Hello! I'm the Learners Academy AI Assistant. How can I help you with your questions about ACCA and accounting careers today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: userInput.trim() }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getAIResponse(newMessages.slice(1)); // Exclude initial greeting from history
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'ai', text: 'An error occurred. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {isOpen ? (
                <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col">
                    <div className="bg-brand-dark text-white p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold">ACCA Career Advisor</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">&times;</button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.sender === 'user' ? 'bg-brand-red text-white' : 'bg-gray-200 text-brand-dark'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start mb-3">
                                <div className="rounded-lg px-3 py-2 max-w-xs bg-gray-200 text-brand-dark">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t">
                        <div className="flex">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask about ACCA..."
                                className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
                                disabled={isLoading}
                            />
                            <button type="submit" className="bg-brand-red text-white px-4 rounded-r-md hover:bg-red-700 disabled:bg-red-300" disabled={isLoading}>
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand-red text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-transform hover:scale-110"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </button>
            )}
        </div>
    );
};

export default AIAssistant;