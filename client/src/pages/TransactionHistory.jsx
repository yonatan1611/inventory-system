import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions')
      .then(res => setTransactions(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Type</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.type}</td>
              <td>{tx.product?.name || tx.productId}</td>
              <td>{tx.quantity}</td>
              <td>{new Date(tx.date).toLocaleString()}</td>
              <td>{tx.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;