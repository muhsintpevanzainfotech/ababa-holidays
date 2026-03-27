import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Camera, Send, Plus, Loader2, Star } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const SubmitTestimonial = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      customerName: '',
      customerDesignation: '',
      content: '',
      rating: 5,
      video: '',
      image: null,
    },
    validationSchema: Yup.object({
      customerName: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      customerDesignation: Yup.string()
        .required('Location or Designation is required'),
      content: Yup.string()
        .min(10, 'Review must be at least 10 characters long')
        .max(500, 'Review cannot exceed 500 characters')
        .required('Review content is required'),
      rating: Yup.number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5')
        .required('Rating is required'),
      video: Yup.string()
        .url('Must be a valid URL')
        .nullable(),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('customerName', values.customerName);
        formData.append('customerDesignation', values.customerDesignation);
        formData.append('content', values.content);
        formData.append('rating', values.rating);

        // Map requested defaults to hidden fields:
        formData.append('status', 'Approved');
        formData.append('isTopPick', 'true');
        // 'vendor' is mapped to 'null' by sending an empty string or omitting it.
        // The backend handles req.body.vendor || null.

        if (values.video) formData.append('video', values.video);
        if (values.image) formData.append('image', values.image);

        // We use axios directly to bypass the protected API interceptor if needed
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await axios.post(`${apiUrl}/testimonials/submit`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setIsSuccess(true);
        showToast('Success', 'Thank you! Your review has been submitted.', 'success');
        resetForm();
        setImagePreview(null);
      } catch (error) {
        showToast('Error', error.response?.data?.message || 'Failed to submit review. Try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
         showToast('Error', 'Image should not exceed 2MB', 'error');
         return;
      }
      formik.setFieldValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
         <div className="card fade-in" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
               <img src={`https://ui-avatars.com/api/?name=${formik.values.customerName}&background=22c55e&color=fff&rounded=true`} alt="Success avatar" style={{ width: '100%', borderRadius: '50%' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px' }}>Review Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
              Thank you for sharing your experience with us. We truly appreciate your input!
            </p>
            <button className="btn btn-primary" onClick={() => setIsSuccess(false)} style={{ width: '100%', padding: '14px' }}>
               Submit Another Review
            </button>
         </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="card fade-in" style={{ maxWidth: '600px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Share Your Experience</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Help us improve and let others know about your trip!</p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div 
              style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: formik.errors.image && formik.touched.image ? '2px solid #ef4444' : '2px dashed #cbd5e1' }}
              onClick={() => document.getElementById('review-photo').click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Customer Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                   <Camera size={32} style={{ margin: 'auto' }} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', marginTop: '12px', cursor: 'pointer' }} onClick={() => document.getElementById('review-photo').click()}>
              Add your Photo (Optional)
            </p>
            <input 
              id="review-photo" type="file" accept="image/*" hidden 
              onChange={handleImageChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                name="customerName"
                className={`form-control ${formik.touched.customerName && formik.errors.customerName ? 'is-invalid' : ''}`}
                placeholder="e.g. John Doe"
                value={formik.values.customerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.customerName && formik.errors.customerName && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formik.errors.customerName}</div>
              )}
            </div>
            <div className="form-group">
              <label>Location / Designation <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                name="customerDesignation"
                className={`form-control ${formik.touched.customerDesignation && formik.errors.customerDesignation ? 'is-invalid' : ''}`}
                placeholder="e.g. Mumbai, India"
                value={formik.values.customerDesignation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.customerDesignation && formik.errors.customerDesignation && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formik.errors.customerDesignation}</div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Rate Your Experience <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'inline-flex', gap: '8px' }}>
               {[1, 2, 3, 4, 5].map(val => (
                 <button 
                   type="button"
                   key={val}
                   onClick={() => formik.setFieldValue('rating', val)}
                   style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'transform 0.2s' }}
                   className="hover-scale"
                 >
                   <Star size={32} fill={val <= formik.values.rating ? '#fbbf24' : 'none'} color={val <= formik.values.rating ? '#fbbf24' : '#cbd5e1'} />
                 </button>
               ))}
            </div>
            {formik.touched.rating && formik.errors.rating && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formik.errors.rating}</div>
            )}
          </div>

          <div className="form-group">
            <label>Your Review <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea 
              name="content"
              className={`form-control ${formik.touched.content && formik.errors.content ? 'is-invalid' : ''}`}
              placeholder="Tell us about your trip..."
              style={{ minHeight: '120px', resize: 'vertical' }}
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.content && formik.errors.content && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formik.errors.content}</div>
            )}
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
               {formik.values.content.length} / 500
            </div>
          </div>

          <div className="form-group">
            <label>Video Review URL (Optional)</label>
            <input 
              type="url" 
              name="video"
              className={`form-control ${formik.touched.video && formik.errors.video ? 'is-invalid' : ''}`}
              placeholder="e.g. YouTube or Instagram Reels Link"
              value={formik.values.video}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.video && formik.errors.video && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formik.errors.video}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '52px', fontSize: '16px', fontWeight: '700', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Submitting...</>
            ) : (
              <><Send size={20} /> Publish Review</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SubmitTestimonial;
