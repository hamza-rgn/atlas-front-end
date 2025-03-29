import React from "react";
import "./DataTable.css";

const DataTable = ({ title, data }) => {
  return (
    <div className="card"> {/* Using your existing card class */}
      <div className="table-header">
        <h2 className="page-title">{title}</h2>
        <button className="create-btn">
          <i className="fas fa-plus"></i> Create
        </button>
      </div>
      <div className="table-responsive"> {/* Using your existing responsive wrapper */}
        <table className="table"> {/* Using your existing table class */}
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>
                  <button className="edit-btn">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="delete-btn">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;