import React, { useState, useEffect } from 'react';
import { StudyTask, MCATSection, RecurrenceType } from '../types.ts';
import { SECTION_STYLES } from '../constants.tsx';

interface EditTaskModalProps {
  task: Partial<StudyTask> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: StudyTask, scope?: 'single' | 'future') => void;
  onDelete?: (task: Partial<StudyTask>, scope?: 'single' | 'future') => void;
  isDarkMode: boolean;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave, onDelete, isDarkMode }) => {
  const [title, setTitle] = useState('');
  const [section, setSection] = useState<MCATSection>('Biology');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('None');
  const [customInterval, setCustomInterval] = useState(2);
  const [saveScope, setSaveScope] = useState<'single' | 'future'>('single');
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setSection(task.section || 'Biology');
      setDuration(task.duration || '');
      setDate(task.date || '');
      setRecurrence(task.recurrence || 'None');
      setCustomInterval(task.customInterval || 2);
      setSaveScope('single');
      setDeletePromptOpen(false);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const isChapter = title.toLowerCase().includes('chapter') && section !== 'CARS';
  const isRecurringInstance = !!task.groupId || !!task.originalTaskId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      ...task, 
      title, 
      section, 
      duration, 
      date, 
      recurrence, 
      customInterval: recurrence === 'Custom' ? customInterval : undefined 
    } as StudyTask, saveScope);
    onClose();
  };

  const surfaceBg = isDarkMode ? 'bg-[#16122b]' : 'bg-white';
  const inputBg = isDarkMode ? 'bg-[#0d0b1a]' : 'bg-slate-50';
  const borderCol = isDarkMode ? 'border-slate-800' : 'border-slate-100';
  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-800';
  const subTextColor = isDarkMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/80' : 'bg-slate-900/40'} backdrop-blur-md animate-in fade-in`}>
      <div className={`${surfaceBg} w-full max-w-md rounded-[32px] p-8 shadow-2xl border ${borderCol} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-black ${textColor}`}>{deletePromptOpen ? 'Delete Task' : 'Objective Details'}</h2>
          <button onClick={onClose} className={`${subTextColor} hover:text-white transition-colors`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>

        {deletePromptOpen ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <p className={`${textColor} font-medium`}>
              {isRecurringInstance 
                ? "This task is part of a sequence. Do you want to delete just this specific task, or the entire sequence (including future reviews)?"
                : "Are you sure you want to delete this task?"}
            </p>
            <div className="flex flex-col gap-3">
              {isRecurringInstance && (
                <button 
                  onClick={() => { if(onDelete) onDelete(task, 'future'); onClose(); }}
                  className="w-full bg-rose-600/10 text-rose-500 border border-rose-500/20 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                >
                  Delete Entire Sequence
                </button>
              )}
              <button 
                onClick={() => { if(onDelete) onDelete(task, 'single'); onClose(); }}
                className={`w-full ${isRecurringInstance ? 'bg-transparent border border-rose-500/20 text-rose-500' : 'bg-rose-600 text-white'} py-3 rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all`}
              >
                {isRecurringInstance ? 'Delete Just This Task' : 'Yes, Delete'}
              </button>
              <button 
                onClick={() => setDeletePromptOpen(false)}
                className={`w-full bg-transparent border ${borderCol} ${subTextColor} py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all mt-2`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-[10px] font-black ${subTextColor} uppercase tracking-widest mb-2`}>Objective Title</label>
            <input
              autoFocus required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className={`w-full ${inputBg} border-2 ${borderCol} rounded-2xl px-4 py-3 font-bold ${textColor} outline-none focus:border-[#8b5cf6]`}
              placeholder="e.g. Biology Chapter 4"
            />
            {isChapter && !task.id && (
              <p className="mt-2 text-[10px] font-black text-purple-400 uppercase tracking-tight flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                Spaced Repetition Auto-Sequence Detected
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-black ${subTextColor} uppercase tracking-widest mb-2`}>Launch Date</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-full ${inputBg} border-2 ${borderCol} rounded-2xl px-4 py-3 font-bold ${textColor} outline-none focus:border-[#8b5cf6]`} />
            </div>
            <div>
              <label className={`block text-[10px] font-black ${subTextColor} uppercase tracking-widest mb-2`}>Duration</label>
              <input required type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className={`w-full ${inputBg} border-2 ${borderCol} rounded-2xl px-4 py-3 font-bold ${textColor} outline-none focus:border-[#8b5cf6]`} placeholder="e.g. 2h" />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-black ${subTextColor} uppercase tracking-widest mb-2`}>Sector</label>
            <select value={section} onChange={(e) => setSection(e.target.value as MCATSection)} className={`w-full ${inputBg} border-2 ${borderCol} rounded-2xl px-4 py-3 font-bold ${textColor} outline-none focus:border-[#8b5cf6]`}>
              {Object.keys(SECTION_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {!task.id && !isChapter && (
            <div className="space-y-4">
              <label className={`block text-[10px] font-black ${subTextColor} uppercase tracking-widest`}>Auto-Recurrence</label>
              <div className="grid grid-cols-2 gap-2">
                {(['None', 'Daily', 'Weekly', 'Custom'] as RecurrenceType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRecurrence(type)}
                    className={`py-3 rounded-xl font-bold text-xs transition-all border-2 ${
                      recurrence === type 
                        ? 'bg-[#8b5cf6] text-white border-transparent shadow-lg' 
                        : `${inputBg} ${subTextColor} ${borderCol} hover:border-slate-700`
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {recurrence === 'Custom' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className={`block text-[10px] font-black ${subTextColor} uppercase tracking-widest mb-2`}>Repeat every X days</label>
                  <input
                    type="number"
                    min="1"
                    value={customInterval}
                    onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
                    className={`w-full ${inputBg} border-2 ${borderCol} rounded-2xl px-4 py-3 font-bold ${textColor} outline-none focus:border-[#8b5cf6]`}
                  />
                </div>
              )}
            </div>
          )}

          {task.id && isRecurringInstance && (
            <div className={`${inputBg} p-4 rounded-2xl border ${borderCol} space-y-3`}>
              <label className={`block text-[10px] font-black ${subTextColor} uppercase tracking-widest text-center`}>Update Scope</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSaveScope('single')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all border-2 ${
                    saveScope === 'single' ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#8b5cf6]' : `bg-transparent ${borderCol} ${subTextColor}`
                  }`}
                >
                  Instance
                </button>
                <button
                  type="button"
                  onClick={() => setSaveScope('future')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all border-2 ${
                    saveScope === 'future' ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#8b5cf6]' : `bg-transparent ${borderCol} ${subTextColor}`
                  }`}
                >
                  Sequence
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button type="submit" className="flex-1 bg-[#8b5cf6] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 shadow-lg transition-all active:scale-95">
              {task.id ? 'Save Changes' : isChapter ? 'Launch Sequence' : 'Create Mission'}
            </button>
            {task.id && (
              <button 
                type="button" 
                onClick={() => setDeletePromptOpen(true)} 
                className={`w-14 transition-all rounded-2xl flex items-center justify-center border active:scale-95 ${inputBg} border-slate-800 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default EditTaskModal;