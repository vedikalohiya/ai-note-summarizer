import React, { useEffect, useState } from "react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("summaryHistory")) || [];
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("summaryHistory");
    setHistory([]);
  };

  return (
    <div className="history-page" style={{ maxWidth: "800px", margin: "auto", padding: "1rem" }}>
      <h2>📜 Summary History</h2>
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <>
          <button onClick={clearHistory} style={{ marginBottom: "1rem", backgroundColor: "#e91e63", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
            Clear History
          </button>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((entry, index) => (
              <li key={index} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: "#fafafa" }}>
                <div style={{ fontSize: "0.85rem", color: "#555" }}>{entry.date}</div>
                <strong>Note:</strong>
                <p>{entry.note}</p>
                <strong>Summary:</strong>
                <p>{entry.summary}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HistoryPage;
