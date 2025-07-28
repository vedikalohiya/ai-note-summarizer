// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Summarizer from "./components/Summarizer.jsx";
import HistoryPage from "./components/HistoryPage.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Summarizer />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </>
  );
}

export default App;
