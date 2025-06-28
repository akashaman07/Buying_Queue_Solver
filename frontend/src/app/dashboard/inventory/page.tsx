'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';

// Define product type
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  status: string;
  barcode: string;
}

export default function InventoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/login');
    } else {
      fetchProducts();
    }
  }, [isAuthenticated, user, router, isLoading]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // In a production app, we would fetch from the API
      // const response = await productsAPI.getAllProducts();
      // setProducts(response.data);
      
      // Using mock data for now
      const mockProducts: Product[] = [
    {
      id: 'PRD001',
      name: 'Smartphone X',
      category: 'Electronics',
      price: 699.99,
      stock: 15,
      sku: 'ELEC-SP-001',
          status: 'In Stock',
          barcode: '1234567890123'
    },
    {
      id: 'PRD002',
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 149.99,
      stock: 8,
      sku: 'ELEC-WH-002',
          status: 'In Stock',
          barcode: '2345678901234'
    },
    {
      id: 'PRD003',
      name: 'Premium T-Shirt',
      category: 'Clothing',
      price: 29.99,
      stock: 25,
      sku: 'CLOTH-TS-003',
          status: 'In Stock',
          barcode: '3456789012345'
    },
    {
      id: 'PRD004',
      name: 'Organic Bananas',
      category: 'Food',
      price: 4.99,
      stock: 3,
      sku: 'FOOD-FR-004',
          status: 'Low Stock',
          barcode: '4567890123456'
    },
    {
      id: 'PRD005',
      name: 'Smart Watch Pro',
      category: 'Electronics',
      price: 249.99,
      stock: 0,
      sku: 'ELEC-SW-005',
          status: 'Out of Stock',
          barcode: '5678901234567'
        }
      ];
      
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    applyFilters();
  };

  const applyFilters = () => {
    let result = [...products];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(product => product.status === statusFilter);
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleBarcodeDetected = (barcode: string) => {
    setShowScanner(false);
    setSearchTerm(barcode);
    applyFilters();
    toast.success(`Barcode detected: ${barcode}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // In a production app, we would call the API
        // await productsAPI.deleteProduct(id);
        
        // For now, just update the local state
        const updatedProducts = products.filter(product => product.id !== id);
        setProducts(updatedProducts);
        setFilteredProducts(filteredProducts.filter(product => product.id !== id));
        
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: '',
    sku: ''
  });

  const handleEdit = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setEditingProduct(product);
      setEditForm({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        status: product.status,
        sku: product.sku
      });
      setIsEditModalOpen(true);
    }
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    try {
      // In a production app, we would call the API
      // await productsAPI.updateProduct(editingProduct.id, editForm);
      
      // For now, just update the local state
      const updatedProducts = products.map(product => 
        product.id === editingProduct.id ? {
          ...product,
          name: editForm.name,
          category: editForm.category,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock),
          status: editForm.status,
          sku: editForm.sku
        } : product
      );
      
      setProducts(updatedProducts);
      applyFilters(); // Re-apply filters to update filtered products
      
      toast.success('Product updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Export to CSV function
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Product ID', 'Name', 'Category', 'Price', 'Stock', 'SKU', 'Status', 'Barcode'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`, // Add quotes to handle commas in names
        product.category,
        product.price,
        product.stock,
        product.sku,
        product.status,
        product.barcode || ''
      ].join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Inventory exported to CSV successfully');
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Seller Access Required</h2>
          <p className="text-gray-800 font-medium mb-6">You need to be logged in as a seller to access this page.</p>
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/products/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Product
          </Link>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Search products..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full text-black font-medium bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            onClick={handleSearch}
          >
            Search
          </button>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium flex items-center"
            onClick={() => setShowScanner(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
            </svg>
            Scan
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-black appearance-none pr-8"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
            <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
          </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <div className="relative">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-black appearance-none pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
            <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
          </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {showScanner && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Scan Product Barcode</h2>
            <button 
              onClick={() => setShowScanner(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <BarcodeScanner onDetected={handleBarcodeDetected} />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Product ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                      ${product.status === 'In Stock' ? 'bg-green-100 text-green-800 border border-green-200' : 
                        product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => handleEdit(product.id)}
                      >
                      Edit
                    </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(product.id)}
                      >
                      Delete
                    </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found matching the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 border-t border-b ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-auto">
            <div className="flex justify-between items-center border-b p-6 bg-gray-200 rounded-t-lg">
              <h3 className="text-xl font-bold text-black">Edit Product</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-black hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-black mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditFormChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-black mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditFormChange}
                    step="0.01"
                    min="0"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-black mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={editForm.stock}
                    onChange={handleEditFormChange}
                    min="0"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-black mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={editForm.sku}
                    onChange={handleEditFormChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-black mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center mt-6">
                <div className="flex items-center text-black">
                  <span className="font-medium mr-2">Product ID:</span>
                  <span>{editingProduct.id}</span>
                </div>
                {editingProduct.barcode && (
                  <div className="flex items-center text-black ml-6">
                    <span className="font-medium mr-2">Barcode:</span>
                    <span>{editingProduct.barcode}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t p-6 flex justify-end space-x-2 bg-gray-200 rounded-b-lg">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 font-medium"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
