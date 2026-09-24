import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  X,
  ExternalLink,
  Smartphone,
  Hash
} from 'lucide-react';
import { 
  fetchBrandsRequest, 
  addBrandRequest, 
  updateBrandRequest, 
  deleteBrandRequest 
} from '../store/slices/brandsSlice';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { getImageUrl } from '../utils/constants';
import Drawer from '../components/Drawer';
import FormSelect from '../components/FormSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Brands = ({ userRole = 'Admin' }) => {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const { vendors } = useSelector((state) => state.vendors);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentBrand, setCurrentBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vendor: '',
    status: 'Active',
    socialMedia: [
      { title: 'Instagram', icon: 'instagram', link: '' },
      { title: 'Facebook', icon: 'facebook', link: '' },
      { title: 'Twitter', icon: 'twitter', link: '' },
      { title: 'LinkedIn', icon: 'linkedin', link: '' },
      { title: 'YouTube', icon: 'youtube', link: '' }
    ],
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });

  useEffect(() => {
    dispatch(fetchBrandsRequest(userRole));
    if (userRole === 'Admin') {
      dispatch(fetchVendorsRequest());
    }
  }, [dispatch, userRole]);

  const handleOpenModal = (type, brand = null) => {
    setModalType(type);
    if (type === 'edit' && brand) {
      setCurrentBrand(brand);
      setFormData({
        title: brand.title || '',
        description: brand.description || '',
        vendor: brand.vendor?._id || brand.vendor || '',
        status: brand.status || 'Active',
        socialMedia: brand.socialMedia && brand.socialMedia.length > 0 ? brand.socialMedia : [
          { title: 'Instagram', icon: 'instagram', link: '' },
          { title: 'Facebook', icon: 'facebook', link: '' },
          { title: 'Twitter', icon: 'twitter', link: '' },
          { title: 'LinkedIn', icon: 'linkedin', link: '' },
          { title: 'YouTube', icon: 'youtube', link: '' }
        ],
        seo: {
          title: brand.seo?.title || '',
          description: brand.seo?.description || '',
          keywords: brand.seo?.keywords?.join(', ') || ''
        }
      });
    } else {
      setFormData({
        title: '',
        description: '',
        vendor: '',
        status: 'Active',
        socialMedia: [
          { title: 'Instagram', icon: 'instagram', link: '' },
          { title: 'Facebook', icon: 'facebook', link: '' },
          { title: 'Twitter', icon: 'twitter', link: '' },
          { title: 'LinkedIn', icon: 'linkedin', link: '' },
          { title: 'YouTube', icon: 'youtube', link: '' }
        ],
        seo: {
          title: '',
          description: '',
          keywords: ''
        }
      });
    }
    setShowModal(true);
  };

  const handleSocialChange = (index, value) => {
    const updatedSocial = [...formData.socialMedia];
    updatedSocial[index].link = value;
    setFormData({ ...formData, socialMedia: updatedSocial });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      seo: {
        ...formData.seo,
        keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
      }
    };

    if (modalType === 'add') {
      dispatch(addBrandRequest(payload));
      showToast('Success', 'Brand added successfully', 'success');
    } else {
      dispatch(updateBrandRequest({ id: currentBrand._id, data: payload }));
      showToast('Success', 'Brand updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm('Delete Brand?', 'This will remove the brand and its social media links.');
    if (isConfirmed) {
      dispatch(deleteBrandRequest(id));
      showToast('Deleted', 'Brand has been removed', 'success');
    }
  };

  const filteredBrands = brands.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSocialIcon = (icon) => {
    switch (icon.toLowerCase()) {
      case 'instagram': return <Instagram size={16} />;
      case 'facebook': return <Facebook size={16} />;
      case 'twitter': return <Twitter size={16} />;
      case 'linkedin': return <Linkedin size={16} />;
      case 'youtube': return <Youtube size={16} />;
      default: return <Globe size={16} />;
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Social Brands</h1>
          <p>Manage website branding and social media profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add New Brand
        </button>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by brand name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading brands...</p>
      ) : filteredBrands.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Globe size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No brands found. Create one to manage social links.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredBrands.map((brand) => (
            <div key={brand._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                 <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{brand.title}</h3>
                    <span className={`badge ${brand.status === 'Active' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '10px' }}>{brand.status}</span>
                 </div>
                 <div className="action-group">
                    <button className="action-btn" onClick={() => handleOpenModal('edit', brand)}><Edit size={16} /></button>
                    <button className="action-btn danger" onClick={() => handleDelete(brand._id)}><Trash2 size={16} /></button>
                 </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>{brand.description || 'No description provided.'}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                 {brand.socialMedia?.filter(sm => sm.link).map((sm, i) => (
                    <a key={i} href={sm.link} target="_blank" rel="noreferrer" title={sm.title} 
                       style={{ 
                         width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-main)', 
                         display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                         transition: 'all 0.2s'
                       }}
                       onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                       onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
                    >
                       {getSocialIcon(sm.icon)}
                    </a>
                 ))}
                 {(!brand.socialMedia || brand.socialMedia.filter(sm => sm.link).length === 0) && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No social links added</span>
                 )}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                 {userRole === 'Admin' ? `Assigned to: ${brand.vendor?.name || 'Admin'}` : 'Website Brand Profile'}
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer 
        isOpen={showModal} onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add New Social Brand' : 'Edit Brand Profile'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Brand Title / Label</label>
            <input type="text" className="form-control" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Main Website Socials" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" style={{ height: '80px' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Internal notes or public description..." />
          </div>

          <div style={{ marginBottom: '24px' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} color="var(--primary)" /> Social Media Links
             </h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.socialMedia.map((sm, index) => (
                  <div key={index} className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getSocialIcon(sm.icon)}
                       </div>
                       <input 
                         type="url" 
                         className="form-control" 
                         placeholder={`${sm.title} URL (https://...)`} 
                         value={sm.link} 
                         onChange={(e) => handleSocialChange(index, e.target.value)} 
                       />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {userRole === 'Admin' && (
            <div className="form-group">
              <FormSelect 
                label="Assign to Vendor (Optional)"
                options={vendors.map(v => ({ value: v._id, label: v.name }))}
                value={formData.vendor}
                onChange={(val) => setFormData({...formData, vendor: val})}
              />
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LinkIcon size={18} color="var(--primary)" /> SEO Settings
             </h4>
             <div className="form-group">
                <label style={{ fontSize: '12px' }}>SEO Title</label>
                <input type="text" className="form-control" value={formData.seo.title} onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})} />
             </div>
             <div className="form-group">
                <label style={{ fontSize: '12px' }}>SEO Keywords (Comma separated)</label>
                <input type="text" className="form-control" value={formData.seo.keywords} onChange={(e) => setFormData({...formData, seo: {...formData.seo, keywords: e.target.value}})} />
             </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '16px' }}>
            {modalType === 'add' ? 'Create Brand' : 'Save Changes'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Brands;
