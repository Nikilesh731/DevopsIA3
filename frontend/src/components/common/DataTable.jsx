import React from 'react';

const DataTable = ({ columns, data, emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-title">No Data</div>
          <div className="empty-state-message">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
