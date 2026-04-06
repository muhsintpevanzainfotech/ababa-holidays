import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from '../context/ToastContext';
import { Plus, Minus, Upload, Image, ShieldCheck, Mail, MapPin, Building, CreditCard, Star, ChevronLeft, ChevronRight, Check, CheckCircle, Wallet, FileText, Eye, EyeOff, X } from 'lucide-react';
import { addVendorRequest, updateVendorRequest, fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { fetchSubscriptionsRequest } from '../store/slices/subscriptionsSlice';
import { getImageUrl } from '../utils/constants';
import { fetchBrandsRequest } from '../store/slices/brandsSlice';
import { fetchCountriesRequest, fetchStatesRequest, fetchDestinationsRequest } from '../store/slices/locationsSlice';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapPicker({ latitude, longitude, onPositionChange }) {
  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], map.getZoom(), { animate: true });
    }
  }, [latitude, longitude, map]);

  return latitude && longitude ? <Marker position={[latitude, longitude]} /> : null;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().when('isEdit', {
    is: false,
    then: (schema) => schema.min(6, 'Password must be at least 6 characters').required('Password is required'),
    otherwise: (schema) => schema.min(6, 'Password must be at least 6 characters')
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
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required')
  }),
  subscription: Yup.string().required('Please select a subscription plan')
});

const VendorRegistration = ({ isPublic = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view/');
  const { showToast } = useToast();

  const { vendors, loading: vendorsLoading, error: vendorsError } = useSelector(state => state.vendors);
  const { services } = useSelector(state => state.services);
  const { subscriptions } = useSelector(state => state.subscriptions);
  const { brands } = useSelector(state => state.brands);

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [isDragging, setIsDragging] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    formik.setFieldValue('password', pass);
  };

  const formik = useFormik({
    initialValues: {
      name: '', email: '', password: '', phone: '', avatar: null, role: 'Vendor', isSuspended: false,
      vendorType: 'Company', companyName: '', businessLicense: '', idCard: '', location: '',
      description: '',
      address: {
        street: '', city: '', state: '', country: '',
        zipCode: '', fullAddress: '', mapLink: '',
        latitude: 10.8505, longitude: 76.2711  // Default to Kerala for demonstration or null
      },
      zone: '', spoc: { name: '', email: '', phone: '' },
      tin: { number: '', issueDate: '', expireDate: '', issuingAuthority: '' },
      gst: { number: '', issueDate: '', expireDate: '', issuingAuthority: '' },
      bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '', branch: '' },
      kycStatus: 'Pending', isApproved: !id,
      subscriptionPlan: 'Free', subscription: '', selectedServices: [],
      companylogos: {
        small: null,
        medium: null,
        large: null
      },
      socialMedia: [],
      seo: { title: '', description: '', keywords: '' },
      idCardFile: null, tinFile: null, gstFile: null, bankFile: null,
      logoSFile: null, logoMFile: null, logoLFile: null,
      idCardPreview: null, tinPreview: null, gstPreview: null, bankPreview: null,
      logoSPreview: null, logoMPreview: null, logoLPreview: null
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    context: { isEdit: !!id },
    onSubmit: async (values) => {
      const submitData = new FormData();
      Object.keys(values).forEach(key => {
        if (!['address', 'spoc', 'tin', 'gst', 'bankDetails', 'seo', 'selectedServices', 'companylogos', 'socialMedia', 'idCardFile', 'tinFile', 'gstFile', 'bankFile', 'logoSFile', 'logoMFile', 'logoLFile', 'idCardPreview', 'tinPreview', 'gstPreview', 'bankPreview', 'logoSPreview', 'logoMPreview', 'logoLPreview', 'avatar'].includes(key)) {
          submitData.append(key, values[key]);
        }
      });

      if (values.avatar) submitData.append('avatar', values.avatar);
      if (values.idCardFile) submitData.append('idCard', values.idCardFile);
      if (values.tinFile) submitData.append('tinUpload', values.tinFile);
      if (values.gstFile) submitData.append('gstUpload', values.gstFile);
      if (values.bankFile) submitData.append('bankUpload', values.bankFile);

      if (values.logoSFile) submitData.append('logoS', values.logoSFile);
      if (values.logoMFile) submitData.append('logoM', values.logoMFile);
      if (values.logoLFile) submitData.append('logoL', values.logoLFile);

      // JSON fields
      ['address', 'spoc', 'tin', 'gst', 'bankDetails', 'seo', 'selectedServices', 'socialMedia'].forEach(key => {
        submitData.append(key, JSON.stringify(values[key]));
      });

      const profilePayload = {
        ...values,
        seo: { ...values.seo, keywords: typeof values.seo.keywords === 'string' ? values.seo.keywords.split(',').map(k => k.trim()).filter(k => k) : values.seo.keywords }
      };

      submitData.append('profile', JSON.stringify(profilePayload));

      // Handle special fields for user creation
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
    dispatch(fetchCountriesRequest({ all: true }));
    dispatch(fetchStatesRequest({ all: true }));
    if (id) dispatch(fetchVendorsRequest());
  }, [dispatch, id]);

  const countriesData = useSelector(state => state.countries.countries || []);
  const statesData = useSelector(state => state.states.states || []);
  const locationsLoading = useSelector(state => state.countries.loading || state.states.loading);
  const countries = Array.isArray(countriesData) ? countriesData : [];
  const states = Array.isArray(statesData) ? statesData : [];

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
  
  // Handle successful save/update
  const [prevVendorsLoading, setPrevVendorsLoading] = useState(false);
  useEffect(() => {
    if (prevVendorsLoading && !vendorsLoading && !vendorsError && isFinalizing) {
       setIsFinalizing(false);
       showToast('Success', id ? 'Vendor updated successfully' : 'Vendor registered successfully', 'success');
       if (isPublic) {
         navigate('/login'); // Or a "Thank you" page?
       } else {
         navigate('/vendors');
       }
    } else if (prevVendorsLoading && !vendorsLoading && vendorsError && isFinalizing) {
       setIsFinalizing(false);
       showToast('Error', vendorsError, 'error');
    }
    setPrevVendorsLoading(vendorsLoading);
  }, [vendorsLoading, vendorsError, isFinalizing, id, navigate, showToast, prevVendorsLoading]);

  const handleCitySearch = async (val) => {
    formik.setFieldValue('address.city', val);
    if (val.length > 2 && !isViewMode) {
      setIsSearchingCity(true);
      try {
        const countryObj = countries.find(c => c._id === formik.values.address.country);
        const stateObj = states.find(s => s._id === formik.values.address.state);
        const query = `${val}${stateObj ? ', ' + stateObj.name : ''}${countryObj ? ', ' + countryObj.name : ''}`;

        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`);
        const data = await res.json();
        setCitySuggestions(data || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearchingCity(false);
      }
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCitySuggestion = (suggestion) => {
    formik.setFieldValue('address.city', suggestion.display_name.split(',')[0]);
    formik.setFieldValue('address.latitude', parseFloat(suggestion.lat));
    formik.setFieldValue('address.longitude', parseFloat(suggestion.lon));
    setCitySuggestions([]);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const fieldsToValidate = {
      1: ['name', 'email', 'phone', ...(!id ? ['password'] : [])],
      2: ['companyName', 'vendorType', 'description', 'spoc.name', 'spoc.phone'],
      3: ['address.fullAddress', 'address.city', 'address.country', 'address.state'],
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
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', margin: 0, borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
        {value || '—'}
      </p>
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
            {(typeof preview === 'string' && (preview.startsWith('data:image/') || preview.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i))) ? (
              <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} alt="Doc Preview" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', padding: '12px' }}>
                <FileText size={40} color="var(--primary)" />
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'center' }}>Document Loaded</span>
              </div>
            )}
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
            <p style={{ fontSize: '9px', fontWeight: '800', marginTop: '4px', color: 'var(--text-muted)' }}>LIMIT: 50MB</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fade-in ${isPublic ? 'auth-container' : ''}`} style={isPublic ? { background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' } : {}}>
      {/* LIGHTBOX MODAL */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
        >
          {/* Unified Close Button */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '32px', right: '32px', background: '#fff', border: 'none',
              width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
              zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)', transition: 'all 0.3s ease'
            }}
          >
            <X size={24} style={{ color: 'var(--text-main)' }} />
          </button>

          {(typeof lightbox === 'string' && (lightbox.startsWith('data:image/') || lightbox.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i))) ? (
            <img
              src={lightbox}
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', objectFit: 'contain', cursor: 'zoom-out' }}
              alt="Full View"
            />
          ) : (typeof lightbox === 'string' && (lightbox.startsWith('data:application/pdf') || lightbox.match(/\.pdf$/i))) ? (
            <div style={{ width: '90%', height: '90%', background: 'white', borderRadius: '12px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
              <iframe src={lightbox} title="PDF Viewer" style={{ width: '100%', height: '100%', border: 'none' }} />
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', padding: '48px', borderRadius: '24px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <FileText size={48} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>Native Document View</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px', lineHeight: 1.5 }}>This document type (.doc, .xls, etc.) cannot be previewed directly in the dashboard. Please open it in a new window or download to view.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <a href={lightbox} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>Open External</a>
                <button className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '12px 24px' }} onClick={() => setLightbox(null)}>Dismiss</button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!isPublic && (
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
      )}

      {isPublic && (
        <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'var(--primary)', color: 'white', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
          }}>
            <Briefcase size={32} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginBottom: '12px', letterSpacing: '-1px' }}>Partner with ABABA Holidays</h1>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.5 }}>Expand your reach and join our global network of travel professionals. Complete the registration below to get started.</p>
        </div>
      )}

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Password {!id && '*'}</label>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        style={{ fontSize: '10px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}
                      >
                        Generate Random
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      disabled={isViewMode}
                      {...formik.getFieldProps('password')}
                      style={{ ...getInputFieldStyle('password'), paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <Eye size={16} style={{ color: 'var(--primary)' }} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  {getFieldError('password')}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    {id && !isViewMode && <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Leave blank to keep existing password.</small>}
                  </div>
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

                  {/* Company Branding Section */}
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Corporate Identity</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                      {['small', 'medium', 'large'].map((size, idx) => {
                        const fileKey = `logo${size.charAt(0).toUpperCase()}File`;
                        const previewKey = `logo${size.charAt(0).toUpperCase()}Preview`;
                        return (
                          <div key={size}>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{size.toUpperCase()} Logo</label>
                            {renderUploadPreview(formik.values[previewKey], `logo${size}Input`, fileKey, previewKey)}
                            <input id={`logo${size}Input`} type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleNestedFileChange(e, fileKey, previewKey)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', margin: 0, color: 'var(--text-muted)' }}>Social Presence</h4>
                      <button
                        type="button"
                        onClick={() => !isViewMode && formik.setFieldValue('socialMedia', [...formik.values.socialMedia, { title: '', icon: 'Globe', link: '' }])}
                        style={{ padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        + Add Channel
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formik.values.socialMedia.length === 0 && <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', py: 2 }}>No social links added yet.</p>}
                      {formik.values.socialMedia.map((sm, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Platform (e.g. Instagram)"
                            value={sm.title}
                            onChange={(e) => {
                              const next = [...formik.values.socialMedia];
                              next[idx].title = e.target.value;
                              formik.setFieldValue('socialMedia', next);
                            }}
                            style={{ height: '36px', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="https://..."
                            value={sm.link}
                            onChange={(e) => {
                              const next = [...formik.values.socialMedia];
                              next[idx].link = e.target.value;
                              formik.setFieldValue('socialMedia', next);
                            }}
                            style={{ height: '36px', fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = formik.values.socialMedia.filter((_, i) => i !== idx);
                              formik.setFieldValue('socialMedia', next);
                            }}
                            style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
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
                      <input id="idCardUploadInput" type="file" style={{ display: 'none' }} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => handleNestedFileChange(e, 'idCardFile', 'idCardPreview')} />
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
                <div className="form-group" style={{ position: 'relative', marginBottom: 0 }}>
                  <label>City/Town *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search city..."
                    disabled={isViewMode}
                    value={formik.values.address.city}
                    onChange={(e) => handleCitySearch(e.target.value)}
                    style={{ ...getInputFieldStyle('address.city'), height: '48px', fontSize: '14px', borderRadius: '12px' }}
                  />
                  {isSearchingCity && <div style={{ position: 'absolute', right: '12px', top: '38px' }}><div className="spinner-small" /></div>}
                  {citySuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '4px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      {citySuggestions.map((s, i) => (
                        <div
                          key={i}
                          onClick={() => selectCitySuggestion(s)}
                          style={{ padding: '12px 16px', fontSize: '12px', borderBottom: i === citySuggestions.length - 1 ? 'none' : '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}
                          onMouseEnter={(e) => e.target.style.background = 'var(--bg-main)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          <MapPin size={12} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                          {s.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                  {getFieldError('address.city')}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Country *</label>
                  <select
                    className="form-control select-premium"
                    disabled={isViewMode}
                    {...formik.getFieldProps('address.country')}
                    style={{ ...getInputFieldStyle('address.country'), height: '48px', fontSize: '14px', borderRadius: '12px', cursor: 'pointer', appearance: 'none', background: 'var(--bg-card) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 16px center' }}
                    onChange={(e) => {
                      formik.setFieldValue('address.country', e.target.value);
                      formik.setFieldValue('address.state', '');
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.length > 0 ? countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>) : <option disabled>{locationsLoading ? 'Loading countries...' : 'No countries found'}</option>}
                  </select>
                  {getFieldError('address.country')}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>State *</label>
                  <select
                    className="form-control select-premium"
                    disabled={isViewMode || !formik.values.address.country}
                    {...formik.getFieldProps('address.state')}
                    style={{ ...getInputFieldStyle('address.state'), height: '48px', fontSize: '14px', borderRadius: '12px', cursor: 'pointer', appearance: 'none', background: 'var(--bg-card) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 16px center' }}
                  >
                    <option value="">Select State</option>
                    {(() => {
                      const filteredStates = states.filter(s => {
                        const countryId = typeof s.country === 'object' ? s.country?._id : s.country;
                        return countryId === formik.values.address.country;
                      });
                      return filteredStates.length > 0 
                        ? filteredStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>) 
                        : <option disabled>{!formik.values.address.country ? 'Choose country first' : (locationsLoading ? 'Loading states...' : 'No states available')}</option>;
                    })()}
                  </select>
                  {getFieldError('address.state')}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Zip/Postal Code</label>
                  <input type="text" className="form-control" disabled={isViewMode} {...formik.getFieldProps('address.zipCode')} />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>Map Marked Position (Latitude & Longitude)</h4>
                <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <MapContainer
                    center={[formik.values.address.latitude || 10.8505, formik.values.address.longitude || 76.2711]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapPicker
                      latitude={formik.values.address.latitude}
                      longitude={formik.values.address.longitude}
                      onPositionChange={(latlng) => {
                        if (!isViewMode) {
                          formik.setFieldValue('address.latitude', latlng.lat);
                          formik.setFieldValue('address.longitude', latlng.lng);
                        }
                      }}
                    />
                  </MapContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>Latitude</label>
                    <input type="number" readOnly className="form-control" value={formik.values.address.latitude || ''} />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input type="number" readOnly className="form-control" value={formik.values.address.longitude || ''} />
                  </div>
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
                      <input id="gstFileUpload" type="file" style={{ display: 'none' }} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => handleNestedFileChange(e, 'gstFile', 'gstPreview')} />
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
                      <input id="tinFileUpload" type="file" style={{ display: 'none' }} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => handleNestedFileChange(e, 'tinFile', 'tinPreview')} />
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
                      <input id="bankFileUpload" type="file" style={{ display: 'none' }} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => handleNestedFileChange(e, 'bankFile', 'bankPreview')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SECURITY & KYC */}
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
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={32} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>Review Your Application</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Please double-check all details before finalizing your registration. Documents can be previewed by clicking on them.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                
                {/* 1. ACCOUNT & LOGOS */}
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '24px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={18} /> Partner Credentials
                  </h4>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px' }}>
                    <img src={imagePreview || 'https://ui-avatars.com/api/?name=User&background=random'} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} alt="Partner" />
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '16px' }}>{formik.values.name || 'N/A'}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{formik.values.email || 'N/A'}</p>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>Role: Vendor Partner</p>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--text-muted)' }}>Company Branding</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[{ label: 'Small', url: formik.values.logoSPreview }, { label: 'Mid', url: formik.values.logoMPreview }, { label: 'Large', url: formik.values.logoLPreview }].map((logo, idx) => (
                      <div key={idx} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-main)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 8px' }}>{logo.label}</p>
                        {logo.url ? (
                          <img src={logo.url} style={{ width: '100%', height: '40px', objectFit: 'contain', cursor: 'pointer' }} onClick={() => setLightbox(logo.url)} alt="Logo" />
                        ) : <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No file</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. BUSINESS PROFILE */}
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '24px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building size={18} /> Business & Logistics
                  </h4>
                  {renderReviewItem('Legal Entity', formik.values.companyName)}
                  {renderReviewItem('Business Type', formik.values.vendorType)}
                  {renderReviewItem('License Ref.', formik.values.businessLicense)}
                  {renderReviewItem('Internal Zone', formik.values.zone)}
                  
                  <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(79, 70, 229, 0.03)', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>SPOC (Point of Contact)</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{formik.values.spoc?.name || 'N/A'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{formik.values.spoc?.phone} • {formik.values.spoc?.email}</p>
                  </div>
                </div>

                {/* 3. FINANCIALS & DOCUMENTS */}
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '24px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={18} /> Compliance Documents
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '16px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '800', marginBottom: '8px' }}>GST DOCUMENT</p>
                      {formik.values.gstPreview ? (
                        <div onClick={() => setLightbox(formik.values.gstPreview)} style={{ cursor: 'pointer' }}>
                           <img src={formik.values.gstPreview} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '8px' }} alt="GST" />
                           <p style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', margin: 0 }}>{formik.values.gst?.number || 'VIEW'}</p>
                        </div>
                      ) : <span style={{ fontSize: '11px' }}>Not Uploaded</span>}
                    </div>
                    <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '16px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '800', marginBottom: '8px' }}>TIN DOCUMENT</p>
                      {formik.values.tinPreview ? (
                        <div onClick={() => setLightbox(formik.values.tinPreview)} style={{ cursor: 'pointer' }}>
                           <img src={formik.values.tinPreview} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '8px' }} alt="TIN" />
                           <p style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', margin: 0 }}>{formik.values.tin?.number || 'VIEW'}</p>
                        </div>
                      ) : <span style={{ fontSize: '11px' }}>Not Uploaded</span>}
                    </div>
                    <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '16px', gridColumn: 'span 2' }}>
                      <p style={{ fontSize: '10px', fontWeight: '800', marginBottom: '8px' }}>BANK DETAILS & PROOF</p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                         {formik.values.bankPreview && <img src={formik.values.bankPreview} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setLightbox(formik.values.bankPreview)} alt="Bank" />}
                         <div>
                            <p style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>{formik.values.bankDetails?.bankName || 'N/A'}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>ACC: {formik.values.bankDetails?.accountNumber}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>IFSC: {formik.values.bankDetails?.ifscCode}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. PLATFORM & SERVICES */}
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '24px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Star size={18} /> Platform Integration
                  </h4>
                  {renderReviewItem('Subscription', subscriptions.find(s => s._id === formik.values.subscription)?.title || 'Free Plan')}
                  {renderReviewItem('KYC Status', formik.values.kycStatus)}
                  
                  <p style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>Enabled Service Modules</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(formik.values.selectedServices || []).length > 0 ? (
                      formik.values.selectedServices.map(sid => {
                        const srv = (services || []).find(s => s._id === sid);
                        return (
                          <div key={sid} style={{ padding: '6px 12px', background: 'var(--primary)', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                            {srv?.title || 'Module'}
                          </div>
                        )
                      })
                    ) : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No services selected.</span>}
                  </div>
                </div>

              </div>

              <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '24px', borderWidth: '1px', borderStyle: 'dashed', borderColor: '#22c55e', textAlign: 'center' }}>
                <p style={{ fontSize: '15px', color: '#166534', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <CheckCircle size={24} /> Application Ready. By clicking "Finalize", you confirm all details are accurate.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border)', paddingTop: '24px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', flex: 1, textTransform: 'uppercase' }}>
              MAX PAYLOAD: 100MB | FILE LIMIT: 50MB
            </div>
            {currentStep > 1 && (
              <button type="button" className="btn" style={{ height: '48px', padding: '0 32px', background: 'var(--bg-main)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', fontWeight: '600' }} onClick={handlePrev}>
                Back Segment
              </button>
            )}
            {/* ... other buttons ... */}
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
