import { MCATSection, StudyTask } from './types.ts';

export const SECTION_STYLES: Record<MCATSection, { bg: string, text: string, label: string, dot: string }> = {
  'Biology': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'BIOLOGY', dot: 'bg-emerald-500' },
  'Biochemistry': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'BIOCHEMISTRY', dot: 'bg-teal-500' },
  'General Chemistry': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'GEN CHEM', dot: 'bg-blue-500' },
  'Organic Chemistry': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'ORG CHEM', dot: 'bg-indigo-500' },
  'Physics': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'PHYSICS', dot: 'bg-purple-500' },
  'Behavioral Sciences': { bg: 'bg-rose-100', text: 'text-rose-700', label: 'BEHAVIORAL', dot: 'bg-rose-500' },
  'CARS': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'CARS', dot: 'bg-orange-500' },
  'Practice Exam': { bg: 'bg-slate-800', text: 'text-white', label: 'PRACTICE', dot: 'bg-slate-800' },
};

// Starting the week on Monday
export const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Helper to get local date string YYYY-MM-DD
export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const today = new Date();
const tStr = formatDateKey(today);

export const INITIAL_TASKS: StudyTask[] = [
  { id: '1', title: 'Amino Acids Review', description: 'Side chains and pKa', section: 'Biochemistry', completed: false, date: tStr, duration: '2h' },
  { id: '2', title: 'Enzyme Kinetics', description: 'Michaelis-Menten plots', section: 'Biology', completed: false, date: tStr, duration: '1h' },
  { id: '3', title: 'CARS Practice', description: '3 passages', section: 'CARS', completed: true, date: tStr, duration: '1.5h' },
];