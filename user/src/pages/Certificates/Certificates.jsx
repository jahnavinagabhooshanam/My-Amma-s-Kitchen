import React, { useState } from 'react';
import './Certificates.css';
import PdfModal from '../../components/PdfModal';
import fssaiLogo from '../../assets/img/certificates/fssai.svg';
import gstLogo from '../../assets/img/certificates/gst.svg';

const Certificates = () => {
  const [openPdf, setOpenPdf] = useState(null);

  const certs = [
    {
      id: 'fssai',
      title: 'FSSAI Food License',
      desc: 'Certified food safety license issued by FSSAI.',
      img: fssaiLogo,
      file: '/certificates/fssai-license.pdf'
    },
    {
      id: 'gst',
      title: 'GST Registration Certificate',
      desc: 'Official GST registration certificate for the business.',
      img: gstLogo,
      file: '/certificates/gst-registration.pdf'
    }
  ];

  return (
    <div className="cert-page container">
      <div className="cert-hero">
        <h1>Business Certifications &amp; Registrations</h1>
        <p className="subtitle">View our official food safety and business registration certificates.</p>
      </div>

      <div className="cert-grid">
        {certs.map(c => (
          <div className="cert-card glass-card" key={c.id}>
            <div className="cert-badge"><img src={c.img} alt={c.title} /></div>
            <h3>{c.title} <span className="verified">✔ Verified</span></h3>
            <p className="cert-desc">{c.desc}</p>
            <div className="cert-actions">
              <button className="btn view" onClick={() => setOpenPdf(c)}>View Certificate</button>
              <a className="btn download" href={c.file} download target="_blank" rel="noreferrer">Download Certificate</a>
            </div>
          </div>
        ))}
      </div>

      {openPdf && (
        <PdfModal src={openPdf.file} title={openPdf.title} onClose={() => setOpenPdf(null)} />
      )}
    </div>
  );
};

export default Certificates;
