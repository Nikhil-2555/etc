import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiCpu, FiShoppingBag, FiUser, FiChevronDown, FiShield, FiSmile } from 'react-icons/fi';
import { getAIRecommendations } from '../services/api';

const QUICK_PROMPTS = [
    { label: '🎁 Gift ideas', prompt: 'Suggest gift ideas under ₹2000' },
    { label: '🔥 Trending', prompt: 'What are your best-selling products right now?' },
    { label: '💰 Budget picks', prompt: 'Show me the best value-for-money products under ₹1000' },
    { label: '👗 Outfit help', prompt: 'Help me find a stylish outfit' },
];

const CustomerSupport = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Welcome to ShopFlow Support! 👋\n\nI'm your dedicated AI shopping assistant. Whether you need help finding a product, checking your order status, or picking the perfect gift — I'm here for you.\n\nHow can I make your shopping experience better today?",
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
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'instant'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

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
            const errorReply = error.response?.data?.reply || error.response?.data?.message || "Oops! I'm having trouble connecting to my systems. Please try again in a moment. 🔄";
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
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-inherit">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-inherit">$1</em>')
            .replace(/^[•\-]\s?(.+)/gm, '<li class="ml-4 list-disc marker:text-primary-400">$1</li>')
            .replace(/(<li class="ml-4 list-disc marker:text-primary-400">.*<\/li>)/gs, '<ul class="space-y-1.5 my-3">$1</ul>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="h-[calc(100vh-80px)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex flex-col items-center justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
            {/* Background Decorative Blur Orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-40 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300 dark:bg-primary-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-[95%] max-w-[1600px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-[2.5rem] border border-white/60 dark:border-gray-700/50 flex flex-col h-full max-h-[850px] overflow-hidden z-10"
            >
                {/* Header */}
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 flex items-center justify-between flex-shrink-0 relative z-20">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-blue-500 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center transform rotate-3 transition-transform hover:rotate-0">
                                <FiCpu className="text-white drop-shadow-md" size={28} />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></span>
                        </div>
                        <div>
                            <h2 className="text-gray-900 dark:text-white font-extrabold text-2xl tracking-tight flex items-center gap-2">
                                ShopFlow Assistant
                                <FiShield className="text-primary-500" size={20} />
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-primary-600 dark:text-primary-400 font-medium text-sm flex items-center gap-1.5">
                                    <FiSmile size={14} /> Always here to help
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-8 scroll-smooth relative"
                >
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center mt-1 transform ${msg.role === 'user'
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 -rotate-3'
                                    : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white rotate-3'
                                    }`}>
                                    {msg.role === 'user' ? <FiUser size={18} /> : <FiCpu size={18} />}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm'
                                        : msg.isError
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-tl-sm'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-tl-sm shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]'
                                        }`}
                                    dangerouslySetInnerHTML={{
                                        __html: msg.role === 'user' ? msg.content : formatMessage(msg.content)
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}

                    {/* Loading indicator */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-4 max-w-[85%]">
                                    <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 text-white mt-1 rotate-3 shadow-sm">
                                        <FiCpu size={18} className="animate-spin" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700/50 px-6 py-5 rounded-3xl rounded-tl-sm flex items-center gap-2">
                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium mr-1">Thinking</span>
                                        <div className="flex gap-1.5 mt-1">
                                            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} className="h-4" />

                    {/* Scroll to bottom button */}
                    <AnimatePresence>
                        {showScrollBtn && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                onClick={() => scrollToBottom()}
                                className="sticky bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-full p-2.5 border border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors z-30"
                            >
                                <FiChevronDown size={22} className="animate-bounce" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Prompts */}
                <AnimatePresence>
                    {messages.length <= 2 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, margin: 0, overflow: 'hidden' }}
                            className="px-8 pb-4 pt-2 flex flex-wrap gap-2.5 flex-shrink-0 justify-center bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 relative z-20"
                        >
                            {QUICK_PROMPTS.map((qp, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => sendMessage(qp.prompt)}
                                    className="text-[13px] px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700 transition-all font-medium shadow-sm hover:shadow-md"
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="px-6 py-5 sm:px-8 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl relative z-20">
                    <div className="flex items-end gap-3 bg-white dark:bg-gray-800 rounded-3xl p-2.5 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all shadow-sm">
                        <div className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-gray-50 dark:bg-gray-700/50 ml-1 mb-0.5">
                            <FiShoppingBag className="text-gray-400 dark:text-gray-500" size={18} />
                        </div>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message to ShopFlow AI..."
                            className="flex-1 bg-transparent outline-none text-[15px] pt-3 pb-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none min-h-[44px] max-h-[120px] scrollbar-hide"
                            disabled={isLoading}
                            rows={1}
                            style={{
                                height: input ? 'auto' : '44px',
                                scrollbarWidth: 'none'
                            }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = (e.target.scrollHeight) + 'px';
                                if (e.target.scrollHeight > 120) {
                                    e.target.style.overflowY = 'auto';
                                } else {
                                    e.target.style.overflowY = 'hidden';
                                }
                            }}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-0.5 transition-all flex-shrink-0 ${input.trim() && !isLoading
                                ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <FiSend size={18} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5" : ""} />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-3 px-2">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                            <FiShield size={12} /> Privacy protected conversation
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                            Powered by <span className="text-gray-600 dark:text-gray-300 font-semibold">Groq AI</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CustomerSupport;
