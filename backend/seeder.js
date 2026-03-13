const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const products = [
    // Electronics (10)
    { title: 'Apple iPhone 15 Pro', price: 129999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', rating: { rate: 4.9, count: 450 }, description: 'Titanium design.', sizes: ['128GB', '256GB', '512GB'] },
    { title: 'Samsung Galaxy S24 Ultra', price: 124999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', rating: { rate: 4.8, count: 320 }, description: 'AI phone.', sizes: ['256GB', '512GB'] },
    { title: 'Sony WH-1000XM5', price: 29999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', rating: { rate: 4.9, count: 850 }, description: 'Noise cancelling.', sizes: [] },
    { title: 'MacBook Air M3', price: 114999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', rating: { rate: 4.8, count: 120 }, description: 'Fast M3.', sizes: ['8GB', '16GB'] },
    { title: 'PlayStation 5', price: 54999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800', rating: { rate: 4.9, count: 2100 }, description: 'Gaming console.', sizes: ['Disc Edition'] },
    { title: 'Dell XPS 13', price: 95000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', rating: { rate: 4.6, count: 95 }, description: 'Pro laptop.', sizes: ['16GB RAM'] },
    { title: 'LG OLED TV', price: 135000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', rating: { rate: 4.9, count: 300 }, description: '4K OLED.', sizes: ['55-inch'] },
    { title: 'Canon R5 Camera', price: 320000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=800', rating: { rate: 4.8, count: 45 }, description: 'Mirrorless pro.', sizes: [] },
    { title: 'Nintendo Switch', price: 32999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800', rating: { rate: 4.7, count: 1500 }, description: 'Versatile.', sizes: [] },
    { title: 'Apple Watch S9', price: 41900, category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800', rating: { rate: 4.8, count: 500 }, description: 'Health watch.', sizes: ['41mm', '45mm'] },

    // Footwear (10)
    { title: 'Nike Air Jordan', price: 8995, category: 'Footwear', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', rating: { rate: 4.9, count: 1200 }, description: 'High top.', sizes: ['8', '9', '10'] },
    { title: 'Nike Air Max', price: 13995, category: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', rating: { rate: 4.8, count: 2500 }, description: 'Max cushioning.', sizes: ['9', '10'] },
    { title: 'Adidas Ultraboost', price: 18999, category: 'Footwear', image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800', rating: { rate: 4.7, count: 800 }, description: 'Responsive.', sizes: ['8', '9'] },
    { title: 'Adidas Stan Smith', price: 8999, category: 'Footwear', image: 'https://images.unsplash.com/photo-1588099768531-a72d4a198538?w=800', rating: { rate: 4.6, count: 3200 }, description: 'Classic white.', sizes: ['7', '8'] },
    { title: 'Puma RS-X', price: 7999, category: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', rating: { rate: 4.5, count: 450 }, description: 'Chunky style.', sizes: ['8', '9'] },
    { title: 'Puma Suede', price: 6999, category: 'Footwear', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', rating: { rate: 4.4, count: 1500 }, description: 'Suede blue.', sizes: ['7', '8'] },
    { title: 'Reebok Nano', price: 11999, category: 'Footwear', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', rating: { rate: 4.8, count: 220 }, description: 'Cross-fit.', sizes: ['9', '10'] },
    { title: 'Reebok Classic', price: 7999, category: 'Footwear', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', rating: { rate: 4.7, count: 560 }, description: 'Leather black.', sizes: ['8', '10'] },
    { title: 'Nike Dunk', price: 11995, category: 'Footwear', image: 'https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?w=800', rating: { rate: 4.9, count: 4000 }, description: 'Low retro.', sizes: ['8', '9'] },
    { title: 'Adidas Samba', price: 10999, category: 'Footwear', image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800', rating: { rate: 4.8, count: 1800 }, description: 'Terrace black.', sizes: ['7', '9'] },

    // Clothing (10)
    { title: 'Denim Jeans', price: 4599, category: 'Clothing', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', rating: { rate: 4.6, count: 1200 }, description: 'Blue raw.', sizes: ['32', '34'] },
    { title: 'Cotton Tee', price: 1490, category: 'Clothing', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', rating: { rate: 4.8, count: 500 }, description: 'Soft white.', sizes: ['M', 'L'] },
    { title: 'Biker Jacket', price: 9999, category: 'Clothing', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', rating: { rate: 4.5, count: 85 }, description: 'Faux leather.', sizes: ['L', 'XL'] },
    { title: 'Casual Shirt', price: 2299, category: 'Clothing', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', rating: { rate: 4.3, count: 150 }, description: 'Linen green.', sizes: ['M', 'L'] },
    { title: 'Winter Puffer', price: 24999, category: 'Clothing', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800', rating: { rate: 4.9, count: 320 }, description: 'Insulated red.', sizes: ['S', 'M'] },
    { title: 'Running Tights', price: 3495, category: 'Clothing', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800', rating: { rate: 4.7, count: 450 }, description: 'Sweat wicking.', sizes: ['M', 'L'] },
    { title: 'Mesh Polo', price: 8900, category: 'Clothing', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800', rating: { rate: 4.6, count: 560 }, description: 'Navy classic.', sizes: ['M', 'L'] },
    { title: 'Cotton Hoodie', price: 7999, category: 'Clothing', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', rating: { rate: 4.7, count: 110 }, description: 'Grey marl.', sizes: ['M', 'L'] },
    { title: 'Sport Shorts', price: 1999, category: 'Clothing', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800', rating: { rate: 4.4, count: 210 }, description: 'Black gym.', sizes: ['L', 'XL'] },
    { title: 'Formal Suit', price: 65000, category: 'Clothing', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', rating: { rate: 4.8, count: 42 }, description: 'Charcoal grey.', sizes: ['42R'] },

    // Accessories (10)
    { title: 'Wayfarer Shades', price: 12490, category: 'Accessories', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800', rating: { rate: 4.8, count: 950 }, description: 'Tortoise shell.', sizes: [] },
    { title: 'Signature Pen', price: 45000, category: 'Accessories', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800', rating: { rate: 4.9, count: 200 }, description: 'Chrome nib.', sizes: [] },
    { title: 'Urban Backpack', price: 10999, category: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', rating: { rate: 4.7, count: 1800 }, description: 'Grey poly.', sizes: [] },
    { title: 'Leather Wallet', price: 3495, category: 'Accessories', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800', rating: { rate: 4.5, count: 560 }, description: 'Tan bifold.', sizes: [] },
    { title: 'Sport G-Shock', price: 9495, category: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', rating: { rate: 4.8, count: 1200 }, description: 'Digital shock.', sizes: [] },
    { title: 'Floral Scarf', price: 35000, category: 'Accessories', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800', rating: { rate: 4.6, count: 45 }, description: 'Pink silk.', sizes: [] },
    { title: 'AirTag 4pk', price: 11900, category: 'Accessories', image: 'https://images.unsplash.com/photo-1617042375876-a13e36732a04?w=800', rating: { rate: 4.8, count: 2500 }, description: 'Set of 4.', sizes: [] },
    { title: 'Tumi Case', price: 75000, category: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', rating: { rate: 4.9, count: 120 }, description: 'Hard shell.', sizes: [] },
    { title: 'Oakley Radar', price: 10990, category: 'Accessories', image: 'https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800', rating: { rate: 4.7, count: 450 }, description: 'Cycling lens.', sizes: [] },
    { title: 'Secrid Wallet', price: 5995, category: 'Accessories', image: 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6ecc9?w=800', rating: { rate: 4.8, count: 320 }, description: 'Aluminum.', sizes: [] },

    // Furniture (10)
    { title: 'Armchair Grey', price: 8990, category: 'Furniture', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', rating: { rate: 4.5, count: 2500 }, description: 'Bentwood.', sizes: [] },
    { title: 'Velvet Sofa', price: 125000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', rating: { rate: 4.8, count: 85 }, description: 'Green emerald.', sizes: ['3st'] },
    { title: 'Aeron Office', price: 155000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800', rating: { rate: 4.9, count: 1200 }, description: 'Mash black.', sizes: ['B'] },
    { title: 'Oak Table', price: 45000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1577146371523-d9d2cd5816da?w=800', rating: { rate: 4.7, count: 42 }, description: 'Rectangle.', sizes: ['6st'] },
    { title: 'King Bed', price: 38000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800', rating: { rate: 4.6, count: 110 }, description: 'Fabric head.', sizes: ['K'] },
    { title: 'Steel Shelf', price: 12000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1594620302200-9a7621ef6ef7?w=800', rating: { rate: 4.4, count: 67 }, description: '5 tier.', sizes: [] },
    { title: 'Marble Side', price: 15999, category: 'Furniture', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', rating: { rate: 4.7, count: 35 }, description: 'Gold legs.', sizes: [] },
    { title: 'Leather Foot', price: 7999, category: 'Furniture', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800', rating: { rate: 4.5, count: 120 }, description: 'Tufted.', sizes: [] },
    { title: 'TV Wall Unit', price: 14500, category: 'Furniture', image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800', rating: { rate: 4.6, count: 92 }, description: 'Floating.', sizes: [] },
    { title: 'Stand Desk', price: 22000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800', rating: { rate: 4.7, count: 156 }, description: 'Motorized.', sizes: [] },

    // Sports (10)
    { title: 'NBA Ball', price: 2499, category: 'Sports', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800', rating: { rate: 4.8, count: 4500 }, description: 'Leather grip.', sizes: [] },
    { title: 'Pro Racket', price: 16900, category: 'Sports', image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800', rating: { rate: 4.9, count: 120 }, description: 'Stiff frame.', sizes: [] },
    { title: 'Weights Pod', price: 35000, category: 'Sports', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', rating: { rate: 4.7, count: 320 }, description: 'Dumbbell pod.', sizes: [] },
    { title: 'Grip Mat', price: 6500, category: 'Sports', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', rating: { rate: 4.8, count: 1500 }, description: 'Non slip.', sizes: [] },
    { title: 'Cycling Lid', price: 8900, category: 'Sports', image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=800', rating: { rate: 4.6, count: 450 }, description: 'White aero.', sizes: [] },
    { title: 'Wilson Pro', price: 19500, category: 'Sports', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800', rating: { rate: 4.9, count: 200 }, description: 'Graphite.', sizes: [] },
    { title: 'Everlast 12', price: 3599, category: 'Sports', image: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=800', rating: { rate: 4.5, count: 1800 }, description: 'Padded red.', sizes: [] },
    { title: 'Swim Vision', price: 1899, category: 'Sports', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', rating: { rate: 4.4, count: 2500 }, description: 'Mirror lens.', sizes: [] },
    { title: 'Magnum Bat', price: 28000, category: 'Sports', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800', rating: { rate: 4.8, count: 150 }, description: 'Grade 1.', sizes: [] },
    { title: 'Fitbit Sync', price: 14999, category: 'Sports', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800', rating: { rate: 4.6, count: 800 }, description: 'Smart link.', sizes: [] },

    // Home & Kitchen (10)
    { title: 'Air Fry XL', price: 16995, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=800', rating: { rate: 4.8, count: 3200 }, description: 'Dual zone.', sizes: [] },
    { title: 'Espresso Bar', price: 21000, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800', rating: { rate: 4.7, count: 1100 }, description: 'Steam wand.', sizes: [] },
    { title: 'Stand Mixer', price: 45000, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800', rating: { rate: 4.9, count: 5600 }, description: 'Metal bowl.', sizes: [] },
    { title: 'Cast Iron Pot', price: 32000, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', rating: { rate: 4.8, count: 1500 }, description: 'Heavy lid.', sizes: [] },
    { title: 'Dyson Vac', price: 65000, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800', rating: { rate: 4.9, count: 450 }, description: 'Wireless.', sizes: [] },
    { title: 'Steel Knives', price: 18000, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800', rating: { rate: 4.7, count: 320 }, description: 'Razor edge.', sizes: [] },
    { title: 'Staub Pot', price: 28000, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800', rating: { rate: 4.8, count: 850 }, description: 'Black pot.', sizes: [] },
    { title: 'Grill Skillet', price: 3999, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=800', rating: { rate: 4.6, count: 12000 }, description: 'Square pan.', sizes: [] },
    { title: 'Fresh Storage', price: 2500, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1627483297929-37f416fec7cd?w=800', rating: { rate: 4.5, count: 6500 }, description: 'Clear lid.', sizes: [] },
    { title: 'Pro Cooker', price: 14500, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', rating: { rate: 4.8, count: 8200 }, description: 'Digital dial.', sizes: [] },

    // Stationery (10)
    { title: 'Classic Note', price: 2295, category: 'Stationery', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800', rating: { rate: 4.7, count: 3500 }, description: 'Elastic band.', sizes: [] },
    { title: 'Safari Pen', price: 2800, category: 'Stationery', image: 'https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=800', rating: { rate: 4.8, count: 1500 }, description: 'Ink blue.', sizes: [] },
    { title: 'Digital Tablet', price: 8999, category: 'Stationery', image: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800', rating: { rate: 4.6, count: 1100 }, description: 'Stylus pen.', sizes: [] },
    { title: 'Click Pen', price: 850, category: 'Stationery', image: 'https://images.unsplash.com/photo-1625935228908-e7eda1a48f49?w=800', rating: { rate: 4.5, count: 8500 }, description: 'Iconic.', sizes: [] },
    { title: 'Neon Set', price: 950, category: 'Stationery', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800', rating: { rate: 4.8, count: 12000 }, description: '6 colors.', sizes: [] },
    { title: 'Pencil Case', price: 3500, category: 'Stationery', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800', rating: { rate: 4.7, count: 2500 }, description: 'Tin box.', sizes: [] },
    { title: 'Desktop Pad', price: 995, category: 'Stationery', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800', rating: { rate: 4.9, count: 3200 }, description: 'Desk mat.', sizes: [] },
    { title: 'Super Tips', price: 1200, category: 'Stationery', image: 'https://images.unsplash.com/photo-1516962080544-eac695c93791?w=800', rating: { rate: 4.6, count: 7500 }, description: 'Washable.', sizes: [] },
    { title: 'Fine Write', price: 1450, category: 'Stationery', image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800', rating: { rate: 4.7, count: 5600 }, description: '0.5mm.', sizes: [] },
    { title: 'Sticky Set', price: 650, category: 'Stationery', image: 'https://images.unsplash.com/photo-1579017308347-e53e0d2fc5e9?w=800', rating: { rate: 4.8, count: 15000 }, description: 'Yellow/Pink.', sizes: [] },

    // Books & Media (10)
    { title: 'Atomic Habits', price: 599, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', rating: { rate: 4.9, count: 85000 }, description: 'James Clear.', sizes: [] },
    { title: 'Psychology Money', price: 450, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800', rating: { rate: 4.8, count: 32000 }, description: 'Morgan Housel.', sizes: [] },
    { title: 'Kindle Fire', price: 14999, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d7?w=800', rating: { rate: 4.8, count: 15000 }, description: 'HD screen.', sizes: [] },
    { title: 'The Alchemist', price: 350, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', rating: { rate: 4.7, count: 120000 }, description: 'Paulo Coelho.', sizes: [] },
    { title: 'Creative Act', price: 1800, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800', rating: { rate: 4.9, count: 5600 }, description: 'New release.', sizes: [] },
    { title: 'Ikigai Secret', price: 499, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1517502474097-f9b30659dadb?w=800', rating: { rate: 4.6, count: 45000 }, description: 'Japan secret.', sizes: [] },
    { title: 'Sapiens History', price: 650, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800', rating: { rate: 4.8, count: 75000 }, description: 'Harari.', sizes: [] },
    { title: 'Grow Rich', price: 299, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', rating: { rate: 4.5, count: 110000 }, description: 'Hill classic.', sizes: [] },
    { title: 'Search Meaning', price: 399, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1592492159418-39f319320569?w=800', rating: { rate: 4.9, count: 65000 }, description: 'Frankl memoir.', sizes: [] },
    { title: 'ZeroToOne', price: 550, category: 'Books & Media', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', rating: { rate: 4.7, count: 18000 }, description: 'Peter Thiel.', sizes: [] },

    // Beauty (10)
    { title: 'Hydra Clean', price: 1550, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800', rating: { rate: 4.8, count: 25000 }, description: 'Face wash.', sizes: [] },
    { title: 'Blemish Serum', price: 750, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', rating: { rate: 4.6, count: 45000 }, description: 'Niacinamide.', sizes: [] },
    { title: 'SPF 50 Gel', price: 2450, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800', rating: { rate: 4.9, count: 12000 }, description: 'Sun guard.', sizes: [] },
    { title: 'Night Recovery', price: 8500, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', rating: { rate: 4.8, count: 8500 }, description: 'Advanced repair.', sizes: [] },
    { title: 'Hair Volume', price: 4999, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800', rating: { rate: 4.5, count: 320000 }, description: 'Blowout.', sizes: [] },
    { title: 'Elite Scent', price: 14500, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800', rating: { rate: 4.9, count: 4500 }, description: 'Sauvage.', sizes: [] },
    { title: 'Lip Intensive', price: 1350, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800', rating: { rate: 4.8, count: 18000 }, description: 'Berry mask.', sizes: [] },
    { title: 'Sky High Lash', price: 799, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', rating: { rate: 4.6, count: 110000 }, description: 'Lift mascara.', sizes: [] },
    { title: 'Hair Bonder', price: 2950, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800', rating: { rate: 4.7, count: 65000 }, description: 'No 3 prep.', sizes: [] },
    { title: 'Blade Shave', price: 5495, category: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1629198726653-56d1eacbb8e0?w=800', rating: { rate: 4.8, count: 15000 }, description: 'Electric lid.', sizes: [] },
];

const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        await Product.insertMany(products);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const adminPassword = await bcrypt.hash('admin@123', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@gmail.com',
                password: adminPassword,
                role: 'admin'
            },
            {
                name: 'Manager User',
                email: 'manager@shop.com',
                password: hashedPassword,
                role: 'manager'
            },
            {
                name: 'John Doe',
                email: 'user@shop.com',
                password: hashedPassword,
                role: 'user'
            }
        ];

        await User.insertMany(users);

        console.log('Final Seed: 100 Products and Default Users Created!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
