import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  totalItems
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-main)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Show</span>
        <select 
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '13px' }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          of {totalItems} entries
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{ 
            padding: '6px', 
            borderRadius: '8px', 
            border: '1px solid var(--border)', 
            background: 'var(--bg-card)', 
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-primary)'
          }}
        >
          <ChevronLeft size={16} />
        </button>
        
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Page {currentPage} of {totalPages || 1}
        </span>

        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          style={{ 
            padding: '6px', 
            borderRadius: '8px', 
            border: '1px solid var(--border)', 
            background: 'var(--bg-card)', 
            cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages || totalPages === 0 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-primary)'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
