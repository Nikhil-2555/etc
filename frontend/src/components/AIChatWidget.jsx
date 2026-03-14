import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiCpu, FiShoppingBag, FiUser, FiChevronDown } from 'react-icons/fi';
import { getAIRecommendations } from '../services/api';

const QUICK_PROMPTS = [
    { label: '🎁 Gift ideas', prompt: 'Suggest gift ideas under ₹2000' },
    { label: '🔥 Trending', prompt: 'What are your best-selling products right now?' },
    { label: '💰 Budget picks', prompt: 'Show me the best value-for-money products under ₹1000' },
    { label: '👗 Outfit help', prompt: 'Help me find a stylish outfit' },
];

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hey there! 👋 I'm **ShopMate AI** — your personal shopping assistant!\n\nI can help you **find products**, **compare items**, **suggest gifts**, and discover the best deals in our store. 🛍️\n\n> ⚠️ I'm a shopping-only assistant — I can't help with coding, writing, or general questions. Just shop talk here!\n\nTap a quick prompt below or ask me anything about our products!",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Detect scroll position
    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };

    const sendMessage = async (text) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build conversation history for context (skip the initial welcome message)
            const history = messages
                .filter((_, idx) => idx > 0) // skip welcome
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    content: msg.content,
                }));

            const data = await getAIRecommendations(messageText, history);

            const assistantMessage = {
                role: 'assistant',
                content: data.reply || data.message || "I couldn't process that. Please try again!",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorReply = error.response?.data?.reply || error.response?.data?.message || "Oops! I'm having trouble connecting. Please try again in a moment. 🔄";
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorReply,
                timestamp: new Date(),
                isError: true,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Simple markdown: bold, bullets, newlines
    const formatMessage = (text) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^[•\-]\s?(.+)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc pl-4 space-y-1 my-2">$1</ul>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <>
            {/* Floating Chat Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-primary-500/40 transition-shadow group"
                        aria-label="Open AI Shopping Assistant"
                    >
                        <FiMessageCircle size={28} className="group-hover:hidden" />
                        <FiCpu size={28} className="hidden group-hover:block animate-pulse" />

                        {/* Pulse ring */}
                        <span className="absolute w-full h-full rounded-full bg-primary-500 animate-ping opacity-20" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-6 right-6 z-50 w-[600px] max-w-[calc(100vw-2rem)] h-[800px] max-h-[calc(100vh-3rem)] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <FiCpu className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">ShopMate AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-white/80 text-xs">Shopping-Only Assistant</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                                aria-label="Close chat"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={chatContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
                            style={{ scrollbarWidth: 'thin' }}
                        >
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user'
                                            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                                            : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                                            }`}>
                                            {msg.role === 'user' ? <FiUser size={14} /> : <FiCpu size={14} />}
                                        </div>

                                        {/* Bubble */}
                                        <div
                                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-primary-600 text-white rounded-br-md'
                                                : msg.isError
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800 rounded-bl-md'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                                                }`}
                                            dangerouslySetInnerHTML={{
                                                __html: msg.role === 'user' ? msg.content : formatMessage(msg.content)
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex gap-2 max-w-[85%]">
                                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 text-white mt-1">
                                            <FiCpu size={14} className="animate-spin" />
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-800 px-5 py-4 rounded-2xl rounded-bl-md">
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to bottom button */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => scrollToBottom()}
                                    className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                    <FiChevronDown size={18} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Quick Prompts — only show when few messages */}
                        {messages.length <= 2 && !isLoading && (
                            <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                                {QUICK_PROMPTS.map((qp, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(qp.prompt)}
                                        className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors font-medium border border-primary-100 dark:border-primary-800"
                                    >
                                        {qp.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                <FiShoppingBag className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={18} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about products, gifts..."
                                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${input.trim() && !isLoading
                                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                        }`}
                                >
                                    <FiSend size={14} />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                                Powered by Groq AI · Responses may not be 100% accurate
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatWidget;
