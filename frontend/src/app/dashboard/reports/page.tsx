'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Sales data state
  const [salesData, setSalesData] = useState({
    monthlySales: [
      { month: 'Jan', sales: 1200 },
      { month: 'Feb', sales: 1900 },
      { month: 'Mar', sales: 1500 },
      { month: 'Apr', sales: 2100 },
      { month: 'May', sales: 1800 },
      { month: 'Jun', sales: 2400 }
    ],
    topProducts: [
      { name: 'Smartphone X', sales: 32, revenue: 22399.68 },
      { name: 'Wireless Headphones', sales: 28, revenue: 4199.72 },
      { name: 'Premium T-Shirt', sales: 45, revenue: 1349.55 },
      { name: 'Smart Watch Pro', sales: 18, revenue: 4499.82 }
    ],
    categorySales: [
      { category: 'Electronics', sales: 54399.22 },
      { category: 'Clothing', sales: 12499.85 },
      { category: 'Food', sales: 8749.90 },
      { category: 'Home', sales: 15299.80 }
    ],
    summary: {
      totalSales: 90948.77,
      totalOrders: 223,
      averageOrderValue: 407.84,
      conversionRate: 3.8,
      totalItemsSold: 512
    }
  });

  useEffect(() => {
    // Redirect if not authenticated or not a seller/admin
    if (!isLoading && (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin'))) {
      router.push('/login');
    } else {
      fetchReportData();
    }
  }, [isAuthenticated, user, router, isLoading]);

  const fetchReportData = async () => {
    try {
      // In a real app, we would fetch data from the API based on the timeRange
      // const response = await api.get(`/reports/sales?timeRange=${timeRange}`);
      // setSalesData(response.data);
      
      // For now, we'll simulate different data for different time ranges
      if (timeRange === 'last90days') {
        setSalesData({
          monthlySales: [
            { month: 'Jan', sales: 1200 },
            { month: 'Feb', sales: 1900 },
            { month: 'Mar', sales: 1500 },
            { month: 'Apr', sales: 2100 },
            { month: 'May', sales: 1800 },
            { month: 'Jun', sales: 2400 }
          ],
          topProducts: [
            { name: 'Smartphone X', sales: 62, revenue: 43399.38 },
            { name: 'Wireless Headphones', sales: 58, revenue: 8699.42 },
            { name: 'Premium T-Shirt', sales: 85, revenue: 2549.15 },
            { name: 'Smart Watch Pro', sales: 38, revenue: 9499.62 }
          ],
          categorySales: [
            { category: 'Electronics', sales: 94399.22 },
            { category: 'Clothing', sales: 22499.85 },
            { category: 'Food', sales: 18749.90 },
            { category: 'Home', sales: 25299.80 }
          ],
          summary: {
            totalSales: 160948.77,
            totalOrders: 423,
            averageOrderValue: 380.49,
            conversionRate: 3.5,
            totalItemsSold: 912
          }
        });
      } else if (timeRange === 'lastyear') {
        setSalesData({
          monthlySales: [
            { month: 'Jan', sales: 4200 },
            { month: 'Feb', sales: 3900 },
            { month: 'Mar', sales: 4500 },
            { month: 'Apr', sales: 5100 },
            { month: 'May', sales: 4800 },
            { month: 'Jun', sales: 5400 },
            { month: 'Jul', sales: 6200 },
            { month: 'Aug', sales: 5900 },
            { month: 'Sep', sales: 6500 },
            { month: 'Oct', sales: 7100 },
            { month: 'Nov', sales: 7800 },
            { month: 'Dec', sales: 8400 }
          ],
          topProducts: [
            { name: 'Smartphone X', sales: 232, revenue: 162399.68 },
            { name: 'Wireless Headphones', sales: 198, revenue: 29699.02 },
            { name: 'Premium T-Shirt', sales: 345, revenue: 10349.55 },
            { name: 'Smart Watch Pro', sales: 178, revenue: 44499.22 }
          ],
          categorySales: [
            { category: 'Electronics', sales: 354399.22 },
            { category: 'Clothing', sales: 112499.85 },
            { category: 'Food', sales: 88749.90 },
            { category: 'Home', sales: 115299.80 }
          ],
          summary: {
            totalSales: 670948.77,
            totalOrders: 1823,
            averageOrderValue: 368.05,
            conversionRate: 3.2,
            totalItemsSold: 3512
          }
        });
      } else {
        // Default to last30days
        setSalesData({
          monthlySales: [
            { month: 'Jan', sales: 1200 },
            { month: 'Feb', sales: 1900 },
            { month: 'Mar', sales: 1500 },
            { month: 'Apr', sales: 2100 },
            { month: 'May', sales: 1800 },
            { month: 'Jun', sales: 2400 }
          ],
          topProducts: [
            { name: 'Smartphone X', sales: 32, revenue: 22399.68 },
            { name: 'Wireless Headphones', sales: 28, revenue: 4199.72 },
            { name: 'Premium T-Shirt', sales: 45, revenue: 1349.55 },
            { name: 'Smart Watch Pro', sales: 18, revenue: 4499.82 }
          ],
          categorySales: [
            { category: 'Electronics', sales: 54399.22 },
            { category: 'Clothing', sales: 12499.85 },
            { category: 'Food', sales: 8749.90 },
            { category: 'Home', sales: 15299.80 }
          ],
          summary: {
            totalSales: 90948.77,
            totalOrders: 223,
            averageOrderValue: 407.84,
            conversionRate: 3.8,
            totalItemsSold: 512
          }
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load sales report data');
      setIsLoading(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
    setIsLoading(true);
  };

  useEffect(() => {
    if (!isLoading) {
      fetchReportData();
    }
  }, [timeRange]);

  // Prepare chart data
  const monthlySalesChartData = {
    labels: salesData.monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Sales ($)',
        data: salesData.monthlySales.map(item => item.sales),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categorySalesChartData = {
    labels: salesData.categorySales.map(item => item.category),
    datasets: [
      {
        label: 'Sales by Category ($)',
        data: salesData.categorySales.map(item => item.sales),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Export report functionality
  const exportReport = () => {
    try {
      // Create CSV content for summary
      let csvContent = "Sales Report Summary\n";
      csvContent += `Time Period,${timeRange === 'last30days' ? 'Last 30 Days' : timeRange === 'last90days' ? 'Last 90 Days' : 'Last Year'}\n\n`;
      
      // Add summary section
      csvContent += "SUMMARY\n";
      csvContent += `Total Sales,$${salesData.summary.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      csvContent += `Total Orders,${salesData.summary.totalOrders}\n`;
      csvContent += `Average Order Value,$${salesData.summary.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      csvContent += `Conversion Rate,${salesData.summary.conversionRate}%\n`;
      csvContent += `Total Items Sold,${salesData.summary.totalItemsSold}\n\n`;
      
      // Add monthly sales section
      csvContent += "MONTHLY SALES\n";
      csvContent += "Month,Sales\n";
      salesData.monthlySales.forEach(item => {
        csvContent += `${item.month},$${item.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      });
      csvContent += "\n";
      
      // Add top products section
      csvContent += "TOP PRODUCTS\n";
      csvContent += "Product,Units Sold,Revenue\n";
      salesData.topProducts.forEach(product => {
        csvContent += `"${product.name}",${product.sales},$${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      });
      csvContent += "\n";
      
      // Add category sales section
      csvContent += "SALES BY CATEGORY\n";
      csvContent += "Category,Revenue,% of Total\n";
      salesData.categorySales.forEach(category => {
        const percentage = ((category.sales / salesData.summary.totalSales) * 100).toFixed(1);
        csvContent += `${category.category},$${category.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })},${percentage}%\n`;
      });
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Sales report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export sales report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Access Required</h2>
          <p className="text-gray-800 font-medium mb-6">You need to be logged in as a seller or admin to access this page.</p>
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
    <div className="container mx-auto px-4 py-8 relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black font-medium bg-white appearance-none pr-8"
            value={timeRange}
            onChange={handleTimeRangeChange}
            style={{ color: 'black' }}
          >
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="lastyear">Last Year</option>
          </select>
          <div className="relative" style={{ marginLeft: '-30px', pointerEvents: 'none' }}>
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center" onClick={exportReport}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-gray-700 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-900">${salesData.summary.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
          <h3 className="text-lg font-bold text-gray-700 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{salesData.summary.totalOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
          <h3 className="text-lg font-bold text-gray-700 mb-2">Avg. Order Value</h3>
          <p className="text-3xl font-bold text-gray-900">${salesData.summary.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-600">
          <h3 className="text-lg font-bold text-gray-700 mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{salesData.summary.conversionRate}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
          <h3 className="text-lg font-bold text-gray-700 mb-2">Items Sold</h3>
          <p className="text-3xl font-bold text-gray-900">{salesData.summary.totalItemsSold}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Monthly Sales</h3>
          <div className="h-80">
            <Bar data={monthlySalesChartData} options={chartOptions} />
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Sales by Category */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Sales by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80">
            <Pie data={categorySalesChartData} options={chartOptions} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.categorySales.map((category, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {category.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${category.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {((category.sales / salesData.summary.totalSales) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
