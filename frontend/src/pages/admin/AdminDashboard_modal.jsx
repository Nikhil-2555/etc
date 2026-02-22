            </main>
            
            {/* New Product Modal */}
            <AnimatePresence>
                {showNewProductModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNewProductModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                                <button
                                    onClick={() => setShowNewProductModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <FiX className="text-xl" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateProduct} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                        placeholder="Enter product name"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                            Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                            Stock *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={newProduct.countInStock}
                                            onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Footwear">Footwear</option>
                                        <option value="Home & Kitchen">Home & Kitchen</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Books">Books</option>
                                        <option value="Beauty">Beauty</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 resize-none"
                                        placeholder="Enter product description"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={newProduct.image}
                                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewProductModal(false)}
                                        className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95"
                                    >
                                        Create Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
