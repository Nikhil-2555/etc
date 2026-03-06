const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Product = require('../models/Product');

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System prompt that makes the AI act as a shopping assistant
const SYSTEM_PROMPT = `You are "ShopFlow AI", a friendly and knowledgeable shopping assistant for the ShopFlow e-commerce store.

Your responsibilities:
- Help customers find products based on their needs, preferences, and budget
- Provide product recommendations and comparisons
- Answer questions about products, categories, sizing, and shopping
- Suggest gift ideas based on occasions and recipient descriptions
- Be enthusiastic but honest — don't oversell

Guidelines:
- Keep responses concise (2-4 short paragraphs max)
- Use bullet points for product suggestions
- Include the product name and price when recommending specific products from our catalog
- If you recommend products from our catalog, mention them by their exact title
- Use ₹ (Indian Rupees) for all prices
- Be warm, helpful, and conversational
- If asked about something unrelated to shopping/products, politely redirect to how you can help with shopping

You will be provided with the current product catalog data. Use it to make accurate, specific recommendations.`;

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
        const products = await Product.find({}).select('title price category description rating stock sizes').lean();

        const catalogSummary = products.map(p =>
            `• ${p.title} — ₹${p.price} (${p.category})${p.stock <= 0 ? ' [OUT OF STOCK]' : ''}${p.sizes?.length ? ` [Sizes: ${p.sizes.join(', ')}]` : ''} — Rating: ${p.rating?.rate || 'N/A'}/5`
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
            reply: "I'm having a little trouble right now. Please try again in a moment! 🔄"
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
        const products = await Product.find({}).lean();

        // Build context
        let contextPrompt = '';

        if (productId) {
            const currentProduct = products.find(p => p._id.toString() === productId);
            if (currentProduct) {
                contextPrompt = `The customer is currently viewing: "${currentProduct.title}" (₹${currentProduct.price}, category: ${currentProduct.category}).`;
            }
        }

        if (cartItems.length > 0) {
            const cartDescriptions = cartItems.map(item => `"${item.title}" (₹${item.price})`).join(', ');
            contextPrompt += `\nThe customer's cart contains: ${cartDescriptions}.`;
        }

        const catalogSummary = products.map(p =>
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

module.exports = router;
