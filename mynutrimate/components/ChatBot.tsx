

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { SparklesIcon, SendIcon, XIcon, Volume2Icon, VolumeXIcon } from './icons';
import { Spinner } from './Spinner';
import { useI18n } from '../i18n';

interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
}

interface ChatBotProps {
    healthChat: Chat | null;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const createFormattedSpan = (line: string) => {
        const html = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };
    
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
        if (listItems.length > 0 && listType) {
            const ListTag = listType;
            elements.push(
                <ListTag key={`list-${elements.length}`} className={`${ListTag === 'ul' ? 'list-disc' : 'list-decimal'} list-inside space-y-1 my-2`}>
                    {listItems.map((item, index) => (
                        <li key={index}>{createFormattedSpan(item)}</li>
                    ))}
                </ListTag>
            );
            listItems = [];
            listType = null;
        }
    };

    lines.forEach((line) => {
        const ulMatch = line.match(/^(\s*)(-|\*) (.*)/);
        const olMatch = line.match(/^(\s*)(\d+)\. (.*)/);

        if (ulMatch) {
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(ulMatch[3]);
        } else if (olMatch) {
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(olMatch[3]);
        } else {
            flushList();
            if (line.trim() !== '') {
                elements.push(<p key={`p-${elements.length}`} className="my-1">{createFormattedSpan(line)}</p>);
            }
        }
    });

    flushList(); // Add any remaining list

    return <div className="leading-relaxed">{elements}</div>;
};


export const ChatBot: React.FC<ChatBotProps> = ({ healthChat }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useI18n();

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingText, setSpeakingText] = useState('');

    const stopSpeech = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setSpeakingText('');
    }, []);

    const handleSpeak = (textToSpeak: string) => {
        if (isSpeaking && speakingText === textToSpeak) {
            stopSpeech();
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/(\*\*|\*)/g, ''));
        utterance.onend = () => {
            setIsSpeaking(false);
            setSpeakingText('');
        };
        utterance.onerror = () => {
            console.error("Speech synthesis error");
            setIsSpeaking(false);
            setSpeakingText('');
        };
        
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setSpeakingText(textToSpeak);
    };

    useEffect(() => {
        return () => {
            // Cleanup speech synthesis on component unmount
            stopSpeech();
        };
    }, [stopSpeech]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
      if (isOpen && messages.length === 0) {
        setMessages([{ role: 'bot', text: t('chatbotGreeting') }]);
      }
      if (!isOpen) {
        stopSpeech();
      }
    }, [isOpen, messages.length, stopSpeech, t]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isThinking || !healthChat) return;

        stopSpeech();

        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsThinking(true);

        try {
            const result = await healthChat.sendMessageStream({ message: userInput });
            let botResponse = '';
            
            for await (const chunk of result) {
                botResponse += chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'bot') {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { ...lastMessage, text: botResponse };
                        return newMessages;
                    } else {
                        return [...prev, { role: 'bot', text: botResponse }];
                    }
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'bot', text: t('chatbotError') }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 md:bottom-6 right-6 bg-brand-primary text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-brand-secondary transition-transform transform hover:scale-110 z-50 animate-pulse-fast"
                aria-label={t('chatbotToggle')}
            >
                {isOpen ? <XIcon className="h-6 w-6 sm:h-8 sm:w-8" /> : <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8" />}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-full max-w-sm md:max-w-md max-h-[calc(100vh-10rem)] sm:max-h-[550px] md:max-h-[600px] bg-ui-card dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col animate-slide-up z-50 border border-ui-border dark:border-slate-700">
                        <header className="p-4 border-b border-ui-border dark:border-slate-700 flex items-center gap-3">
                            <SparklesIcon className="h-7 w-7 text-brand-primary"/>
                            <h2 className="text-xl font-bold text-ui-text dark:text-slate-100">{t('chatbotTitle')}</h2>
                        </header>
                        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'bot' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                                            <SparklesIcon className="w-5 h-5 text-brand-primary"/>
                                        </div>
                                    )}
                                    <div className={`relative group p-3 rounded-xl max-w-xs break-words ${
                                        msg.role === 'user'
                                        ? 'bg-brand-primary text-white rounded-br-none'
                                        : 'bg-slate-100 dark:bg-slate-700 text-ui-text dark:text-slate-200 rounded-bl-none'
                                    }`}>
                                        {msg.role === 'bot' ? <MarkdownRenderer text={msg.text} /> : msg.text}
                                        {msg.role === 'bot' && msg.text && (
                                            <button
                                                onClick={() => handleSpeak(msg.text)}
                                                className="absolute -bottom-3 -right-3 p-1 bg-slate-200 dark:bg-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={isSpeaking && speakingText === msg.text ? t('chatbotStopSpeaking') : t('chatbotSpeak')}
                                            >
                                                {isSpeaking && speakingText === msg.text 
                                                    ? <VolumeXIcon className="h-4 w-4 text-ui-text-secondary" /> 
                                                    : <Volume2Icon className="h-4 w-4 text-ui-text-secondary" />
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex items-start gap-2.5">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center"><Spinner className="w-5 h-5"/></div>
                                    <div className="p-3 rounded-xl max-w-xs bg-slate-100 dark:bg-slate-700 text-ui-text-secondary dark:text-slate-400 rounded-bl-none italic">
                                        {t('chatbotThinking')}
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-ui-border dark:border-slate-700 flex items-center gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={t('chatbotPlaceholder')}
                                disabled={isThinking}
                                className="flex-1 w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <button
                                type="submit"
                                disabled={isThinking || !userInput.trim()}
                                className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-secondary disabled:bg-slate-400 disabled:cursor-not-allowed"
                                aria-label={t('chatbotSpeak')}
                            >
                                <SendIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </>
    );
};
