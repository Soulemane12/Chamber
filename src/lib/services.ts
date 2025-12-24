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
  | 'gray-matter-recovery-3mo'
  | 'gray-matter-recovery-6mo'
  | 'gray-matter-recovery-12mo'
  | 'optimal-wellness-3mo'
  | 'optimal-wellness-6mo'
  | 'optimal-wellness-12mo'
  | 'revitalize-wellness-3mo'
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
    id: 'gray-matter-performance-assessment',
    name: 'Gray Matter Performance Assessment',
    description: 'Analysis including VO₂ Max, body scans, workouts, and data-driven report',
    price: 1200,
  },
  {
    id: 'sample-day-pass',
    name: 'Midtown Biohack Sample Day Pass',
    description: 'Use of all equipment and one-on-one with Coach',
    price: 249,
  },
  {
    id: 'gray-matter-recovery-3mo',
    name: 'Gray Matter Recovery (3-month Commitment)',
    description: '3 months (12 sessions of recovery and workout)',
    price: 1499,
  },
  {
    id: 'gray-matter-recovery-6mo',
    name: 'Gray Matter Recovery (6-month Commitment)',
    description: '6 months (16 sessions of recovery and workout)',
    price: 2900,
  },
  {
    id: 'gray-matter-recovery-12mo',
    name: 'Gray Matter Recovery (12-month Commitment)',
    description: '12 months (48 sessions of recovery and workout)',
    price: 5800,
  },
  {
    id: 'optimal-wellness-3mo',
    name: 'Optimal Wellness (3-month Commitment)',
    description: '3 months (12 total sessions)',
    price: 2999,
  },
  {
    id: 'optimal-wellness-6mo',
    name: 'Optimal Wellness (6-month Commitment)',
    description: '6 months (24 total sessions)',
    price: 5900,
  },
  {
    id: 'optimal-wellness-12mo',
    name: 'Optimal Wellness (12-month Commitment)',
    description: '12 months (48 total sessions)',
    price: 10500,
  },
  {
    id: 'revitalize-wellness-3mo',
    name: 'Revitalize Wellness (3-month Commitment)',
    description: '3 months (12 total sessions)',
    price: 2099,
  },
  {
    id: 'revitalize-wellness-6mo',
    name: 'Revitalize Wellness (6-month Commitment)',
    description: '6 months (24 total sessions)',
    price: 4100,
  },
  {
    id: 'revitalize-wellness-12mo',
    name: 'Revitalize Wellness (12-month Commitment)',
    description: '12 months (48 total sessions)',
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
    description: '2-person recovery: recovery, red light, and wellness',
    price: 350,
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
