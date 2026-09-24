import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, Edit, Trash2, X, LayoutGrid, List, 
  CheckCircle, Clock, FileText, Image as ImageIcon, AlertTriangle,
  Globe, Info, MessageSquare, User, Filter, MoreVertical
} from 'lucide-react';
import { 
  fetchBlogsRequest, addBlogRequest, updateBlogRequest, deleteBlogRequest 
} from '../store/slices/blogsSlice';
import { getImageUrl } from '../utils/constants';
import Drawer from '../components/Drawer';
import ImageUpload from '../components/ImageUpload';
import FilterSelect from '../components/FilterSelect';
import FormSelect from '../components/FormSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Blogs = ({ userRole = 'Admin' }) => {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.blogs);
  const { user } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const editorRef = useRef(null);

  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentBlog, setCurrentBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Travel Tips',
    customCategory: '',
    status: 'Draft',
    isFeatured: false,
    isTopPick: false,
    image: null,
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchBlogsRequest(userRole));
  }, [dispatch, userRole]);

  const handleOpenModal = (type, blog = null) => {
    setModalType(type);
    if (type === 'edit' && blog) {
      const isStandardCategory = ['Travel Tips', 'Destinations', 'News', 'Guides'].includes(blog.category);
      setCurrentBlog(blog);
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        category: isStandardCategory ? blog.category : (blog.category ? 'Other' : 'Travel Tips'),
        customCategory: isStandardCategory ? '' : (blog.category || ''),
        status: blog.status || 'Draft',
        isFeatured: blog.isFeatured || false,
        isTopPick: blog.isTopPick || false,
        image: null,
        seo: {
          title: blog.seo?.title || '',
          description: blog.seo?.description || '',
          keywords: blog.seo?.keywords?.join(', ') || ''
        }
      });
      setImagePreview(blog.image ? (blog.image.startsWith('http') ? blog.image : getImageUrl(blog.image)) : null);
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'Travel Tips',
        customCategory: '',
        status: 'Draft',
        isFeatured: false,
        isTopPick: false,
        image: null,
        seo: {
          title: '',
          description: '',
          keywords: ''
        }
      });
      setImagePreview(null);
    }
    setShowModal(true);
    setCurrentBlog(blog);

    // Ensure the editor content syncs back when opening
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = (type === 'edit' && blog) ? (blog.content || '') : '';
      }
    }, 100);
  };

  const handleImageSelect = (file) => {
    if (!file) {
      setFormData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
    } else if (file instanceof File) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (typeof file === 'string') {
      setImagePreview(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve actual content dynamically from ref to avoid sync issues on rapid submit
    const finalContent = editorRef.current ? editorRef.current.innerHTML : formData.content;
    
    const hasText = finalContent.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, '').trim().length > 0;
    const hasMedia = /<(img|iframe|video|audio)/i.test(finalContent);
    
    if (!hasText && !hasMedia) {
      showToast('Error', 'Please add blog content', 'error');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', finalContent);
    
    // Process "Other" custom category input
    const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;
    data.append('category', finalCategory);
    
    data.append('status', formData.status);
    data.append('isFeatured', formData.isFeatured);
    data.append('isTopPick', formData.isTopPick);
    if (formData.image) {
      data.append('image', formData.image);
    }
    
    const seoData = {
      title: formData.seo.title,
      description: formData.seo.description,
      keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(k => k)
    };
    data.append('seo', JSON.stringify(seoData));

    if (modalType === 'add') {
      dispatch(addBlogRequest(data));
      showToast('Success', 'Blog created successfully', 'success');
    } else {
      dispatch(updateBlogRequest({ id: currentBlog._id, data }));
      showToast('Success', 'Blog updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Blog?',
      'Are you sure you want to delete this blog post? This action cannot be undone.'
    );
    if (isConfirmed) {
      dispatch(deleteBlogRequest(id));
      showToast('Deleted', 'Blog has been removed', 'success');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{userRole === 'Vendor' ? 'Agency Blog Studio' : 'Platform Editorial Center'}</h1>
          <p>{userRole === 'Vendor' ? 'Share travel stories and agency news with your customers' : 'Manage official platform insights and travel stories'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Write {userRole === 'Vendor' ? 'Agency Post' : 'Editorial Post'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}><FileText size={24} /></div>
          <div className="stat-info"><h3>Total Posts</h3><p>{blogs.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Published</h3><p>{blogs.filter(b => b.status === 'Published').length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' }}><Clock size={24} /></div>
          <div className="stat-info"><h3>Drafts</h3><p>{blogs.filter(b => b.status === 'Draft').length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <FilterSelect 
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'Published', label: 'Published', color: '#16a34a' },
                { value: 'Draft', label: 'Draft', color: '#ca8a04' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              width="160px"
            />
            
            <div className="view-toggles" style={{ display: 'flex', gap: '4px', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setView('grid')}
                className={`view-btn ${view === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading blogs...</p>
      ) : filteredBlogs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <FileText size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No blog posts found matching your search.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid">
          {filteredBlogs.map((blog) => (
            <div key={blog._id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', background: '#f8fafc', position: 'relative' }}>
                <img 
                  src={blog.image?.startsWith('http') ? blog.image : getImageUrl(blog.image)} 
                  alt={blog.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ 
                  position: 'absolute', top: '12px', right: '12px',
                  background: blog.status === 'Published' ? '#16a34a' : '#ca8a04', 
                  color: 'white', padding: '4px 10px', borderRadius: '12px', 
                  fontSize: '10px', fontWeight: '700'
                }}>
                  {blog.status.toUpperCase()}
                </div>
                {blog.isFeatured && (
                  <div style={{ 
                    position: 'absolute', top: '12px', left: '12px', 
                    background: 'var(--primary)', color: 'white', 
                    padding: '4px 10px', borderRadius: '12px', 
                    fontSize: '10px', fontWeight: '700' 
                  }}>
                    FEATURED
                  </div>
                )}
                {blog.isTopPick && (
                  <div style={{ 
                    position: 'absolute', top: '12px', left: blog.isFeatured ? '85px' : '12px', 
                    background: '#ec4899', color: 'white', 
                    padding: '4px 10px', borderRadius: '12px', 
                    fontSize: '10px', fontWeight: '700' 
                  }}>
                    TOP PICK
                  </div>
                )}
              </div>
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', fontSize: '11px' }}>{blog.category || 'Uncategorized'}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', lineHeight: '1.4' }}>{blog.title}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={12} color="var(--text-muted)" />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{blog.author?.name || 'Admin'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => handleOpenModal('view', blog)} title="View Intelligence">
                      <Info size={16} />
                    </button>
                    <button className="action-btn" onClick={() => handleOpenModal('edit', blog)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleDelete(blog._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Post</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '50px', height: '35px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                          <img src={blog.image?.startsWith('http') ? blog.image : getImageUrl(blog.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>
                          {blog.title}
                          {blog.isTopPick && <span style={{ marginLeft: '8px', fontSize: '9px', background: '#ec4899', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>TOP PICK</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>{blog.category || 'General'}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        color: blog.status === 'Published' ? '#16a34a' : '#ca8a04',
                        background: blog.status === 'Published' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {blog.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" onClick={() => handleOpenModal('view', blog)} title="View Intelligence">
                          <Info size={16} />
                        </button>
                        <button className="action-btn" onClick={() => handleOpenModal('edit', blog)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn danger" onClick={() => handleDelete(blog._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Create New Blog Post' : modalType === 'edit' ? 'Edit Blog Post' : 'Blog Intelligence'}
        size="lg"
      >
        {modalType === 'view' ? (
          <div style={{ paddingBottom: '40px' }}>
            <div style={{ height: '240px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <img 
                src={currentBlog?.image?.startsWith('http') ? currentBlog.image : getImageUrl(currentBlog?.image)} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span className="badge" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', fontSize: '11px' }}>{currentBlog?.category || 'Uncategorized'}</span>
              <span className="badge" style={{ background: currentBlog?.status === 'Published' ? 'rgba(34, 197, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: currentBlog?.status === 'Published' ? '#16a34a' : '#ca8a04', fontSize: '11px' }}>{currentBlog?.status}</span>
              {currentBlog?.isFeatured && <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '11px' }}>FEATURED</span>}
              {currentBlog?.isTopPick && <span className="badge" style={{ background: '#ec4899', color: 'white', fontSize: '11px' }}>TOP PICK</span>}
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>{currentBlog?.title}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <User size={16} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{currentBlog?.author?.name || 'Administrative Staff'}</span>
              </div>
              <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(currentBlog?.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>

            <div 
              className="blog-content-preview"
              dangerouslySetInnerHTML={{ __html: currentBlog?.content }}
              style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)' }}
            />

            <div className="seo-intelligence-card">
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                 <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Globe size={18} />
                    </div>
                    Search Engine Intelligence
                 </h4>
                 <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#10b981', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    SEO OPTIMIZED
                 </span>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div className="seo-field-box">
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SEO TITLE</p>
                    <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{currentBlog?.seo?.title || 'Not Set'}</p>
                  </div>

                  <div className="seo-field-box">
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>META DESCRIPTION</p>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>{currentBlog?.seo?.description || 'No description provided for search engine crawlers.'}</p>
                  </div>

                  <div className="seo-field-box">
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KEYWORDS & SEARCH TAGS</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {currentBlog?.seo?.keywords && currentBlog.seo.keywords.length > 0 ? (
                        currentBlog.seo.keywords.map((k, i) => (
                          <span key={i} className="seo-keyword-badge">
                            <span style={{ opacity: 0.6, fontSize: '11px' }}>#</span>{k.trim()}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No search keywords defined</span>
                      )}
                    </div>
                  </div>
               </div>
            </div>
            
            <button className="btn btn-primary btn-block" style={{ marginTop: '32px', height: '48px' }} onClick={() => setShowModal(false)}>Close Intelligence</button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} style={{ paddingBottom: '40px' }}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" className="form-control" required placeholder="Enter catchy title..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
            <div className="form-group">
              {formData.category === 'Other' ? (
                <>
                  <label>Custom Category</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" className="form-control" required placeholder="Enter custom category..."
                      value={formData.customCategory}
                      onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                    />
                    <button type="button" className="btn" onClick={() => setFormData({...formData, category: 'Travel Tips'})} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0 16px' }}>X</button>
                  </div>
                </>
              ) : (
                <FormSelect 
                  label="Category"
                  options={[
                    { value: 'Travel Tips', label: 'Travel Tips' },
                    { value: 'Destinations', label: 'Destinations' },
                    { value: 'News', label: 'News' },
                    { value: 'Guides', label: 'Guides' },
                    { value: 'Other', label: 'Other...' }
                  ]}
                  value={formData.category}
                  onChange={(val) => setFormData({...formData, category: val})}
                />
              )}
            </div>
            <div className="form-group">
              <FormSelect 
                label="Status"
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Published', label: 'Published' }
                ]}
                value={formData.status}
                onChange={(val) => setFormData({...formData, status: val})}
              />
            </div>
          </div>

          <ImageUpload
            label="Cover Image"
            value={formData.image || imagePreview}
            onChange={handleImageSelect}
            title="Drag & drop blog cover image here, or click to browse"
            caption="Supports PNG, JPG, WEBP (max 5MB)"
            maxSizeMB={5}
          />

          <div className="form-group">
            <label>Content</label>
            <div className="editor-container">
              <div className="editor-toolbar">
                <button type="button" className="toolbar-btn" onClick={() => document.execCommand('bold', false)} title="Bold" style={{ fontWeight: 'bold' }}>B</button>
                <button type="button" className="toolbar-btn" onClick={() => document.execCommand('italic', false)} title="Italic" style={{ fontStyle: 'italic' }}>I</button>
                <button type="button" className="toolbar-btn" onClick={() => document.execCommand('underline', false)} title="Underline" style={{ textDecoration: 'underline' }}>U</button>
                <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }}></div>
                <button type="button" className="toolbar-btn" onClick={() => document.execCommand('insertUnorderedList', false)} title="Bullet List"><List size={14} /></button>
                <button type="button" className="toolbar-btn" onClick={() => document.execCommand('justifyLeft', false)} title="Align Left">L</button>
                <button type="button" className="toolbar-btn" onClick={() => document.execCommand('justifyCenter', false)} title="Align Center">C</button>
              </div>
              <div 
                ref={editorRef}
                className="editor-content"
                contentEditable
                suppressContentEditableWarning={true}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Tip: Use the toolbar for basic formatting.</p>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                />
                <span style={{ fontWeight: '600' }}>Mark as Featured Post</span>
              </label>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.isTopPick}
                  onChange={(e) => setFormData({...formData, isTopPick: e.target.checked})}
                />
                <span style={{ fontWeight: '600', color: '#ec4899' }}>Mark as Top Pick</span>
              </label>
            </div>
          </div>

          <div className="seo-intelligence-card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Globe size={18} />
              </div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>Search Engine Intelligence (SEO)</h4>
            </div>
            
            <div className="form-group">
              <label>SEO Title</label>
              <input 
                type="text" className="form-control" placeholder="Browser title tag (e.g. Top 10 Kerala Attractions)..."
                value={formData.seo.title}
                onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})}
              />
            </div>
            
            <div className="form-group">
              <label>Meta Description</label>
              <textarea 
                className="form-control" style={{ height: '80px', resize: 'vertical' }}
                placeholder="Search engine description preview for Google crawlers..."
                value={formData.seo.description}
                onChange={(e) => setFormData({...formData, seo: {...formData.seo, description: e.target.value}})}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Keywords (comma separated)</label>
              <input 
                type="text" className="form-control" placeholder="kerala, travel, munnar, houseboat..."
                value={formData.seo.keywords}
                onChange={(e) => setFormData({...formData, seo: {...formData.seo, keywords: e.target.value}})}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Separate keywords with commas. They automatically render as glowing pill badges in Search Engine Intelligence preview.</p>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '600', marginTop: '24px' }}>

            {modalType === 'add' ? 'Publish Blog' : 'Update Blog'}
          </button>
        </form>
      )}
      </Drawer>
    </div>
  );
};

export default Blogs;
