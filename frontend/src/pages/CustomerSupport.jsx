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
            .replace(/^[•-]\s?(.+)/gm, '<li class="ml-4 list-disc marker:text-primary-400">$1</li>')
            .replace(/(<li class="ml-4 list-disc marker:text-primary-400">.*<\/li>)/gs, '<ul class="space-y-1.5 my-3">$1</ul>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-32 h-32 object-cover rounded-xl my-3 border border-gray-200 dark:border-gray-700 shadow-md" />')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#fafafc] dark:bg-gray-950 flex flex-col items-center justify-center py-6 sm:py-24 px-4 sm:px-8 lg:px-12 xl:px-16 relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

            <div className="w-full max-w-[2000px] bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-3xl sm:rounded-[2.5rem] border border-white/80 dark:border-gray-700/50 flex flex-col h-[85vh] sm:h-[80vh] min-h-[400px] sm:min-h-[600px] max-h-[900px] overflow-hidden relative z-10">

                {/* Header */}
                <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-white/60 dark:border-gray-700/50 px-8 py-6 flex items-center justify-between flex-shrink-0 z-20">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
                                <FiCpu className="text-white" size={26} />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-[3px] border-white rounded-full shadow-sm"></span>
                        </div>
                        <div>
                            <h2 className="text-gray-900 dark:text-gray-100 font-extrabold text-2xl flex items-center gap-2 tracking-tight">
                                ShopFlow AI Assistant
                                <FiShield className="text-indigo-500" size={18} />
                            </h2>
                            <p className="text-indigo-600 font-medium text-sm flex items-center gap-1.5 mt-0.5">
                                <FiSmile size={14} /> Always active & ready to help
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scroll-smooth"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-tr from-gray-800 to-gray-900 text-white'
                                    : 'bg-gradient-to-tr from-primary-600 to-indigo-500 text-white'
                                    }`}>
                                    {msg.role === 'user' ? <FiUser size={18} /> : <FiCpu size={18} />}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`px-6 py-4 rounded-[1.5rem] text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-gray-900 dark:bg-primary-600 text-white rounded-tr-sm'
                                        : msg.isError
                                            ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                                            : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-gray-200 border border-white/60 dark:border-gray-700/50 rounded-tl-sm'
                                        }`}
                                    dangerouslySetInnerHTML={{
                                        __html: msg.role === 'user' ? msg.content : formatMessage(msg.content)
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-primary-600 text-white mt-1">
                                        <FiCpu size={16} className="animate-spin" />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                        <span className="text-gray-500 dark:text-gray-400 text-sm">Thinking</span>
                                        <div className="flex gap-1 mt-0.5">
                                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => scrollToBottom()}
                                className="sticky bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-700 shadow-md rounded-full p-2 border border-gray-200 dark:border-gray-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-600 transition-colors z-30"
                            >
                                <FiChevronDown size={20} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Prompts */}
                <AnimatePresence>
                    {messages.length <= 2 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            className="px-8 pb-4 pt-2 flex flex-wrap gap-3 flex-shrink-0 justify-center"
                        >
                            {QUICK_PROMPTS.map((qp, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => sendMessage(qp.prompt)}
                                    className="text-sm px-5 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:text-indigo-600 border border-gray-100/50 dark:border-gray-700/50 transition-all font-semibold"
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="px-8 py-6 border-t border-white/60 dark:border-gray-700/50 flex-shrink-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                    <div className="flex items-end gap-3 bg-white/80 dark:bg-gray-800/80 rounded-2xl p-2 border border-gray-100/50 dark:border-gray-700/50 shadow-inner focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all">
                        <div className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl bg-gray-50 dark:bg-gray-700/80 ml-1 mb-1">
                            <FiShoppingBag className="text-indigo-400" size={20} />
                        </div>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask ShopFlow AI about products, trends, or gifts..."
                            className="flex-1 bg-transparent outline-none text-[15px] font-medium pt-4 pb-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none min-h-[50px] max-h-[150px]"
                            disabled={isLoading}
                            rows={1}
                            style={{
                                height: input ? 'auto' : '50px',
                                scrollbarWidth: 'none'
                            }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = (e.target.scrollHeight) + 'px';
                                if (e.target.scrollHeight > 150) {
                                    e.target.style.overflowY = 'auto';
                                } else {
                                    e.target.style.overflowY = 'hidden';
                                }
                            }}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 transition-all flex-shrink-0 shadow-sm ${input.trim() && !isLoading
                                ? 'bg-gray-900 dark:bg-primary-600 text-white hover:bg-indigo-600 hover:shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <FiSend size={18} className={input.trim() && !isLoading ? 'translate-x-0.5' : ''} />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2.5 px-1">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <FiShield size={11} /> Privacy protected
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            Powered by <span className="text-gray-600 dark:text-gray-300 font-medium">Groq AI</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSupport;
