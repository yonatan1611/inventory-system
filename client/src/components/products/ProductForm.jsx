import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    baseSku: '',
    variants: [
      {
        sku: '',
        color: '',
        size: '',
        costPrice: '',
        sellingPrice: '',
        quantity: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        baseSku: product.baseSku || '',
        variants: product.variants?.length > 0 
          ? product.variants.map(v => ({
              id: v.id,
              sku: v.sku || '',
              color: v.color || '',
              size: v.size || '',
              costPrice: v.costPrice || '',
              sellingPrice: v.sellingPrice || '',
              quantity: v.quantity || ''
            }))
          : [
              {
                sku: '',
                color: '',
                size: '',
                costPrice: '',
                sellingPrice: '',
                quantity: ''
              }
            ]
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
    
    // Clear error when user starts typing
    if (errors[`variant-${index}-${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`variant-${index}-${field}`];
        return newErrors;
      });
    }
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: '',
          color: '',
          size: '',
          costPrice: '',
          sellingPrice: '',
          quantity: ''
        }
      ]
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Product validation
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    //if (!formData.baseSku.trim()) newErrors.baseSku = 'Base SKU is required';
    
    // Variants validation
    formData.variants.forEach((variant, index) => {
      //if (!variant.sku.trim()) newErrors[`variant-${index}-sku`] = 'Variant SKU is required';
      if (!variant.costPrice || parseFloat(variant.costPrice) <= 0) 
        newErrors[`variant-${index}-costPrice`] = 'Valid cost price is required';
      if (!variant.sellingPrice || parseFloat(variant.sellingPrice) <= 0) 
        newErrors[`variant-${index}-sellingPrice`] = 'Valid selling price is required';
      if (parseFloat(variant.sellingPrice) < parseFloat(variant.costPrice))
        newErrors[`variant-${index}-sellingPrice`] = 'Selling price must be greater than cost price';
      if (!variant.quantity || parseInt(variant.quantity) < 0) 
        newErrors[`variant-${index}-quantity`] = 'Valid quantity is required';
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Format numeric values before submitting
      const formattedData = {
        ...formData,
        variants: formData.variants.map(variant => ({
          ...variant,
          costPrice: parseFloat(variant.costPrice),
          sellingPrice: parseFloat(variant.sellingPrice),
          quantity: parseInt(variant.quantity),
          // Remove id if it's a new variant
          ...(variant.id ? { id: variant.id } : {})
        }))
      };
      
      onSubmit(formattedData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Product Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>
            
            {/* Right Column - Product Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </div>
          
          {/* Variants Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Product Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>
            
            {formData.variants.map((variant, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 relative">
                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Color"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Size"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.costPrice}
                      onChange={(e) => handleVariantChange(index, 'costPrice', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        errors[`variant-${index}-costPrice`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors[`variant-${index}-costPrice`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`variant-${index}-costPrice`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.sellingPrice}
                      onChange={(e) => handleVariantChange(index, 'sellingPrice', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        errors[`variant-${index}-sellingPrice`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors[`variant-${index}-sellingPrice`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`variant-${index}-sellingPrice`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.quantity}
                      onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        errors[`variant-${index}-quantity`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors[`variant-${index}-quantity`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`variant-${index}-quantity`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;