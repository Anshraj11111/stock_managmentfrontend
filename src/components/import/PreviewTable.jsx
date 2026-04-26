import { useState } from 'react';
import { FiCheck, FiAlertTriangle, FiX, FiEdit2 } from 'react-icons/fi';

const PreviewTable = ({ products, onProductsChange }) => {
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <FiCheck className="text-green-500" />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" />;
      case 'error':
        return <FiX className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ok: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || ''}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleEdit = (index) => {
    setEditingRow(index);
    setEditedData(products[index].data);
  };

  const handleSave = (index) => {
    const updatedProducts = [...products];
    updatedProducts[index].data = editedData;
    onProductsChange(updatedProducts);
    setEditingRow(null);
    setEditedData({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Product Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Purchase Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Selling Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stock Qty
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product, index) => (
            <tr key={index} className={`
              ${product.validation === 'error' ? 'bg-red-50 dark:bg-red-900/10' : ''}
              ${product.validation === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
            `}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {product.rowNumber}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(product.validation)}
                  {getStatusBadge(product.validation)}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {editingRow === index ? (
                  <input
                    type="text"
                    value={editedData.product_name || ''}
                    onChange={(e) => handleChange('product_name', e.target.value)}
                    className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                  />
                ) : (
                  <div>
                    <div>{product.data.product_name}</div>
                    {product.errors && product.errors.length > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {product.errors.join(', ')}
                      </div>
                    )}
                    {product.warnings && product.warnings.length > 0 && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        {product.warnings.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {editingRow === index ? (
                  <input
                    type="number"
                    value={editedData.purchase_price || ''}
                    onChange={(e) => handleChange('purchase_price', e.target.value)}
                    className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                  />
                ) : (
                  `₹${product.data.purchase_price}`
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {editingRow === index ? (
                  <input
                    type="number"
                    value={editedData.selling_price || ''}
                    onChange={(e) => handleChange('selling_price', e.target.value)}
                    className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                  />
                ) : (
                  `₹${product.data.selling_price}`
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {editingRow === index ? (
                  <input
                    type="text"
                    value={editedData.stock_quantity || ''}
                    onChange={(e) => handleChange('stock_quantity', e.target.value)}
                    className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                  />
                ) : (
                  product.data.stock_quantity
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {editingRow === index ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(index)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 flex items-center space-x-1"
                  >
                    <FiEdit2 size={16} />
                    <span>Edit</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewTable;
