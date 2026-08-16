import React, { useState } from 'react';
import { X, Sparkles, Users, Calendar, ShieldCheck, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, onSwitchToDemo }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'Step 1 of 3 • Routine & Timing Alignment',
      title: 'Outings Matched to Real Routines & Dublin Hours',
      description: 'Say goodbye to late-night friction. Amiga matches outings to your actual weekly schedule—whether it is Early Lunch (12:00 PM), Wednesday Post-Office Dance Class (wrapping by 8:30 PM), or Monday Maternity Morning Strolls.',
      icon: 'schedule',
      image: '/images/scrapbook_coffee_walk.jpg',
      highlight: 'Dublin Closing Hours Protected'
    },
    {
      badge: 'Step 2 of 3 • Psychological Safety',
      title: 'Connection Tiers & "Met Before" Tagging',
      description: 'Never worry about "Who else is coming?". Tag attendees as "Met Before ✓" or "First Time Intro 👋" and group outings into Core Squad, Mixed Circle, or 1:1 Catchups.',
      icon: 'groups',
      image: '/images/scrapbook_pottery.jpg',
      highlight: 'Zero Social Anxiety'
    },
    {
      badge: 'Step 3 of 3 • Zero Invisible Labor',
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
      <div className="modal-content max-w-xl p-0 overflow-hidden">
        
        {/* Banner Header */}
        <div className="relative aspect-[16/9] w-full bg-[#2C221E] overflow-hidden">
          <img 
            src={step.image} 
            alt={step.title}
            className="w-full h-full object-cover opacity-85" 
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="tape-strip tape-top-center"></div>

          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="inline-block bg-[#F9E076] text-[#4A3E00] text-xs font-bold px-3 py-1 rounded-full shadow-md font-mono mb-2">
              {step.badge}
            </div>
            <h2 className="text-2xl font-black font-display text-white drop-shadow-md leading-tight">
              {step.title}
            </h2>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5] space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#C85A65] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">{step.icon}</span>
              {step.highlight}
            </span>
            <p className="text-xs sm:text-sm text-[#2C221E] font-medium leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentStep ? 'w-8 bg-[#C85A65]' : 'w-2 bg-[#E0D4C5]'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#F3ECE0]">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`btn text-xs font-bold ${
                currentStep === 0 ? 'opacity-30 cursor-not-allowed btn-secondary' : 'btn-secondary'
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
                className="btn bg-[#FAF6F0] text-[#6C5E58] hover:text-[#2C221E] border border-[#E0D4C5] text-xs font-bold"
              >
                🌟 Load Demo Mode
              </button>

              <button
                onClick={handleNext}
                className="btn btn-primary text-xs font-bold shadow-md"
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
