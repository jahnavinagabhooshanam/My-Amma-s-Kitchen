import React, { useState } from 'react';

const DataTables = ({ headers, data, renderRow, searchPlaceholder }) => {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(item => {
    const itemString = JSON.stringify(item).toLowerCase();
    return itemString.includes(search.toLowerCase());
  });

  return (
    <div className="premium-card">
      <div className="premium-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div className="premium-card-title">
          <i className="fa-solid fa-list-check"></i>
          <h3>Overview Data</h3>
        </div>
        <div className="navbar-search" style={{ margin: 0, width: '280px', border: '1px solid #EAE6DB', borderRadius: '10px' }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder={searchPlaceholder || "Search table list..."} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
        <table className="responsive-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center text-muted" style={{ padding: '30px' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTables;
