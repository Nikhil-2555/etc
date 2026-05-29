const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '' });

        // Configure multer for audio uploads (store in temp directory)
const uploadDir = path.join(__dirname, '..', 'temp_uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `voice_${Date.now()}_${file.originalname}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/m4a', 'audio/flac', 'video/webm'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported audio format: ${file.mimetype}`));
        }
    }
});

// @desc    Transcribe audio using GROQ Whisper
// @route   POST /api/ai/transcribe
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file provided' });
        }

        filePath = req.file.path;

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
            return res.status(503).json({ message: 'AI service is not configured' });
        }

        // Send audio to GROQ Whisper for transcription
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-large-v3-turbo',
            language: 'en',
            response_format: 'json',
        });

        const text = transcription.text || '';
        console.log('Whisper transcription:', text);

        res.json({ text, success: true });

    } catch (error) {
        console.error('Transcription Error:', error.message);
        
        let errorMessage = 'Failed to transcribe audio';
        if (error.status === 401 || error.message.includes('API')) {
            errorMessage = 'GROQ API key is invalid or expired. Please check backend .env file.';
        }
        
        res.status(500).json({
            message: errorMessage,
            error: error.message,
        });
    } finally {
        // Clean up the temp file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete temp audio file:', err);
            });
        }
    }
});

// System prompt that makes the AI act as a shopping assistant — STRICT shop-only mode
const SYSTEM_PROMPT = `You are "ShopMate AI", a friendly shopping assistant exclusively for the ShopMate e-commerce store.

══════════════════════════════════════════
🛍️  YOUR ONLY PURPOSE — SHOPPING HELP
══════════════════════════════════════════
You are ONLY allowed to help with topics directly related to shopping on ShopMate, including:
  • Finding or recommending products from our catalog
  • Comparing prices, ratings, sizes, or features of products
  • Suggesting gifts for occasions or recipients
  • Answering questions about product categories, availability, or stock
  • Helping users find deals, budget picks, or trending items
  • Questions about orders, cart, wishlist, or checkout (general guidance)

══════════════════════════════════════════
🚫  STRICTLY FORBIDDEN — REFUSE THESE
══════════════════════════════════════════
You must NEVER fulfill requests for:
  • Writing, editing, or explaining any kind of code (Python, JavaScript, HTML, SQL, etc.)
  • Programming tutorials, algorithms, or debugging help
  • Essays, stories, poems, or creative writing
  • Math problems, science questions, or homework help
  • News, politics, history, geography, or general knowledge
  • Medical, legal, or financial advice
  • Recipes, cooking tips, or lifestyle advice
  • Anything unrelated to shopping on ShopMate

When a user asks about ANY forbidden topic, you MUST respond with a friendly but firm refusal. Use this exact structure:
  1. Acknowledge their question briefly (one sentence).
  2. Explain you can only help with ShopMate shopping.
  3. Offer a relevant shopping alternative or a quick prompt they can try.

Example refusal for "write Python code":
"That's a coding request, and I'm only set up to help you shop on ShopMate! 🛍️ 
I can't write code, but I *can* help you find great tech accessories, gadgets, or any product in our store. 
Want me to suggest some popular electronics or budget-friendly picks?"

══════════════════════════════════════════
✅  RESPONSE STYLE RULES
══════════════════════════════════════════
- Keep responses concise (2-4 short paragraphs or a short bullet list)
- Use bullet points for product suggestions
- Include the product name and price (₹ Indian Rupees) for catalog items
- CRITICAL: Whenever you recommend a specific product, you MUST include its image using Markdown syntax: ![Product Name](Image_URL)
- Be warm, enthusiastic, and conversational
- Never pretend you can help with off-topic tasks
- If the user persists on off-topic subjects, kindly repeat that you are a shopping-only assistant

You will be provided with the current product catalog. Use it for accurate, specific recommendations.`;


// @desc    AI Chat - Shopping Assistant
// @route   POST /api/ai/chat
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: 'Message is required' });
        }

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
            return res.status(503).json({
                message: 'AI service is not configured. Please add your GROQ_API_KEY to the .env file.',
                reply: "I'm not configured yet! The store admin needs to add a Groq API key."
            });
        }

        // Fetch current product catalog for context
        const allProducts = await Product.find({}).select('title price category image').lean();

        // Filter products to keep context size under Groq's 12000 TPM limit
        const userQuery = message.toLowerCase();
        let relevantProducts = allProducts.filter(p => 
            p.title.toLowerCase().includes(userQuery) || 
            p.category.toLowerCase().includes(userQuery) ||
            userQuery.split(' ').some(word => word.length > 3 && p.title.toLowerCase().includes(word))
        );
        
        // Fallback: if no matches, just send the first 40 products
        if (relevantProducts.length === 0) {
            relevantProducts = allProducts.slice(0, 40);
        } else {
            // Cap at 40 products to avoid rate limit
            relevantProducts = relevantProducts.slice(0, 40);
        }

        const catalogSummary = relevantProducts.map(p =>
            `• ${p.title} — ₹${p.price} (${p.category}) — Image_URL: ${p.image || ''}`
        ).join('\n');

        // Build conversation for Groq
        const messages = [
            {
                role: 'system',
                content: `${SYSTEM_PROMPT}\n\nHere is our current product catalog:\n${catalogSummary}`
            },
            {
                role: 'assistant',
                content: "I'm ShopFlow AI, ready to help you find the perfect products! I have access to your full catalog and I'm here to assist with recommendations, comparisons, gift ideas, and any shopping questions. How can I help you today? 🛍️"
            },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile', // using a highly capable 70b groq model
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I couldn't process that.";

        res.json({
            reply,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('AI Chat Error:', error.message);

        if (error.message?.includes('API_KEY')) {
            return res.status(401).json({
                message: 'Invalid API key',
                reply: "There's an issue with the AI configuration. Please check the API key. 🔧"
            });
        }

        res.status(500).json({
            message: 'AI service temporarily unavailable',
            reply: `I'm having a little trouble right now. Please try again in a moment! 🔄 (Error: ${error.message})`
        });
    }
});


// @desc    AI Product Recommendations
// @route   POST /api/ai/recommendations
router.post('/recommendations', async (req, res) => {
    try {
        const { productId, cartItems = [] } = req.body;

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
            // Fallback: return random products from the same category
            let product = null;
            if (productId) {
                product = await Product.findById(productId).lean();
            }
            const query = product ? { category: product.category, _id: { $ne: product._id } } : {};
            const fallback = await Product.find(query).limit(4).lean();
            return res.json({
                recommendations: fallback,
                aiPowered: false,
                reason: 'Similar products in the same category'
            });
        }

        // Get all products for context
        const allProducts = await Product.find({}).select('_id title price category rating').lean();

        // Build context
        let contextPrompt = '';
        let targetCategory = null;

        if (productId) {
            const currentProduct = allProducts.find(p => p._id.toString() === productId);
            if (currentProduct) {
                contextPrompt = `The customer is currently viewing: "${currentProduct.title}" (₹${currentProduct.price}, category: ${currentProduct.category}).`;
                targetCategory = currentProduct.category;
            }
        }

        if (cartItems.length > 0) {
            const cartDescriptions = cartItems.map(item => `"${item.title}" (₹${item.price})`).join(', ');
            contextPrompt += `\nThe customer's cart contains: ${cartDescriptions}.`;
            if (!targetCategory && cartItems[0].category) targetCategory = cartItems[0].category;
        }

        // To avoid TPM limits, limit to ~80 products prioritized by category
        let productsToSend = allProducts;
        if (targetCategory) {
            productsToSend = allProducts.filter(p => p.category === targetCategory).slice(0, 60);
            if (productsToSend.length < 60) {
                const others = allProducts.filter(p => p.category !== targetCategory).slice(0, 60 - productsToSend.length);
                productsToSend = [...productsToSend, ...others];
            }
        } else {
            productsToSend = allProducts.slice(0, 60);
        }

        const catalogSummary = productsToSend.map(p =>
            `ID:${p._id} | ${p.title} | ₹${p.price} | ${p.category} | Rating:${p.rating?.rate || 'N/A'}`
        ).join('\n');

        const prompt = `You are a product recommendation engine for ShopFlow e-commerce.

${contextPrompt}

Here is our full product catalog:
${catalogSummary}

Based on the customer's current viewing/cart context, recommend exactly 4 complementary products they might like.
Consider: category relevance, price range compatibility, and what pairs well together.

IMPORTANT: Respond ONLY with a JSON array of product IDs, nothing else. Example: ["id1", "id2", "id3", "id4"]
Only use IDs from the catalog above.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const responseText = chatCompletion.choices[0]?.message?.content?.trim() || "[]";

        // Parse AI response — extract JSON array
        let recommendedIds = [];
        try {
            const jsonMatch = responseText.match(/\[.*\]/s);
            if (jsonMatch) {
                recommendedIds = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.error('Failed to parse AI recommendation response:', responseText);
        }

        // Fetch the recommended products
        let recommendations = [];
        if (recommendedIds.length > 0) {
            recommendations = await Product.find({
                _id: { $in: recommendedIds }
            }).lean();
        }

        // Fallback if AI returned 0 valid products
        if (recommendations.length < 2) {
            let product = null;
            if (productId) {
                product = await Product.findById(productId).lean();
            }
            const query = product ? { category: product.category, _id: { $ne: product._id } } : {};
            recommendations = await Product.find(query).limit(4).lean();
        }

        res.json({
            recommendations: recommendations.slice(0, 4),
            aiPowered: true,
            reason: 'AI-powered recommendations based on your interests'
        });

    } catch (error) {
        console.error('AI Recommendation Error:', error.message);

        // Fallback: return products from same category
        try {
            let product = null;
            if (req.body.productId) {
                product = await Product.findById(req.body.productId).lean();
            }
            const query = product ? { category: product.category, _id: { $ne: product._id } } : {};
            const fallback = await Product.find(query).limit(4).lean();
            return res.json({
                recommendations: fallback,
                aiPowered: false,
                reason: 'Similar products you might like'
            });
        } catch (fallbackError) {
            res.status(500).json({ message: 'Failed to get recommendations' });
        }
    }
});

// @desc    Parse voice command into structured search parameters
// @route   POST /api/ai/parse-voice-command
router.post('/parse-voice-command', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'Voice text is required' });
        }

        // Fallback: basic regex parsing if Groq is not configured
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
            const fallback = basicVoiceParse(text);
            return res.json(fallback);
        }

        const prompt = `You are a voice command parser for an e-commerce store called ShopFlow.
The user spoke the following command via voice search:
"${text}"

Parse this into a structured JSON object with the following fields:
- "query": the main product search keyword(s) (e.g. "laptops", "running shoes", "headphones"). Extract only the product name/type.
- "maxPrice": if the user mentioned a price limit (e.g. "under 50000", "below 20000", "less than 10000"), extract the number. If no price mentioned, set to null.
- "minPrice": if the user mentioned a minimum price (e.g. "above 5000", "over 10000"), extract the number. If no min price mentioned, set to null.
- "category": if the command clearly maps to one of these categories, include it: Electronics, Accessories, Clothing, Furniture, Footwear, Sports, Home & Kitchen, Stationery, Books & Media, Beauty & Personal Care. If unsure, set to null.
- "sortBy": if the user mentioned sorting (e.g. "cheapest", "highest rated", "most expensive"), set to one of: "price-low-high", "price-high-low", "rating". If not mentioned, set to null.

IMPORTANT: Respond ONLY with valid JSON, nothing else. No markdown, no explanation.
Example input: "Show me laptops under 50000"
Example output: {"query":"laptops","maxPrice":50000,"minPrice":null,"category":"Electronics","sortBy":null}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '{}';

        let parsed = {};
        try {
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.error('Failed to parse AI voice command response:', responseText);
            parsed = basicVoiceParse(text);
        }

        res.json({
            query: parsed.query || text,
            maxPrice: parsed.maxPrice || null,
            minPrice: parsed.minPrice || null,
            category: parsed.category || null,
            sortBy: parsed.sortBy || null,
            originalText: text,
            aiPowered: true,
        });

    } catch (error) {
        console.error('Voice Command Parse Error:', error.message);
        // Fallback to basic parsing
        const fallback = basicVoiceParse(req.body.text || '');
        res.json({ ...fallback, aiPowered: false });
    }
});

// Basic regex-based voice command parser (fallback)
function basicVoiceParse(text) {
    const lower = text.toLowerCase();
    let query = text;
    let maxPrice = null;
    let minPrice = null;
    let category = null;
    let sortBy = null;

    // Extract price limits
    const underMatch = lower.match(/(?:under|below|less than|within|upto|up to|max)\s*(?:₹|rs\.?|inr)?\s*(\d+)/);
    if (underMatch) {
        maxPrice = parseInt(underMatch[1]);
        query = text.replace(underMatch[0], '').trim();
    }

    const aboveMatch = lower.match(/(?:above|over|more than|min|minimum|starting)\s*(?:₹|rs\.?|inr)?\s*(\d+)/);
    if (aboveMatch) {
        minPrice = parseInt(aboveMatch[1]);
        query = query.replace(aboveMatch[0], '').trim();
    }

    // Remove common filler words
    query = query.replace(/\b(show|show me|find|search|search for|get|i want|i need|looking for|look for)\b/gi, '').trim();
    // Remove trailing/leading punctuation
    query = query.replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();

    // Try to detect category
    const categoryMap = {
        'electronics': 'Electronics', 'electronic': 'Electronics',
        'accessories': 'Accessories', 'accessory': 'Accessories',
        'clothing': 'Clothing', 'clothes': 'Clothing', 'fashion': 'Clothing',
        'furniture': 'Furniture',
        'footwear': 'Footwear', 'shoes': 'Footwear', 'shoe': 'Footwear',
        'sports': 'Sports', 'sport': 'Sports',
        'kitchen': 'Home & Kitchen', 'home': 'Home & Kitchen',
        'stationery': 'Stationery',
        'books': 'Books & Media', 'book': 'Books & Media',
        'beauty': 'Beauty & Personal Care', 'personal care': 'Beauty & Personal Care',
    };
    for (const [keyword, cat] of Object.entries(categoryMap)) {
        if (lower.includes(keyword)) {
            category = cat;
            break;
        }
    }

    // Detect sorting
    if (lower.includes('cheapest') || lower.includes('lowest price')) sortBy = 'price-low-high';
    else if (lower.includes('expensive') || lower.includes('highest price')) sortBy = 'price-high-low';
    else if (lower.includes('top rated') || lower.includes('best rated') || lower.includes('highest rated')) sortBy = 'rating';

    return {
        query: query || text,
        maxPrice,
        minPrice,
        category,
        sortBy,
        originalText: text,
        aiPowered: false,
    };
}

module.exports = router;
