import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from '../context/ToastContext';
import { Plus, Minus, Upload, Image, ShieldCheck, Mail, MapPin, Building, CreditCard, Star, ChevronLeft, ChevronRight, Check, CheckCircle, Wallet } from 'lucide-react';
import { addVendorRequest, updateVendorRequest, fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { fetchSubscriptionsRequest } from '../store/slices/subscriptionsSlice';
import { getImageUrl } from '../utils/constants';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().when('$isEdit', (isEdit, schema) => {
    return isEdit ? schema : schema.required('Password is required').min(6, 'Min 6 characters');
  }),
  companyName: Yup.string().required('Company Name is required'),
  vendorType: Yup.string().required('Vendor Type is required'),
  description: Yup.string().required('About Vendor is required'),
  spoc: Yup.object().shape({
    name: Yup.string().required('SPOC Name is required'),
    phone: Yup.string().required('SPOC Phone is required')
  }),
  address: Yup.object().shape({
    fullAddress: Yup.string().required('Full Address is required'),
    city: Yup.string().required('City is required'),
    country: Yup.string().required('Country is required')
  }),
  
  subscription: Yup.string().required('Please select a subscription plan')
});

const VendorRegistration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view/');
  const { showToast } = useToast();

  const { vendors } = useSelector(state => state.vendors);
  const { services } = useSelector(state => state.services);
  const { subscriptions } = useSelector(state => state.subscriptions);

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [isDragging, setIsDragging] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: '', email: '', password: '', phone: '', avatar: null, role: 'Vendor', isSuspended: false,
      vendorType: 'Company', companyName: '', businessLicense: '', idCard: '', location: '',
      description: '',
      address: { street: '', city: '', state: '', country: '', zipCode: '', fullAddress: '', mapLink: '', latitude: null, longitude: null },
      zone: '', spoc: { name: '', email: '', phone: '' },
      tin: { number: '', issueDate: '', expireDate: '', issuingAuthority: '' },
      gst: { number: '', issueDate: '', expireDate: '', issuingAuthority: '' },
      bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '', branch: '' },
      kycStatus: 'Pending', isApproved: false,
      subscriptionPlan: 'Free', subscription: '', selectedServices: [],
      seo: { title: '', description: '', keywords: '' },
      idCardFile: null, tinFile: null, gstFile: null, bankFile: null,
      idCardPreview: null, tinPreview: null, gstPreview: null, bankPreview: null
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    context: { isEdit: !!id },
    onSubmit: async (values) => {
      const submitData = new FormData();
      Object.keys(values).forEach(key => {
        if (!['address', 'spoc', 'tin', 'gst', 'bankDetails', 'seo', 'selectedServices', 'idCardFile', 'tinFile', 'gstFile', 'bankFile', 'idCardPreview', 'tinPreview', 'gstPreview', 'bankPreview', 'avatar'].includes(key)) {
          submitData.append(key, values[key]);
        }
      });

      if (values.avatar) submitData.append('avatar', values.avatar);
      if (values.idCardFile) submitData.append('idCard', values.idCardFile);
      if (values.tinFile) submitData.append('tinUpload', values.tinFile);
      if (values.gstFile) submitData.append('gstUpload', values.gstFile);
      if (values.bankFile) submitData.append('bankUpload', values.bankFile);

      const profilePayload = {
        ...values,
        seo: { ...values.seo, keywords: typeof values.seo.keywords === 'string' ? values.seo.keywords.split(',').map(k => k.trim()).filter(k => k) : values.seo.keywords }
      };

      submitData.append('profile', JSON.stringify(profilePayload));
      setIsFinalizing(true);
      if (id) {
        dispatch(updateVendorRequest({ id, data: submitData }));
      } else {
        dispatch(addVendorRequest(submitData));
      }
    }
  });

  const getFieldError = (fieldName) => {
    const isTouched = fieldName.split('.').reduce((obj, key) => obj?.[key], formik.touched);
    const error = fieldName.split('.').reduce((obj, key) => obj?.[key], formik.errors);
    return isTouched && error ? (
      <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '600', marginTop: '4px', display: 'block' }}>{error}</span>
    ) : null;
  };

  const getInputFieldStyle = (fieldName) => {
    const isTouched = fieldName.split('.').reduce((obj, key) => obj?.[key], formik.touched);
    const error = fieldName.split('.').reduce((obj, key) => obj?.[key], formik.errors);
    return isTouched && error ? { borderColor: '#ef4444', background: '#fef2f2' } : {};
  };

  const handleNestedFileChange = (e, fileKey, previewKey) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue(fileKey, file);
      const reader = new FileReader();
      reader.onloadend = () => formik.setFieldValue(previewKey, reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    dispatch(fetchServicesRequest());
    dispatch(fetchSubscriptionsRequest());
    if (id) dispatch(fetchVendorsRequest());
  }, [dispatch, id]);

  useEffect(() => {
    if (id && vendors.length > 0) {
      const vendor = vendors.find(v => v._id === id);
      if (vendor) {
        formik.setValues({
          ...formik.initialValues,
          name: vendor.name || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          role: vendor.role || 'Vendor',
          isSuspended: vendor.isSuspended || false,
          ...vendor.profile,
          subscription: vendor.profile?.subscription?._id || vendor.profile?.subscription || '',
          selectedServices: vendor.profile?.selectedServices?.map(s => typeof s === 'object' ? s._id : s) || [],
          seo: {
            title: vendor.profile?.seo?.title || '',
            description: vendor.profile?.seo?.description || '',
            keywords: vendor.profile?.seo?.keywords?.join(', ') || ''
          },
          idCardPreview: vendor.profile?.idCard ? getImageUrl(vendor.profile.idCard) : null,
          tinPreview: vendor.profile?.tin?.upload ? getImageUrl(vendor.profile.tin.upload) : null,
          gstPreview: vendor.profile?.gst?.upload ? getImageUrl(vendor.profile.gst.upload) : null,
          bankPreview: vendor.profile?.bankDetails?.upload ? getImageUrl(vendor.profile.bankDetails.upload) : null
        });
        if (vendor.avatar) setImagePreview(getImageUrl(vendor.avatar));
      }
    }
  }, [id, vendors]);

  const handleNext = async (e) => {
    e.preventDefault();
    const fieldsToValidate = {
      1: ['name', 'email', 'phone', ...(!id ? ['password'] : [])],
      2: ['companyName', 'vendorType', 'description', 'spoc.name', 'spoc.phone'],
      3: ['address.fullAddress', 'address.city', 'address.country'],
      4: ['bankDetails.bankName', 'bankDetails.accountNumber', 'gst.number', 'tin.number'],
      5: ['kycStatus'],
      6: ['subscription']
    };

    const currentFields = fieldsToValidate[currentStep] || [];
    currentFields.forEach(f => formik.setFieldTouched(f, true));

    // Check if any current fields have errors
    const errors = await formik.validateForm();
    const stepHasErrors = currentFields.some(f => {
      const fieldError = f.split('.').reduce((obj, key) => obj?.[key], errors);
      return !!fieldError;
    });

    if (stepHasErrors) {
      showToast('Validation Error', 'Please correct the highlighted fields.', 'error');
      return;
    }

    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }, 0);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleArrayToggle = (key, val) => {
    const next = formik.values[key].includes(val) ? formik.values[key].filter(i => i !== val) : [...formik.values[key], val];
    formik.setFieldValue(key, next);
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Account' },
      { num: 2, label: 'Business' },
      { num: 3, label: 'Location' },
      { num: 4, label: 'Financials' },
      { num: 5, label: 'Security' },
      { num: 6, label: 'Plans' },
      { num: 7, label: 'Review' }
    ];

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', left: '8%', right: '8%', height: '3px', background: 'var(--border)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '16px', left: '8%', width: ((currentStep - 1) * (100 / 6)) + '%', height: '3px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.4s ease' }} />

        {steps.map((step) => (
          <div key={step.num} style={{ textAlign: 'center', position: 'relative', zIndex: 2, background: 'var(--bg-card)', padding: '0 8px', opacity: currentStep >= step.num ? 1 : 0.4 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: currentStep >= step.num ? 'var(--primary)' : 'var(--bg-main)', color: currentStep >= step.num ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: '800', boxShadow: '0 0 0 4px var(--bg-card)', transition: 'background 0.3s ease' }}>
              {currentStep > step.num ? <Check size={16} /> : step.num}
            </div>
            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: currentStep >= step.num ? 'var(--primary)' : 'var(--text-muted)', letterSpacing: '0.05em' }}>{step.label}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderReviewItem = (label, value) => (
    <div style={{ marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: '600' }}>{value || 'Not Provided'}</p>
    </div>
  );

  const handleDrop = (e, fileKey, previewKey, callback) => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (callback) {
        // Special case for Avatar handler
        callback({ target: { files: [file] } });
      } else {
        handleNestedFileChange({ target: { files: [file] } }, fileKey, previewKey);
      }
    }
  };

  const renderUploadPreview = (preview, fileInputId, fileKey, previewKey, customStyle = {}, callback = null) => {
    const isThisDragging = isDragging === fileInputId;

    return (
      <div
        className={`upload-dropzone ${isThisDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(fileInputId); }}
        onDragLeave={() => setIsDragging(null)}
        onDrop={(e) => handleDrop(e, fileKey, previewKey, callback)}
        onClick={() => !isViewMode && document.getElementById(fileInputId).click()}
        style={{
          width: '100%',
          height: '110px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '12px',
          borderWidth: '2px',
          borderStyle: 'dashed',
          borderColor: isThisDragging ? 'var(--primary)' : 'var(--border)',
          background: isThisDragging ? 'rgba(79, 70, 229, 0.05)' : (preview ? 'none' : '#f8fafc'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isViewMode ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          ...customStyle
        }}
      >
        {preview ? (
          <>
            <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} alt="Doc Preview" />
            {!isViewMode && (
              <div
                className="upload-overlay"
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s ease', gap: '8px' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setLightbox(preview); }} style={{ padding: '8px', background: '#fff', color: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}> <Star size={16} /> </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); document.getElementById(fileInputId).click(); }} style={{ padding: '8px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}> <Upload size={16} /> </button>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Click or Drop to Replace</span>
              </div>
            )}
            {isViewMode && (
              <div
                className="view-overlay"
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', opacity: 0, transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                onClick={(e) => { e.stopPropagation(); setLightbox(preview); }}
              >
                <div style={{ padding: '8px', background: '#fff', borderRadius: '50%', color: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}><Star size={20} /></div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isThisDragging ? 'var(--primary)' : 'var(--bg-main)', color: isThisDragging ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', transition: '0.3s' }}>
              <Upload size={20} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: isThisDragging ? 'var(--primary)' : 'var(--text)', margin: '0 0 2px' }}>Drag & Drop</p>
            <p style={{ fontSize: '11px' }}>or click to browse</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      {/* LIGHTBOX MODAL */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', cursor: 'zoom-out' }}
        >
          <img src={lightbox} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', objectFit: 'contain' }} alt="Full View" />
          <button style={{ position: 'absolute', top: '24px', right: '24px', background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }} onClick={() => setLightbox(null)}>X</button>
        </div>
      )}

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn" style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', background: 'var(--bg-card)' }} onClick={() => navigate('/vendors')}>
            <ChevronLeft size={20} /> Back
          </button>
          <div>
            <h1>{isViewMode ? 'View Vendor Profile' : (id ? 'Edit Vendor Profile' : 'Register New Vendor')}</h1>
            <p>{isViewMode ? 'Reviewing all aspects of this vendor\'s registration' : 'Complete the stepper form to configure all aspects of a vendor\'s account'}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
        {renderStepIndicator()}

        <form onSubmit={formik.handleSubmit}>
          {/* STEP 1: ACCOUNT DETAILS */}
          {currentStep === 1 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck /> Account Security
              </h2>

              <div style={{ marginBottom: '32px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                  {renderUploadPreview(imagePreview, 'vendorAvatarAdd', 'avatar', 'avatar', { borderRadius: '50%', height: '100px' }, handleFileChange)}
                  <input id="vendorAvatarAdd" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{isViewMode ? 'Official Photo' : 'Vendor Avatar'}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{isViewMode ? 'Profile identification image' : 'Upload a professional profile photo (Avatar).'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Full Name *</label>
                  <input type="text" className="form-control" placeholder="John Doe" disabled={isViewMode} {...formik.getFieldProps('name')} style={getInputFieldStyle('name')} />
                  {getFieldError('name')}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Email Address *</label>
                  <input type="email" className="form-control" placeholder="admin@vendor.com" disabled={isViewMode} {...formik.getFieldProps('email')} style={getInputFieldStyle('email')} />
                  {getFieldError('email')}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Password {!id && '*'}</label>
                  <input type="password" className="form-control" placeholder="••••••••" disabled={isViewMode} {...formik.getFieldProps('password')} style={getInputFieldStyle('password')} />
                  {getFieldError('password')}
                  {id && !isViewMode && <small style={{ color: 'var(--text-muted)' }}>Leave blank to keep existing password.</small>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Phone Number *</label>
                  <input type="text" className="form-control" placeholder="+91 9876543210" disabled={isViewMode} {...formik.getFieldProps('phone')} style={getInputFieldStyle('phone')} />
                  {getFieldError('phone')}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS INFO */}
          {currentStep === 2 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building /> Business Profile
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                {/* Entity Basics */}
                <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>Identity & Entity</h4>
                  <div className="form-group">
                    <label>Company/Agency Name *</label>
                    <input type="text" className="form-control" placeholder="E.g., SkyHigh Travels" disabled={isViewMode} {...formik.getFieldProps('companyName')} style={getInputFieldStyle('companyName')} />
                    {getFieldError('companyName')}
                  </div>
                  <div className="form-group">
                    <label>About Vendor / Business Bio *</label>
                    <textarea className="form-control" rows="3" placeholder="Describe the vendor operations..." disabled={isViewMode} {...formik.getFieldProps('description')} style={getInputFieldStyle('description')} />
                    {getFieldError('description')}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Business License / Registration No.</label>
                    <input type="text" className="form-control" placeholder="Reg: 99881122" disabled={isViewMode} {...formik.getFieldProps('businessLicense')} />
                  </div>
                </div>

                {/* ID Upload & Type */}
                <div>
                  <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>Entity Classification *</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {[
                        { val: 'Individual', icon: <Plus size={16} /> },
                        { val: 'Company', icon: <Building size={16} /> },
                        { val: 'Business', icon: <ShieldCheck size={16} /> }
                      ].map(type => {
                        const isSelected = formik.values.vendorType === type.val;
                        return (
                          <div
                            key={type.val}
                            onClick={() => !isViewMode && formik.setFieldValue('vendorType', type.val)}
                            style={{
                              padding: '16px 4px',
                              borderRadius: '14px',
                              borderWidth: '2px',
                              borderStyle: 'solid',
                              borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                              background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-card)',
                              textAlign: 'center',
                              cursor: isViewMode ? 'default' : 'pointer',
                              fontSize: '10px',
                              fontWeight: '900',
                              transition: 'all 0.3s ease',
                              color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              ...(isSelected ? {} : getInputFieldStyle('vendorType'))
                            }}
                          >
                            {type.icon}
                            {type.val.toUpperCase()}
                          </div>
                        );
                      })}
                    </div>
                    {getFieldError('vendorType')}
                  </div>

                  <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Legal Representative IDs</h4>
                    <div style={{ width: '100%' }}>
                      {renderUploadPreview(formik.values.idCardPreview, 'idCardUploadInput', 'idCardFile', 'idCardPreview')}
                      <input id="idCardUploadInput" type="file" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={(e) => handleNestedFileChange(e, 'idCardFile', 'idCardPreview')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SPOC Section */}
              <div style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border)', paddingTop: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Single Point of Contact (SPOC) mapping</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>SPOC Name *</label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('spoc.name')} style={getInputFieldStyle('spoc.name')} />
                    {getFieldError('spoc.name')}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>SPOC Email</label>
                    <input type="email" className="form-control" disabled={isViewMode} {...formik.getFieldProps('spoc.email')} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>SPOC Phone *</label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('spoc.phone')} style={getInputFieldStyle('spoc.phone')} />
                    {getFieldError('spoc.phone')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & ADDRESS */}
          {currentStep === 3 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin /> Location Details
              </h2>

              <div className="form-group">
                <label>Full Address Overview *</label>
                <textarea className="form-control" rows="2" placeholder="Start typing address..." disabled={isViewMode} {...formik.getFieldProps('address.fullAddress')} style={getInputFieldStyle('address.fullAddress')} />
                {getFieldError('address.fullAddress')}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Street/Building</label>
                  <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('address.street')} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>City/Town *</label>
                  <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('address.city')} style={getInputFieldStyle('address.city')} />
                  {getFieldError('address.city')}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>State/Province</label>
                  <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('address.state')} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Country *</label>
                  <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('address.country')} style={getInputFieldStyle('address.country')} />
                  {getFieldError('address.country')}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Zip/Postal Code</label>
                  <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('address.zipCode')} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Internal Zone / Region</label>
                  <input type="text" className="form-control" placeholder="E.g., North, South" disabled={isViewMode} {...formik.getFieldProps('zone')} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FINANCIALS */}
          {currentStep === 4 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard /> Financial Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                {/* GST Details */}
                <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>GST Details</h4>
                  <div className="form-group">
                    <label>GST Number </label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('gst.number')} style={getInputFieldStyle('gst.number')} />
                    {getFieldError('gst.number')}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Issuing Authority</label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('gst.issuingAuthority')} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GST Certificate Scan</label>
                    <div style={{ width: '100%', marginTop: '6px' }}>
                      {renderUploadPreview(formik.values.gstPreview, 'gstFileUpload', 'gstFile', 'gstPreview')}
                      <input id="gstFileUpload" type="file" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={(e) => handleNestedFileChange(e, 'gstFile', 'gstPreview')} />
                    </div>
                  </div>
                </div>

                {/* TIN Details */}
                <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>TIN Details</h4>
                  <div className="form-group">
                    <label>TIN Number </label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('tin.number')} style={getInputFieldStyle('tin.number')} />
                    {getFieldError('tin.number')}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Issuing Authority</label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('tin.issuingAuthority')} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TIN Certificate Scan</label>
                    <div style={{ width: '100%', marginTop: '6px' }}>
                      {renderUploadPreview(formik.values.tinPreview, 'tinFileUpload', 'tinFile', 'tinPreview')}
                      <input id="tinFileUpload" type="file" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={(e) => handleNestedFileChange(e, 'tinFile', 'tinPreview')} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border)', paddingTop: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Bank Account Mapping</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>Account Holder Name</label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('bankDetails.accountName')} />
                  </div>
                  <div className="form-group">
                    <label>Account Number </label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('bankDetails.accountNumber')} style={getInputFieldStyle('bankDetails.accountNumber')} />
                    {getFieldError('bankDetails.accountNumber')}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Bank Name </label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('bankDetails.bankName')} style={getInputFieldStyle('bankDetails.bankName')} />
                    {getFieldError('bankDetails.bankName')}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>IFSC Code / Routing</label>
                    <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('bankDetails.ifscCode')} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Passbook / Cancelled Cheque</label>
                    <div style={{ width: '100%', marginTop: '8px' }}>
                      {renderUploadPreview(formik.values.bankPreview, 'bankFileUpload', 'bankFile', 'bankPreview')}
                      <input id="bankFileUpload" type="file" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={(e) => handleNestedFileChange(e, 'bankFile', 'bankPreview')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SECURITY & META */}
          {currentStep === 5 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck /> Security & Discovery
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Status & Control</h4>
                  <div className="form-group">
                    <label>KYC Verification Progress</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { val: 'Pending', icon: <Plus size={14} />, color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
                        { val: 'Verified', icon: <CheckCircle size={14} />, color: '#10b981', bg: '#f0fdf4', border: '#dcfce7' },
                        { val: 'Rejected', icon: <Minus size={14} />, color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' }
                      ].map(status => {
                        const isSelected = formik.values.kycStatus === status.val;
                        return (
                          <div
                            key={status.val}
                            onClick={() => !isViewMode && formik.setFieldValue('kycStatus', status.val)}
                            style={{
                              flex: 1,
                              padding: '12px 4px',
                              borderRadius: '14px',
                              borderWidth: '2px',
                              borderStyle: 'solid',
                              borderColor: isSelected ? status.color : 'var(--border)',
                              background: isSelected ? status.bg : 'var(--bg-main)',
                              textAlign: 'center',
                              cursor: isViewMode ? 'default' : 'pointer',
                              fontSize: '10px',
                              fontWeight: '900',
                              transition: 'all 0.3s ease',
                              color: isSelected ? status.color : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: isSelected ? `0 4px 12px ${status.border}` : 'none'
                            }}
                          >
                            {status.icon}
                            {status.val.toUpperCase()}
                          </div>
                        )
                      })}
                    </div>
                    {getFieldError('kycStatus')}
                  </div>
                  <div className="form-group">
                    <div
                      onClick={() => !isViewMode && formik.setFieldValue('isApproved', !formik.values.isApproved)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: formik.values.isApproved ? '#f0fdf4' : 'var(--bg-main)', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', borderColor: formik.values.isApproved ? '#bbf7d0' : 'var(--border)', cursor: isViewMode ? 'default' : 'pointer', transition: 'all 0.3s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: formik.values.isApproved ? '#22c55e' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '800', fontSize: '14px', margin: 0, color: formik.values.isApproved ? '#166534' : 'var(--text)' }}>Platform Approval</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{formik.values.isApproved ? 'Partner is active and visible' : 'Visible only after review'}</p>
                        </div>
                      </div>
                      <div style={{ width: '48px', height: '24px', borderRadius: '20px', background: formik.values.isApproved ? '#22c55e' : '#e2e8f0', position: 'relative', transition: '0.3s' }}>
                        <div style={{ position: 'absolute', top: '2px', left: formik.values.isApproved ? '26px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                      </div>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <div
                      onClick={() => !isViewMode && formik.setFieldValue('isSuspended', !formik.values.isSuspended)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: formik.values.isSuspended ? '#fff1f2' : 'var(--bg-main)', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', borderColor: formik.values.isSuspended ? '#fecdd3' : 'var(--border)', cursor: isViewMode ? 'default' : 'pointer', transition: 'all 0.3s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: formik.values.isSuspended ? '#ef4444' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '800', fontSize: '14px', margin: 0, color: formik.values.isSuspended ? '#9f1239' : 'var(--text)' }}>Global Suspension</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{formik.values.isSuspended ? 'All access restricted' : 'Normal account standing'}</p>
                        </div>
                      </div>
                      <div style={{ width: '48px', height: '24px', borderRadius: '20px', background: formik.values.isSuspended ? '#ef4444' : '#e2e8f0', position: 'relative', transition: '0.3s' }}>
                        <div style={{ position: 'absolute', top: '2px', left: formik.values.isSuspended ? '26px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Discovery Meta (SEO)</h4>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>Meta Title Tag</label>
                    <input type="text" className="form-control" placeholder="SEO Title" disabled={isViewMode} {...formik.getFieldProps('seo.title')} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>Meta Description</label>
                    <textarea className="form-control" rows="2" placeholder="SEO Description" disabled={isViewMode} {...formik.getFieldProps('seo.description')} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Keywords</label>
                    <input type="text" className="form-control" placeholder="travel, bookings..." disabled={isViewMode} {...formik.getFieldProps('seo.keywords')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SUBSCRIPTION & MODULES */}
          {currentStep === 6 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet /> Plans & Authorized Modules
              </h2>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Assigned Subscription Plan *</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {(subscriptions || []).map(sub => {
                    const isSelected = formik.values.subscription === sub._id;
                    return (
                      <div
                        key={sub._id}
                        onClick={() => !isViewMode && formik.setFieldValue('subscription', sub._id)}
                        style={{ padding: '24px', borderRadius: '16px', borderWidth: '2px', borderStyle: 'solid', borderColor: isSelected ? 'var(--primary)' : 'var(--border)', background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-card)', cursor: isViewMode ? 'default' : 'pointer', transition: 'all 0.3s ease', position: 'relative', ...(isSelected ? {} : getInputFieldStyle('subscription')) }}
                      >
                        {isSelected && <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary)' }}><CheckCircle size={20} /></div>}
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px' }}>{sub.title}</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{sub.plan} Level Coverage</p>
                        <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.4', marginBottom: '16px', fontWeight: '500' }}>{sub.description || 'Full featured platform access.'}</p>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginBottom: '16px' }}>₹{sub.price} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>/ Partner Fee</span></div>
                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: '#22c55e' }} /> {sub.userLimit === -1 ? 'Unlimited' : sub.userLimit} Users Integrated</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: '#22c55e' }} /> {sub.packageLimit === -1 ? 'Unlimited' : sub.packageLimit} Package Inventory</li>
                          {sub.crmEnabled && <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: '#22c55e' }} /> CRM Dashboard Access</li>}
                          {sub.websiteEnabled && <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: '#22c55e' }} /> Custom Website Ready</li>}
                          {(sub.features || []).map((f, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: '#22c55e' }} /> {f}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                {getFieldError('subscription')}
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '32px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Authorized Service Modules</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Enable internal tools this partner can operate.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                  {(services || []).map(srv => {
                    const isSelected = (formik.values.selectedServices || []).includes(srv._id);
                    return (
                      <div
                        key={srv._id}
                        onClick={() => !isViewMode && handleArrayToggle('selectedServices', srv._id)}
                        style={{ padding: '16px', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', borderColor: isSelected ? 'var(--primary)' : 'var(--border)', background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-card)', cursor: isViewMode ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', transition: 'all 0.2s ease' }}
                      >
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isSelected ? 'var(--primary)' : 'var(--bg-main)', color: isSelected ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                          {srv.image ? <img src={getImageUrl(srv.image)} style={{ width: '28px', height: '28px', objectFit: 'contain', filter: isSelected ? 'brightness(0) invert(1)' : 'none' }} alt="" /> : <Star size={24} />}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '600', marginBottom: '4px' }}>{srv.title}</span>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>{srv.description || 'Module enabled'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & SUBMIT */}
          {currentStep === 7 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={22} style={{ color: '#22c55e' }} /> Final Review Summary
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* ACCOUNT REVIEW */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} /> Account Security
                  </h4>
                  {imagePreview && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Avatar</p>
                      <img src={imagePreview} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', cursor: 'pointer' }} alt="Review" onClick={() => setLightbox(imagePreview)} />
                    </div>
                  )}
                  {renderReviewItem('Full Name', formik.values.name)}
                  {renderReviewItem('Email Address', formik.values.email)}
                  {renderReviewItem('Phone Number', formik.values.phone)}
                </div>

                {/* BUSINESS REVIEW */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={16} /> Business Profile
                  </h4>
                  {renderReviewItem('Company Name', formik.values.companyName)}
                  {renderReviewItem('Vendor Type', formik.values.vendorType)}
                  {renderReviewItem('License No.', formik.values.businessLicense)}
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>SPOC Details</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>{(formik.values.spoc?.name || 'N/A')} • {(formik.values.spoc?.phone || 'N/A')}</p>
                  {formik.values.idCardPreview && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Identity Document</p>
                      <img src={formik.values.idCardPreview} style={{ width: '80px', height: '50px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', objectFit: 'cover', cursor: 'pointer' }} alt="ID Card" onClick={() => setLightbox(formik.values.idCardPreview)} />
                    </div>
                  )}
                </div>

                {/* LOCATION REVIEW */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> Location Overview
                  </h4>
                  {renderReviewItem('Full Address', formik.values.address?.fullAddress)}
                  {renderReviewItem('City & Country', `${formik.values.address?.city || 'N/A'}, ${formik.values.address?.country || 'N/A'}`)}
                  {renderReviewItem('Internal Zone', formik.values.zone)}
                </div>

                {/* FINANCIAL REVIEW */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={16} /> Financial & Bank
                  </h4>
                  {renderReviewItem('Bank Account', `${formik.values.bankDetails?.bankName || 'N/A'} - ${formik.values.bankDetails?.accountNumber || 'N/A'}`)}
                  {renderReviewItem('GST Number', formik.values.gst?.number)}
                  {renderReviewItem('TIN Number', formik.values.tin?.number)}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    {formik.values.gstPreview && (
                      <div>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>GST</p>
                        <img src={formik.values.gstPreview} style={{ width: '60px', height: '40px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', objectFit: 'cover', cursor: 'pointer' }} alt="GST" onClick={() => setLightbox(formik.values.gstPreview)} />
                      </div>
                    )}
                    {formik.values.tinPreview && (
                      <div>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>TIN</p>
                        <img src={formik.values.tinPreview} style={{ width: '60px', height: '40px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', objectFit: 'cover', cursor: 'pointer' }} alt="TIN" onClick={() => setLightbox(formik.values.tinPreview)} />
                      </div>
                    )}
                    {formik.values.bankPreview && (
                      <div>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Bank Proof</p>
                        <img src={formik.values.bankPreview} style={{ width: '60px', height: '40px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', objectFit: 'cover', cursor: 'pointer' }} alt="Bank" onClick={() => setLightbox(formik.values.bankPreview)} />
                      </div>
                    )}
                  </div>
                </div>

                {/* PLATFORM REVIEW */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={16} /> Platform Bindings
                  </h4>
                  {renderReviewItem('KYC Status', formik.values.kycStatus)}
                  {renderReviewItem('Approval', formik.values.isApproved ? 'Approved' : 'Pending Review')}

                  <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px' }}>Authorized Modules</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(formik.values.selectedServices || []).length > 0 ? (
                      formik.values.selectedServices.map(sid => {
                        const srv = (services || []).find(s => s._id === sid);
                        return (
                          <div key={sid} style={{ padding: '8px 12px', background: 'var(--bg-main)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '10px', flex: '1 1 calc(50% - 6px)', minWidth: '140px' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>{srv?.title || sid}</p>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{srv?.description || 'Access enabled'}</p>
                          </div>
                        )
                      })
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                    )}
                  </div>
                </div>

                {/* SEO REVIEW */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={16} /> SEO Configuration
                  </h4>
                  {renderReviewItem('Meta Title', formik.values.seo.title)}
                  {renderReviewItem('Meta Keywords', formik.values.seo.keywords)}
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Meta Description Summary</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', lineHeight: 1.4 }}>{formik.values.seo.description || 'No description provided.'}</p>
                </div>

                {/* SUBSCRIPTION REVIEW */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={16} /> Selected Plan
                  </h4>
                  {formik.values.subscription ? (
                    (() => {
                      const sub = (subscriptions || []).find(s => s._id === formik.values.subscription);
                      return (
                        <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' }}>
                          <p style={{ fontWeight: '800', margin: '0 0 4px', fontSize: '14px' }}>{sub?.title}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '8px', fontWeight: '500' }}>{sub?.description}</p>
                          <ul style={{ padding: 0, margin: '8px 0 12px', listStyle: 'none', fontSize: '12px', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(sub?.features || []).map((f, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={12} style={{ color: '#22c55e' }} /> {f}</li>
                            ))}
                          </ul>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: '700', textTransform: 'uppercase' }}>{sub?.plan} Level • ₹{sub?.price}</p>
                        </div>
                      )
                    })()
                  ) : (
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>No plan selected.</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '16px', borderWidth: '1px', borderStyle: 'dashed', borderColor: '#22c55e' }}>
                <p style={{ fontSize: '14px', color: '#166534', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={18} /> Review Complete. By clicking "Finalize", you confirm all details are accurate.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '40px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border)', paddingTop: '24px' }}>
            {currentStep > 1 && (
              <button type="button" className="btn" style={{ height: '48px', padding: '0 32px', background: 'var(--bg-main)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', fontWeight: '600' }} onClick={handlePrev}>
                Back Segment
              </button>
            )}

            <div style={{ flex: 1 }}></div>

            {currentStep < 7 ? (
              <button type="button" className="btn btn-primary" style={{ height: '48px', padding: '0 40px', fontWeight: '600' }} onClick={handleNext}>
                Continue Next Segment <ChevronRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            ) : (
              <button type={isViewMode ? "button" : "submit"} className="btn btn-primary" style={{ height: '48px', padding: '0 40px', fontWeight: '800' }} disabled={isFinalizing} onClick={() => isViewMode && navigate('/vendors')}>
                {isFinalizing ? 'Saving...' : (isViewMode ? 'Registration Audit Complete' : (id ? 'Commit Vendor Updates' : 'Finalize & Register Vendor'))}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;
