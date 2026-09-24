import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, Check, ShieldCheck, 
  X, CheckCircle, Briefcase, Building, MapPin, 
  CreditCard, Search, Star, Plus, Minus
} from 'lucide-react';

import { useVendorForm } from './useVendorForm';
import { StepIndicator } from './components/StepIndicator';
import { Lightbox } from './components/Lightbox';

// Step Components
import Step1Account from './steps/Step1Account';
import Step2Business from './steps/Step2Business';
import Step3Location from './steps/Step3Location';
import Step4Compliance from './steps/Step4Compliance';
import Step5Security from './steps/Step5Security';
import Step6Services from './steps/Step6Services';
import Step7Review from './steps/Step7Review';

const VendorRegistration = ({ isPublic = false }) => {
  const formState = useVendorForm(isPublic);
  const { 
    formik, currentStep, handleNext, handlePrev, 
    lightbox, setLightbox, isFinalizing, isViewMode, 
    loadingVendorData, navigate, id
  } = formState;

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Account {...formState} />;
      case 2: return <Step2Business {...formState} />;
      case 3: return <Step3Location {...formState} />;
      case 4: return <Step4Compliance {...formState} />;
      case 5: return <Step5Security {...formState} />;
      case 6: return <Step6Services {...formState} />;
      case 7: return <Step7Review {...formState} />;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', flex: 1, textTransform: 'uppercase' }}>
                MAX PAYLOAD: 100MB | FILE LIMIT: 50MB
              </div>
              
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn" 
                  style={{ height: '48px', padding: '0 32px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: '700', borderRadius: '12px' }} 
                  onClick={handlePrev}
                >
                  Previous
                </button>
              )}

              {currentStep < 7 ? (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ height: '48px', padding: '0 40px', fontWeight: '700', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }} 
                  onClick={handleNext}
                >
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  type={isViewMode ? "button" : "submit"} 
                  className="btn btn-primary" 
                  style={{ height: '48px', padding: '0 40px', fontWeight: '800', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none' }} 
                  disabled={isFinalizing} 
                  onClick={() => isViewMode && navigate('/vendors')}
                >
                  {isFinalizing ? 'Saving...' : (isViewMode ? 'Audit Complete' : (id ? 'Update Vendor' : 'Finalize Registration'))}
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
