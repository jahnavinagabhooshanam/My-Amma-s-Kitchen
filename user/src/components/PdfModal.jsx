import React, { useState } from 'react';
import './PdfModal.css';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfModal = ({ src, title, onClose }) => {
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPage(1);
  };

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal">
        <div className="pdf-modal-header">
          <h3>{title}</h3>
          <div className="pdf-controls">
            <button onClick={() => setScale(s => Math.min(3, s + 0.25))}>Zoom In</button>
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))}>Zoom Out</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <button onClick={() => setPage(p => Math.min(numPages || p, p + 1))}>Next</button>
            <a href={src} target="_blank" rel="noreferrer" className="btn-link">Open in New Tab</a>
            <a href={src} download className="btn-link">Download</a>
            <button onClick={onClose} className="close-btn">Close</button>
          </div>
        </div>
        <div className="pdf-modal-body">
          <Document file={src} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="loading">Loading PDF…</div>}>
            <Page pageNumber={page} scale={scale} />
          </Document>
        </div>
        <div className="pdf-modal-footer">Page {page} of {numPages || '?'}</div>
      </div>
    </div>
  );
};

export default PdfModal;
