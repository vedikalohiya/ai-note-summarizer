import React, { useState } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import '../App.css';

// ✅ Set the worker source directly from CDN (NO separate pdfWorker.js needed)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const Summarizer = () => {
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setNote(event.target.result);
      reader.readAsText(file);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setError('');
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
          }
          setNote(text);
        } catch (err) {
          setError('Failed to extract text from PDF: ' + (err.message || err.toString()));
          console.error('PDF extraction error:', err);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSummarize = async () => {
    if (!note.trim()) {
      setError('Please enter a note to summarize.');
      setSummary('');
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
    const res = await axios.post("https://ai-note-summarizer-j416.onrender.com/api/summarize", { note });

      setSummary(res.data.summary);

      const history = JSON.parse(localStorage.getItem("summaryHistory")) || [];
      const newEntry = {
        note,
        summary: res.data.summary,
        date: new Date().toLocaleString()
      };
      localStorage.setItem("summaryHistory", JSON.stringify([newEntry, ...history]));
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      const extraDetails = err.response?.data?.details;
      setError(extraDetails ? `${errMsg}: ${JSON.stringify(extraDetails)}` : errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summarizer-card">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
        <div className="custom-upload-btn">
          <input type="file" accept=".txt" style={{ display: 'none' }} id="upload-txt" onChange={handleTextUpload} />
          <button type="button" onClick={() => document.getElementById('upload-txt').click()}>
            Upload Text
          </button>
        </div>
        <div className="custom-upload-btn">
          <input type="file" accept=".pdf" style={{ display: 'none' }} id="upload-pdf" onChange={handlePdfUpload} />
          <button type="button" onClick={() => document.getElementById('upload-pdf').click()}>
            Upload PDF
          </button>
        </div>
      </div>

      <h2>AI Note Summarizer</h2>
      <textarea
        rows="6"
        placeholder="Enter your notes here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={loading}
      ></textarea>
      <button onClick={handleSummarize} disabled={loading || !note.trim()}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>

      {error && (
        <div className="mt-4 p-3 border rounded bg-red-100 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {summary && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <strong>Summary:</strong>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
