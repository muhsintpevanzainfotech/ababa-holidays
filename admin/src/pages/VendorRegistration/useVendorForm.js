import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/constants';
import api from '../../utils/api';
import { fetchServicesRequest } from '../../store/slices/servicesSlice';
import { fetchSubscriptionsRequest } from '../../store/slices/subscriptionsSlice';
import { fetchCountriesRequest, fetchStatesRequest } from '../../store/slices/locationsSlice';

export const useVendorForm = (isPublic = false) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view/');
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [isDragging, setIsDragging] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingVendorData, setLoadingVendorData] = useState(false);

  const { vendors, loading: vendorsLoading } = useSelector(state => state.vendors);
  const { services, loading: servicesLoading } = useSelector(state => state.services || { services: [] });
  const { subscriptions, loading: subsLoading } = useSelector(state => state.subscriptions || { subscriptions: [] });
  const { brands } = useSelector(state => state.brands || { brands: [] });
  const { countries = [], loading: countriesLoading } = useSelector(state => state.countries || {});
  const { states = [], loading: statesLoading } = useSelector(state => state.states || {});

  useEffect(() => {
    if (!services || services.length === 0) {
      dispatch(fetchServicesRequest());
    }
    if (!subscriptions || subscriptions.length === 0) {
      dispatch(fetchSubscriptionsRequest());
    }
    if (!countries || countries.length === 0) {
      dispatch(fetchCountriesRequest({ limit: 1000, all: 'true' }));
    }
    if (!states || states.length === 0) {
      dispatch(fetchStatesRequest({ limit: 1000, all: 'true' }));
    }
  }, [dispatch]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Full Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
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

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'Vendor',
      avatar: null,
      companyName: '',
      vendorType: 'Travel Agent',
      description: '',
      businessLicense: '',
      zone: '',
      logoS: null,
      logoM: null,
      logoL: null,
      logoSPreview: null,
      logoMPreview: null,
      logoLPreview: null,
      spoc: { name: '', phone: '', email: '' },
      address: { fullAddress: '', city: '', state: '', country: '', zipCode: '', latitude: null, longitude: null },
      bankDetails: { bankName: '', accountName: '', accountNumber: '', ifscCode: '', branch: '' },
      gst: { number: '', file: null },
      tin: { number: '', file: null },
      bankFile: null,
      idCardFile: null,
      gstPreview: null,
      tinPreview: null,
      bankPreview: null,
      idCardPreview: null,
      kycStatus: 'Pending',
      isApproved: false,
      seo: { title: '', description: '', keywords: '' },
      subscriptionPlan: 'Free',
      subscription: '',
      selectedServices: [],
      packageCommission: {
        rate: 0,
        type: 'Percentage'
      },
      socialMedia: [{ platform: '', url: '' }]
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsFinalizing(true);
        const formData = new FormData();
        
        // Append nested objects and primitives
        Object.keys(values).forEach(key => {
          if (['spoc', 'address', 'bankDetails', 'seo', 'gst', 'tin', 'packageCommission'].includes(key)) {
            formData.append(key, JSON.stringify(values[key]));
          } else if (['socialMedia', 'selectedServices'].includes(key)) {
            formData.append(key, JSON.stringify(values[key]));
          } else if (!(values[key] instanceof File) && !key.includes('Preview')) {
            // Skip empty password on edit
            if (key === 'password' && id && !values[key]) return;
            formData.append(key, values[key]);
          }
        });

        // Append Files
        if (values.avatar instanceof File) formData.append('avatar', values.avatar);
        if (values.logoS instanceof File) formData.append('logoS', values.logoS);
        if (values.logoM instanceof File) formData.append('logoM', values.logoM);
        if (values.logoL instanceof File) formData.append('logoL', values.logoL);
        if (values.gst?.file instanceof File) {
          formData.append('gstFile', values.gst.file);
          formData.append('gstUpload', values.gst.file);
        }
        if (values.tin?.file instanceof File) {
          formData.append('tinFile', values.tin.file);
          formData.append('tinUpload', values.tin.file);
        }
        if (values.bankFile instanceof File) {
          formData.append('bankFile', values.bankFile);
          formData.append('bankUpload', values.bankFile);
        }
        if (values.idCardFile instanceof File) {
          formData.append('idCardFile', values.idCardFile);
          formData.append('idCard', values.idCardFile);
        }

        if (id) {
          await api.put(`/vendors/${id}`, formData);
          showToast('Success', 'Vendor profile updated successfully', 'success');
          navigate('/vendors');
        } else {
          await api.post('/vendors/register', formData);
          showToast('Success', 'Vendor registration submitted successfully', 'success');
          if (isPublic) navigate('/login');
          else navigate('/vendors');
        }
      } catch (error) {
        showToast('Error', error.response?.data?.message || 'Operation failed', 'error');
      } finally {
        setIsFinalizing(false);
      }
    }
  });

  // Fetch Vendor Data when editing or viewing (id present)
  useEffect(() => {
    if (!id) return;
    const loadVendor = async () => {
      try {
        setLoadingVendorData(true);
        const response = await api.get(`/vendors/${id}`);
        const data = response.data?.data || response.data;
        if (data) {
          const profile = data.profile || {};
          const addr = profile.address || {};
          const bank = profile.bankDetails || {};
          const gstObj = profile.gst || {};
          const tinObj = profile.tin || {};
          const spocObj = profile.spoc || {};
          const seoObj = profile.seo || {};

          formik.setValues({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            password: '',
            role: 'Vendor',
            avatar: null,
            companyName: profile.companyName || '',
            vendorType: profile.vendorType || 'Travel Agent',
            description: profile.description || '',
            businessLicense: profile.businessLicense || '',
            zone: profile.zone || '',
            logoS: null,
            logoM: null,
            logoL: null,
            logoSPreview: profile.companylogos?.small ? getImageUrl(profile.companylogos.small) : null,
            logoMPreview: profile.companylogos?.medium ? getImageUrl(profile.companylogos.medium) : null,
            logoLPreview: profile.companylogos?.large ? getImageUrl(profile.companylogos.large) : null,
            spoc: {
              name: spocObj.name || '',
              phone: spocObj.phone || '',
              email: spocObj.email || ''
            },
            address: {
              fullAddress: addr.fullAddress || '',
              city: addr.city || '',
              state: addr.state?._id || addr.state || '',
              country: addr.country?._id || addr.country || '',
              zipCode: addr.zipCode || '',
              latitude: addr.latitude || null,
              longitude: addr.longitude || null
            },
            bankDetails: {
              bankName: bank.bankName || '',
              accountName: bank.accountName || '',
              accountNumber: bank.accountNumber || '',
              ifscCode: bank.ifscCode || '',
              branch: bank.branch || bank.branchName || ''
            },
            gst: { number: gstObj.number || '', file: null },
            tin: { number: tinObj.number || '', file: null },
            bankFile: null,
            idCardFile: null,
            gstPreview: gstObj.upload ? getImageUrl(gstObj.upload) : null,
            tinPreview: tinObj.upload ? getImageUrl(tinObj.upload) : null,
            bankPreview: bank.upload ? getImageUrl(bank.upload) : null,
            idCardPreview: profile.idCard ? getImageUrl(profile.idCard) : null,
            kycStatus: profile.kycStatus || 'Pending',
            isApproved: profile.isApproved || false,
            seo: {
              title: seoObj.title || '',
              description: seoObj.description || '',
              keywords: Array.isArray(seoObj.keywords) ? seoObj.keywords.join(', ') : (seoObj.keywords || '')
            },
            subscriptionPlan: profile.subscriptionPlan || 'Free',
            subscription: profile.subscription?._id || profile.subscription || '',
            selectedServices: Array.isArray(profile.selectedServices)
              ? profile.selectedServices.map(s => (typeof s === 'object' ? s._id : s))
              : [],
            packageCommission: {
              rate: profile.packageCommission?.rate !== undefined ? profile.packageCommission.rate : 0,
              type: profile.packageCommission?.type || 'Percentage'
            },
            socialMedia: profile.socialMedia || [{ platform: '', url: '' }]
          });

          if (data.avatar) {
            setImagePreview(getImageUrl(data.avatar));
          }
        }
      } catch (err) {
        showToast('Error', 'Failed to load vendor details', 'error');
      } finally {
        setLoadingVendorData(false);
      }
    };
    loadVendor();
  }, [id]);

  const handleNext = async () => {
    const fieldsByStep = {
      1: ['name', 'email', 'phone', ...(id ? [] : ['password'])],
      2: ['companyName', 'vendorType', 'description', 'spoc.name', 'spoc.phone'],
      3: ['address.fullAddress', 'address.city', 'address.state', 'address.country'],
      6: ['subscription']
    };

    const fieldsToValidate = fieldsByStep[currentStep] || [];
    if (fieldsToValidate.length > 0) {
      const errors = await formik.validateForm();
      const stepErrors = fieldsToValidate.some(field => {
        const parts = field.split('.');
        return parts.length > 1 ? errors[parts[0]]?.[parts[1]] : errors[field];
      });

      if (stepErrors) {
        showToast('Validation Error', 'Please complete all required fields correctly before proceeding', 'warning');
        formik.setTouched(fieldsToValidate.reduce((acc, f) => {
          if (f.includes('.')) {
            const [p1, p2] = f.split('.');
            acc[p1] = { ...acc[p1], [p2]: true };
          } else acc[f] = true;
          return acc;
        }, {}));
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 7));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNestedFileChange = (e, fileKey, previewKey) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue(previewKey, reader.result);
        if (fileKey.includes('.')) {
          const [parent, child] = fileKey.split('.');
          formik.setFieldValue(parent, { ...formik.values[parent], [child]: file });
        } else {
          formik.setFieldValue(fileKey, file);
        }
        if (fileKey === 'avatar') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Clear file and preview
      formik.setFieldValue(previewKey, null);
      if (fileKey.includes('.')) {
        const [parent, child] = fileKey.split('.');
        formik.setFieldValue(parent, { ...formik.values[parent], [child]: null });
      } else {
        formik.setFieldValue(fileKey, null);
      }
      if (fileKey === 'avatar') {
        setImagePreview(null);
      }
    }
  };

  const handleDrop = (e, fileKey, previewKey, callback) => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue(previewKey, reader.result);
        if (fileKey.includes('.')) {
          const [parent, child] = fileKey.split('.');
          formik.setFieldValue(parent, { ...formik.values[parent], [child]: file });
        } else {
          formik.setFieldValue(fileKey, file);
        }
        if (fileKey === 'avatar') {
          setImagePreview(reader.result);
        }
        if (callback) callback(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayToggle = (key, val) => {
    const current = [...(formik.values[key] || [])];
    const idx = current.indexOf(val);
    if (idx > -1) current.splice(idx, 1);
    else current.push(val);
    formik.setFieldValue(key, current);
  };

  return {
    formik, currentStep, setCurrentStep, handleNext, handlePrev,
    imagePreview, setImagePreview, isFinalizing, lightbox, setLightbox,
    isDragging, setIsDragging, citySuggestions, setCitySuggestions,
    isSearchingCity, setIsSearchingCity, showPassword, setShowPassword,
    loadingVendorData, isViewMode, navigate, id, vendors, vendorsLoading,
    services, servicesLoading, subscriptions, subsLoading,
    brands, countries, states, handleNestedFileChange, handleDrop, handleArrayToggle
  };
};
