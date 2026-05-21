import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
        <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="w-[95%] max-w-[1400px] bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full max-h-[850px] overflow-hidden">

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                                <FiCpu className="text-white" size={24} />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                        </div>
                        <div>
                            <h2 className="text-gray-900 dark:text-white font-bold text-xl flex items-center gap-2">
                                ShopFlow Assistant
                                <FiShield className="text-primary-500" size={16} />
                            </h2>
                            <p className="text-primary-600 dark:text-primary-400 text-sm flex items-center gap-1">
                                <FiSmile size={13} /> Always here to help
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-primary-600 text-white'
                                    }`}>
                                    {msg.role === 'user' ? <FiUser size={16} /> : <FiCpu size={16} />}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-sm'
                                        : msg.isError
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-tl-sm'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-tl-sm'
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
                            className="px-6 pb-3 pt-1 flex flex-wrap gap-2 flex-shrink-0 justify-center"
                        >
                            {QUICK_PROMPTS.map((qp, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => sendMessage(qp.prompt)}
                                    className="text-xs px-3.5 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-600 transition-colors font-medium"
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                    <div className="flex items-end gap-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl p-2 border border-gray-200 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                        <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-white dark:bg-gray-600 ml-0.5 mb-0.5">
                            <FiShoppingBag className="text-gray-400 dark:text-gray-500" size={16} />
                        </div>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message to ShopFlow AI..."
                            className="flex-1 bg-transparent outline-none text-sm pt-2.5 pb-2.5 text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none min-h-[40px] max-h-[120px]"
                            disabled={isLoading}
                            rows={1}
                            style={{
                                height: input ? 'auto' : '40px',
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
                            className={`w-9 h-9 rounded-lg flex items-center justify-center mb-0.5 transition-all flex-shrink-0 ${input.trim() && !isLoading
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <FiSend size={16} />
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
