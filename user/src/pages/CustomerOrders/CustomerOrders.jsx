import React from 'react';
import { Package, Eye, Clock, Calendar } from 'lucide-react';

const MOCK_ORDERS = [
  { id: 'ORD-9419', date: 'May 28, 2026', products: '1x Premium Mini Tiffin, 1x Ragi Batter 1kg', amount: 274.00, status: 'Completed' },
  { id: 'ORD-9412', date: 'May 15, 2026', products: '2x Mysore Masala Dosa, 1x Filter Coffee', amount: 377.00, status: 'Completed' }
];

const CustomerOrders = () => {
  return (
    <div className="orders-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <div className="container">
        
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">Order History</span>
          <h1 className="sec-title" style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            My Orders
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            Review, track, or reorder item mixtures from your current and previous breakfasts.
          </p>
        </div>

        <div className="row gy-4 justify-content-center">
          <div className="col-lg-10">
            {MOCK_ORDERS.length === 0 ? (
              <div className="card text-center" style={{ padding: '60px 30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <Package size={56} style={{ color: 'var(--primary-color)', margin: '0 auto', opacity: 0.3 }} />
                <h3 className="title-md" style={{ color: 'var(--primary-dark)', marginTop: '20px' }}>No Orders Found</h3>
                <p className="text-muted" style={{ marginTop: '12px' }}>
                  Looks like you haven't placed any orders yet. Try one of Amma's specialty breakfast items today!
                </p>
              </div>
            ) : (
              <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Items Purchased</th>
                        <th>Amount Paid</th>
                        <th>Status</th>
                        <th className="text-end">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ORDERS.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: '700' }}>#{order.id}</td>
                          <td>
                            <div className="flex gap-1" style={{ alignItems: 'center', fontSize: '13px' }}>
                              <Calendar size={13} className="text-muted" /> {order.date}
                            </div>
                          </td>
                          <td style={{ fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.products}
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>₹{order.amount.toFixed(2)}</td>
                          <td>
                            <span className="status-badge status-delivered" style={{ padding: '4px 10px', fontSize: '11px' }}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <button className="icon-btn text-primary" style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} title="View details">
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerOrders;
