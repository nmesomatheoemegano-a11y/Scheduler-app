import React from 'react';
import { StudyTask } from '../types.ts';

interface DeletePromptModalProps {
  task: StudyTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (task: StudyTask, scope: 'single' | 'future') => void;
  isDarkMode: boolean;
}

const DeletePromptModal: React.FC<DeletePromptModalProps> = ({ task, isOpen, onClose, onConfirm, isDarkMode }) => {
  if (!isOpen || !task) return null;

  const isRecurringInstance = !!task.groupId || !!task.originalTaskId;

  const surfaceBg = isDarkMode ? 'bg-[#16122b]' : 'bg-white';
  const borderCol = isDarkMode ? 'border-slate-800' : 'border-slate-100';
  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-800';
  const subTextColor = isDarkMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/80' : 'bg-slate-900/40'} backdrop-blur-md animate-in fade-in`}>
      <div className={`${surfaceBg} w-full max-w-sm rounded-[32px] p-8 shadow-2xl border ${borderCol} animate-in zoom-in-95`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-black ${textColor}`}>Delete Task</h2>
          <button onClick={onClose} className={`${subTextColor} hover:text-white transition-colors`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="space-y-6">
          <p className={`${textColor} font-medium`}>
            {isRecurringInstance 
              ? "This task is part of a sequence. Do you want to delete just this specific task, or the entire sequence (including future reviews)?"
              : "Are you sure you want to delete this task?"}
          </p>
          <div className="flex flex-col gap-3">
            {isRecurringInstance && (
              <button 
                onClick={() => { onConfirm(task, 'future'); onClose(); }}
                className="w-full bg-rose-600/10 text-rose-500 border border-rose-500/20 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
              >
                Delete Entire Sequence
              </button>
            )}
            <button 
              onClick={() => { onConfirm(task, 'single'); onClose(); }}
              className={`w-full ${isRecurringInstance ? 'bg-transparent border border-rose-500/20 text-rose-500' : 'bg-rose-600 text-white'} py-3 rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all`}
            >
              {isRecurringInstance ? 'Delete Just This Task' : 'Yes, Delete'}
            </button>
            <button 
              onClick={onClose}
              className={`w-full bg-transparent border ${borderCol} ${subTextColor} py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all mt-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePromptModal;
