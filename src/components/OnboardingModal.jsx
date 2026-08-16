import React, { useState } from 'react';
import { X, Sparkles, Users, Calendar, ShieldCheck, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, onSwitchToDemo }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'Step 1 of 3: Routine & Timing Alignment',
      title: 'Outings Matched to Real Routines & Dublin Hours',
      description: 'Say goodbye to late-night friction. Amiga matches outings to your actual weekly schedule: whether it is Early Lunch (12:00 PM), Wednesday Post-Office Dance Class (wrapping by 8:30 PM), or Monday Maternity Morning Strolls.',
      icon: 'schedule',
      image: '/images/scrapbook_coffee_walk.jpg',
      highlight: 'Dublin Closing Hours Protected'
    },
    {
      badge: 'Step 2 of 3: Psychological Safety',
      title: 'Connection Tiers & "Met Before" Tagging',
      description: 'Never worry about "Who else is coming?". Tag attendees as "Met Before ✓" or "First Time Intro 👋" and group outings into Core Squad, Mixed Circle, or 1:1 Catchups.',
      icon: 'groups',
      image: '/images/scrapbook_pottery.jpg',
      highlight: 'Zero Social Anxiety'
    },
    {
      badge: 'Step 3 of 3: Zero Invisible Labor',
      title: '1-Click Calendar Sync & Revolut Split Bill Tags',
      description: '1-Click Google Calendar & iCal sync, instant WhatsApp group chat share links, and Revolut split bill tags mean zero host nagging and zero money awkwardness.',
      icon: 'auto_awesome',
      image: '/images/scrapbook_afternoon_tea.jpg',
      highlight: 'Zero Planning Fatigue'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl p-0 overflow-hidden border-3 border-[#09090B] shadow-[8px_8px_0px_#09090B]">
        
        {/* Banner Header */}
        <div className="relative aspect-[16/9] w-full bg-[#09090B] overflow-hidden">
          <img 
            src={step.image} 
            alt={step.title}
            className="w-full h-full object-cover opacity-85" 
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer border border-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="tape-strip tape-top-center"></div>

          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="inline-block bg-[#FEF3C7] text-[#09090B] text-xs font-black px-3 py-1 rounded-full shadow-md font-mono mb-2 border border-[#09090B]">
              {step.badge}
            </div>
            <h2 className="text-2xl font-black font-display text-white drop-shadow-md leading-tight">
              {step.title}
            </h2>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          
          <div className="p-4 rounded-xl bg-[#FAFAFA] border-2 border-[#09090B] space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5 font-display">
              <span className="material-symbols-outlined text-base">{step.icon}</span>
              {step.highlight}
            </span>
            <p className="text-xs sm:text-sm text-[#09090B] font-semibold leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2.5 rounded-full transition-all cursor-pointer border border-[#09090B] ${
                  i === currentStep ? 'w-8 bg-[#2563EB]' : 'w-2.5 bg-[#E4E4E7]'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-[#09090B]/10">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`btn-pop-secondary text-xs ${
                currentStep === 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSwitchToDemo();
                  onClose();
                }}
                className="btn-pop-secondary text-xs"
              >
                🌟 Load Demo Mode
              </button>

              <button
                onClick={handleNext}
                className="btn-pop-primary text-xs"
              >
                {currentStep === steps.length - 1 ? 'Start Planning' : 'Next Step'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
