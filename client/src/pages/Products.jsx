import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Edit3, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';
import ProductForm from '../components/products/ProductForm';
import ProductList from '../components/products/ProductList';
import { useProducts } from '../hooks/useProducts';

export default function Products() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, refetch } = useProducts();

  const [query, setQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const perPage = 12;

  useEffect(() => {
    if (error) {
      showToast('error', String(error));
    }
  }, [error]);

  const showToast = (type, message, ms = 3500) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), ms);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setIsFormOpen(true);
  };

  const toggleExpand = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        showToast('success', 'Product updated');
      } else {
        await createProduct(data);
        showToast('success', 'Product created');
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      refetch?.();
    } catch (err) {
      console.error(err);
      showToast('error', err?.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      showToast('success', 'Product deleted');
      setConfirmDelete(null);
      refetch?.();
    } catch (err) {
      console.error(err);
      showToast('error', err?.response?.data?.message || 'Failed to delete product');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products ?? [];
    
    return (products || []).filter(p => (
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.baseSku || '').toLowerCase().includes(q) ||
      String(p.category || '').toLowerCase().includes(q) ||
      (p.variants || []).some(v => 
        String(v.sku || '').toLowerCase().includes(q) ||
        String(v.color || '').toLowerCase().includes(q) ||
        String(v.size || '').toLowerCase().includes(q)
      )
    ));
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / perPage));
  const pageItems = (filtered || []).slice((page - 1) * perPage, page * perPage);

  // Calculate total stock for a product
  const getTotalStock = (product) => {
    return (product.variants || []).reduce((total, variant) => total + (variant.quantity || 0), 0);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage inventory — add products with variants, and keep things tidy.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by name, base SKU, variant SKU, color, or size"
              className="w-full md:w-72 rounded-full border border-slate-200 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow">
            <PlusCircle className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed right-4 top-6 z-50 w-[320px] rounded-lg p-3 shadow-lg ${toast.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="text-sm">{toast.message}</div>
              <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse p-4 rounded-lg bg-slate-100 h-40" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded">Failed to load products. <button onClick={() => refetch?.()} className="underline ml-2">Retry</button></div>
      ) : (filtered?.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm text-slate-500 mt-2">Add your first product to get started.</p>
          <div className="mt-4">
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow">
              <PlusCircle className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Grid / List of products */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pageItems.map(product => (
              <div key={product.id} className="border-b border-slate-100 last:border-b-0">
                {/* Product header */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer" onClick={() => toggleExpand(product.id)}>
                  <div className="flex items-center gap-3">
                    <button className="text-slate-500">
                      {expandedProducts.has(product.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-sm text-slate-500">
                        Base SKU: {product.baseSku || '—'} • {product.variants?.length || 0} variants
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Total stock</div>
                      <div className="font-medium">{getTotalStock(product)}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(product); }} className="p-1 text-indigo-600 hover:text-indigo-900 rounded hover:bg-indigo-50">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(product.id); }} className="p-1 text-rose-600 hover:text-rose-900 rounded hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variants list */}
                {expandedProducts.has(product.id) && (
                  <div className="bg-slate-50 border-t border-slate-200">
                    {product.variants?.map(variant => (
                      <div key={variant.id} className="px-4 py-3 border-b border-slate-200 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Variant: {variant.sku}</div>
                            <div className="text-sm text-slate-500">
                              {variant.color && `Color: ${variant.color}`}
                              {variant.color && variant.size && ' • '}
                              {variant.size && `Size: ${variant.size}`}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-sm text-slate-500">Cost</div>
                              <div className="font-medium">${typeof variant.costPrice === 'number' ? variant.costPrice.toFixed(2) : '0.00'}</div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-slate-500">Price</div>
                              <div className="font-medium">${typeof variant.sellingPrice === 'number' ? variant.sellingPrice.toFixed(2) : '0.00'}</div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-slate-500">Stock</div>
                              <div className="font-medium">{variant.quantity || 0}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border">Prev</button>
              <div className="px-3 py-1">{page} / {totalPages}</div>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border">Next</button>
            </div>
          </div>
        </>
      ))}

      {/* ProductForm modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div key="form-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">{editingProduct ? 'Edit product' : 'Add product'}</div>
                <button onClick={() => { setIsFormOpen(false); setEditingProduct(null); }} className="text-slate-500 hover:text-slate-800"><X className="w-5 h-5" /></button>
              </div>

              <ProductForm product={editingProduct} onSubmit={handleSubmit} onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }} />
            </motion.div>

            {/* backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop first (lower z) — clicking it closes the modal */}
            <motion.div
              onClick={() => setConfirmDelete(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Modal box (higher z so it's above the backdrop) */}
            <div className="relative z-50 w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-lg font-semibold mb-4">Confirm delete</div>
              <div className="text-sm text-slate-500 mb-6">Are you sure you want to delete this product? This will also delete all its variants. This action cannot be undone.</div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setConfirmDelete(null)} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="px-3 py-2 rounded bg-rose-600 text-white">Delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}