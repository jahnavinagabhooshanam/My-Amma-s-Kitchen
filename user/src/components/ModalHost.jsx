import React, { useEffect, useState } from 'react';
import PdfModal from './PdfModal';

const ModalHost = () => {
  const [pdf, setPdf] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      if (detail.file) setPdf(detail);
    };
    window.addEventListener('open-pdf', handler);
    return () => window.removeEventListener('open-pdf', handler);
  }, []);

  return (
    <>{pdf && <PdfModal src={pdf.file} title={pdf.title || 'Certificate'} onClose={() => setPdf(null)} />}</>
  );
};

export default ModalHost;
