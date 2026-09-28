import { Check, User, Briefcase, MapPin, CreditCard, ShieldCheck, Star, Info } from 'lucide-react';

export const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Account', icon: <User size={18} /> },
    { num: 2, label: 'Business', icon: <Briefcase size={18} /> },
    { num: 3, label: 'Location', icon: <MapPin size={18} /> },
    { num: 4, label: 'Banking/Tax', icon: <CreditCard size={18} /> },
    { num: 5, label: 'Trust/SEO', icon: <ShieldCheck size={18} /> },
    { num: 6, label: 'Services', icon: <Star size={18} /> },
    { num: 7, label: 'Review', icon: <Info size={18} /> }
  ];

  return (
    <div style={{ marginBottom: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {/* Progress Line */}
        <div style={{ position: 'absolute', top: '24px', left: '5%', right: '5%', height: '2px', background: 'var(--border)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '24px', left: '5%', width: ((currentStep - 1) * (90 / 6)) + '%', height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />

        {steps.map((step) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          return (
            <div key={step.num} style={{ textAlign: 'center', position: 'relative', zIndex: 2, width: '60px', opacity: currentStep >= step.num ? 1 : 0.5, transition: '0.3s' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '16px', 
                background: isCompleted ? 'var(--primary)' : (isActive ? 'var(--primary)' : 'var(--bg-card)'), 
                color: (isActive || isCompleted) ? '#fff' : 'var(--text-muted)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 12px', fontWeight: '800', 
                boxShadow: isActive ? '0 10px 20px rgba(var(--primary-rgb), 0.3)' : '0 4px 6px rgba(0,0,0,0.05)',
                border: isActive ? 'none' : '1px solid var(--border)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)'
              }}>
                {isCompleted ? <Check size={20} strokeWidth={3} /> : (isActive ? step.icon : step.num)}
              </div>
              <p style={{ 
                fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', 
                color: isActive ? 'var(--primary)' : 'var(--text-muted)', 
                letterSpacing: '0.1em', transition: '0.3s' 
              }}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
