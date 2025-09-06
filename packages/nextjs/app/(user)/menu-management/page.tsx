"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { apiService } from '~~/services/api';
import BackArrow from '~~/components/BackArrow';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Bars3Icon
} from '@heroicons/react/20/solid';

interface MenuItem {
  id: string;
  item_id: string;
  name: string;
  description: string;
  price_ghs: number;
  category: string;
  image_url: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface MenuFormData {
  item_id: string;
  name: string;
  description: string;
  price_ghs: string;
  category: string;
  image_url: string;
  is_available: boolean;
  sort_order: string;
}

const menuCategories = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
  'Sides',
  'Specials',
  'Other'
];

const MenuManagementPage = () => {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    item_id: '',
    name: '',
    description: '',
    price_ghs: '',
    category: '',
    image_url: '',
    is_available: true,
    sort_order: '0'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clerkLoaded && !clerkUser) {
      router.push('/sign-in');
    }
  }, [clerkLoaded, clerkUser, router]);

  useEffect(() => {
    if (clerkUser) {
      fetchMenuItems();
    }
  }, [clerkUser]);

  const fetchMenuItems = async () => {
    if (!clerkUser) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      apiService.setAuthToken(token);

      const response = await apiService.get('/menu');
      if (response.data.success) {
        setMenuItems(response.data.data.menuItems);
      }
    } catch (err: any) {
      console.error('Failed to fetch menu items:', err);
      setError(err.response?.data?.error?.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MenuFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      item_id: '',
      name: '',
      description: '',
      price_ghs: '',
      category: '',
      image_url: '',
      is_available: true,
      sort_order: '0'
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser) return;

    setSaving(true);
    setError(null);

    try {
      const token = await getToken();
      apiService.setAuthToken(token);

      const submitData = {
        ...formData,
        price_ghs: parseFloat(formData.price_ghs),
        sort_order: parseInt(formData.sort_order)
      };

      if (editingItem) {
        // Update existing item
        const response = await apiService.put(`/menu/${editingItem.id}`, submitData);
        if (response.data.success) {
          await fetchMenuItems();
          resetForm();
        }
      } else {
        // Create new item
        const response = await apiService.post('/menu', submitData);
        if (response.data.success) {
          await fetchMenuItems();
          resetForm();
        }
      }
    } catch (err: any) {
      console.error('Failed to save menu item:', err);
      setError(err.response?.data?.error?.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      item_id: item.item_id,
      name: item.name,
      description: item.description,
      price_ghs: item.price_ghs.toString(),
      category: item.category,
      image_url: item.image_url || '',
      is_available: item.is_available,
      sort_order: item.sort_order.toString()
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!clerkUser || !confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const token = await getToken();
      apiService.setAuthToken(token);

      const response = await apiService.delete(`/menu/${itemId}`);
      if (response.data.success) {
        await fetchMenuItems();
      }
    } catch (err: any) {
      console.error('Failed to delete menu item:', err);
      setError(err.response?.data?.error?.message || 'Failed to delete menu item');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    if (!clerkUser) return;

    try {
      const token = await getToken();
      apiService.setAuthToken(token);

      const response = await apiService.put(`/menu/${item.id}`, {
        is_available: !item.is_available
      });
      
      if (response.data.success) {
        await fetchMenuItems();
      }
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
      setError(err.response?.data?.error?.message || 'Failed to update availability');
    }
  };

  if (!clerkLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clerkUser) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <BackArrow />
      
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Menu Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your restaurant menu items
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Item</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-8 bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item ID *
                  </label>
                  <input
                    type="text"
                    value={formData.item_id}
                    onChange={(e) => handleInputChange('item_id', e.target.value)}
                    placeholder="e.g., WAKE-001"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Jollof Rice"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (GHS) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_ghs}
                    onChange={(e) => handleInputChange('price_ghs', e.target.value)}
                    placeholder="25.00"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {menuCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => handleInputChange('sort_order', e.target.value)}
                    placeholder="0"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your menu item..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => handleInputChange('is_available', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Available for order</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No menu items yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first menu item
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      ID: {item.item_id}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₵{item.price_ghs}
                      </span>
                      {item.category && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_available 
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {item.is_available ? (
                        <EyeIcon className="h-4 w-4" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.image_url && (
                  <div className="mb-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Order: {item.sort_order}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagementPage;
