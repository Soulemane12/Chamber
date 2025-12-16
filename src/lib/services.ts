export type ServiceOption = {
  id: ServiceId;
  name: string;
  description?: string;
  price: number;
};

export type ServiceId =
  | 'morris-12-week'
  | 'wellness-consult'
  | 'sample-day-pass'
  | 'gray-matter-recovery-single'
  | 'gray-matter-recovery-4mo'
  | 'executive-recovery-single'
  | 'optimal-wellness-6mo'
  | 'optimal-wellness-12mo'
  | 'revitalize-wellness-6mo'
  | 'revitalize-wellness-12mo'
  | 'o2-hbot'
  | 'jet-lag-recovery'
  | 'business-client-recovery'
  | 'gray-matter-performance-assessment'
  | 'laboratory-session';

export const serviceOptions: ServiceOption[] = [
  {
    id: 'morris-12-week',
    name: '12 Week Morris Method Challenge',
    description: 'Wellness recovery and Gray Matter performance assessment',
    price: 3499,
  },
  {
    id: 'wellness-consult',
    name: 'Wellness Consultation',
    description: 'One on one consultation with Dr. Chuck (credit applied if signing up for other services)',
    price: 124,
  },
  {
    id: 'sample-day-pass',
    name: 'Midtown Biohack Sample Day Pass',
    description: 'Use of all equipment and one-on-one with Coach',
    price: 249,
  },
  {
    id: 'gray-matter-recovery-single',
    name: 'Gray Matter Recovery (Single Session)',
    description: 'Includes workout and recovery',
    price: 649,
  },
  {
    id: 'gray-matter-recovery-4mo',
    name: 'Gray Matter Recovery (4-month Commitment)',
    description: '4 months (16 total sessions)',
    price: 1999,
  },
  {
    id: 'executive-recovery-single',
    name: 'Executive Recovery (Single Session)',
    description: '2-hour recovery session',
    price: 1249,
  },
  {
    id: 'optimal-wellness-6mo',
    name: 'Optimal Wellness (6-month Commitment)',
    description: '6 months (24 sessions)',
    price: 5999,
  },
  {
    id: 'optimal-wellness-12mo',
    name: 'Optimal Wellness (12-month Commitment)',
    description: '12 months (48 sessions)',
    price: 10799,
  },
  {
    id: 'revitalize-wellness-6mo',
    name: 'Revitalize Wellness (6-month Commitment)',
    description: '6 months (24 sessions)',
    price: 4199,
  },
  {
    id: 'revitalize-wellness-12mo',
    name: 'Revitalize Wellness (12-month Commitment)',
    description: '12 months (48 sessions)',
    price: 7549,
  },
  {
    id: 'o2-hbot',
    name: 'O₂ Hyperbaric Box (HBOT)',
    description: 'Single session in hyperbaric chamber',
    price: 250,
  },
  {
    id: 'jet-lag-recovery',
    name: 'Jet Lag Recovery',
    description: 'Wellness recovery session built around increased performance',
    price: 400,
  },
  {
    id: 'business-client-recovery',
    name: 'Business Client Recovery',
    description: '2-person recovery: Hyperbaric Chamber, red light, and recovery',
    price: 350,
  },
  {
    id: 'gray-matter-performance-assessment',
    name: 'Gray Matter Performance Assessment',
    description: 'Analysis including VO₂ Max, body scans, workouts, and data-driven report',
    price: 1200,
  },
  {
    id: 'laboratory-session',
    name: 'Laboratory Session',
    description: 'Full blood chemistry panel',
    price: 500,
  },
];

export const getServiceById = (id?: string | null) =>
  serviceOptions.find((service) => service.id === id);
