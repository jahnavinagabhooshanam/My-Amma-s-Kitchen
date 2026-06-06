import React, { useState } from 'react';
import './PdfModal.css';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfModal = ({ src, title, onClose }) => {
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPage(1);
  };

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal" onClick={e => e.stopPropagation()}>
        <button className="close-x-btn" onClick={onClose}>&times;</button>
        <div className="pdf-modal-header">
          <h3>{title}</h3>
          <div className="pdf-controls">
            <button onClick={() => setScale(s => Math.min(3, s + 0.25))} title="Zoom In"><i className="fa-regular fa-magnifying-glass-plus"></i> Zoom</button>
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} title="Zoom Out"><i className="fa-regular fa-magnifying-glass-minus"></i> Zoom</button>
            {numPages > 1 && (
              <>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}><i className="fa-regular fa-chevron-left"></i> Prev</button>
                <button onClick={() => setPage(p => Math.min(numPages || p, p + 1))} disabled={page >= numPages}>Next <i className="fa-regular fa-chevron-right"></i></button>
              </>
            )}
            <a href={src} target="_blank" rel="noreferrer" className="btn-link"><i className="fa-regular fa-arrow-up-right-from-square"></i> Open</a>
            <a href={src} download className="btn-link"><i className="fa-regular fa-download"></i> Download</a>
          </div>
        </div>
        <div className="pdf-modal-body">
          <Document file={src} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="loading">Loading PDF…</div>}>
            <Page pageNumber={page} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        </div>
        {numPages > 1 && (
          <div className="pdf-modal-footer">Page {page} of {numPages}</div>
        )}
      </div>
    </div>
  );
};

export default PdfModal;
