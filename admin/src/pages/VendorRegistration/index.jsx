import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, Check, ShieldCheck, 
  X, CheckCircle, Briefcase, Building, MapPin, 
  CreditCard, Search, Star, Plus, Minus, ArrowLeft
} from 'lucide-react';

import { useVendorForm } from './useVendorForm';
import { useConfirm } from '../../context/ConfirmDialogContext';
import { StepIndicator } from './components/StepIndicator';
import { Lightbox } from './components/Lightbox';

// Step Components
import Step1Account from './steps/Step1Account';
import Step3Location from './steps/Step3Location';
import Step4Compliance from './steps/Step4Compliance';
import Step5Security from './steps/Step5Security';
import Step6Services from './steps/Step6Services';
import Step7Review from './steps/Step7Review';

const VendorRegistration = ({ isPublic = false }) => {
  const formState = useVendorForm(isPublic);
  const { confirm } = useConfirm();
  const { 
    formik, currentStep, handleNext, handlePrev, 
    lightbox, setLightbox, isFinalizing, isViewMode, 
    loadingVendorData, navigate, id 
  } = formState;

  const handleCancelExit = async () => {
    if (isViewMode) {
      navigate('/vendors');
      return;
    }
    const isConfirmed = await confirm(
      'Exit Vendor Onboarding?',
      'Are you sure you want to exit? Any unsaved registration data will be lost.',
      {
        confirmText: 'Discard & Exit',
        variant: 'warning'
      }
    );
    if (isConfirmed) {
      if (isPublic) navigate('/login');
      else navigate('/vendors');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Account {...formState} isPublic={isPublic} />;
      case 2: return <Step3Location {...formState} isPublic={isPublic} />;
      case 3: return <Step4Compliance {...formState} isPublic={isPublic} />;
      case 4: return <Step5Security {...formState} isPublic={isPublic} />;
      case 5: return <Step6Services {...formState} isPublic={isPublic} />;
      case 6: return <Step7Review {...formState} isPublic={isPublic} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '60px 20px' }}>
      
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '8px 20px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src="/logo.png" alt="Ababa Travels Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>ABABA <span style={{ color: 'var(--primary)' }}>TRAVELS</span></span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>
          {isPublic ? 'Vendor Partner Onboarding' : (id ? (isViewMode ? 'Vendor Dossier' : 'Refine Vendor Protocol') : 'Onboard New Partner')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.5 }}>
          Expand your reach and join our global network of travel professionals. Complete the registration below to get started.
        </p>
      </div>

      <div className="card allow-overflow" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', overflow: 'visible' }}>
        
        <StepIndicator currentStep={currentStep} />

        {loadingVendorData ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem', marginBottom: '16px' }} />
            <p style={{ fontWeight: '700', margin: 0 }}>Loading Vendor Dossier Data...</p>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '24px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', flex: '1 1 auto', minWidth: '160px' }}>
                Step {currentStep} of 6 &bull; All data encrypted & secure
              </div>

              {/* Exit / Cancel Button */}
              <button
                type="button"
                className="btn"
                onClick={handleCancelExit}
                style={{ height: '48px', padding: '0 20px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: '700', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Cancel and return"
              >
                <X size={16} /> Cancel
              </button>
              
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn" 
                  style={{ height: '48px', padding: '0 24px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: '700', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} 
                  onClick={handlePrev}
                >
                  <ChevronLeft size={18} /> Previous
                </button>
              )}

              {currentStep < 6 ? (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ height: '48px', padding: '0 36px', fontWeight: '700', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                  onClick={handleNext}
                >
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  type={isViewMode ? "button" : "submit"} 
                  className="btn btn-primary" 
                  style={{ height: '48px', padding: '0 36px', fontWeight: '800', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                  disabled={isFinalizing} 
                  onClick={() => isViewMode && navigate('/vendors')}
                >
                  {isFinalizing ? 'Saving...' : (isViewMode ? 'Audit Complete' : (id ? 'Update Vendor' : 'Submit Registration'))} <Check size={18} />
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <Lightbox lightbox={lightbox} setLightbox={setLightbox} />
    </div>
  );
};

export default VendorRegistration;
