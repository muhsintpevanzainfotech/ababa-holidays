import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export const Lightbox = ({ lightbox, setLightbox }) => {
  if (!lightbox) return null;

  return (
    <div 
      onClick={() => setLightbox(null)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', cursor: 'zoom-out' }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
      >
        <img src={lightbox} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} alt="Fullscreen Preview" />
        <div style={{ padding: '20px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Document Preview</p>
          <button onClick={() => setLightbox(null)} style={{ padding: '8px 20px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Close Protocol</button>
        </div>
        <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};
