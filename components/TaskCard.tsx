import React, { useState } from 'react';
import { StudyTask, MasteryRating } from '../types.ts';
import { SECTION_STYLES } from '../constants.tsx';

interface TaskCardProps {
  task: StudyTask;
  onToggle: (id: string) => void;
  onRate: (id: string, rating: MasteryRating) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onEdit: (task: StudyTask) => void;
  onDelete: (task: StudyTask) => void;
  isDarkMode: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onRate, onDragStart, onEdit, onDelete, isDarkMode }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const styles = SECTION_STYLES[task.section];
  const cardBg = isDarkMode ? 'bg-[#211b3d]' : 'bg-white';
  const borderCol = isDarkMode ? 'border-slate-800' : 'border-slate-100';

  const isReview = !!task.originalTaskId || task.reviewIteration !== undefined;
  const isHighPriority = task.isFSRSActive;
  const isCARS = task.section === 'CARS';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEdit(task)}
      className={`group relative p-3.5 mb-2.5 ${cardBg} rounded-2xl border ${borderCol} shadow-xl transition-all cursor-grab active:cursor-grabbing hover:border-[#8b5cf6]/50 ${
        task.completed && !task.masteryRating && !isCARS ? 'ring-2 ring-yellow-400/30' : ''
      } ${isHighPriority ? 'ring-2 ring-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : ''}`}
    >
      <div className="absolute top-2.5 right-2.5 z-[60] flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={handleDelete}
          className={`flex items-center justify-center transition-all border shadow-lg rounded-lg w-7 h-7 ${isDarkMode ? 'bg-[#1a1630] border-slate-800' : 'bg-slate-50 border-slate-200'} text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600`}
          title="Delete Task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      <div className="flex gap-3 items-start pr-8">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            task.completed 
              ? `${isDarkMode ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'bg-[#3b5bdb] border-[#3b5bdb]'}` 
              : `${isDarkMode ? 'bg-[#1a1630] border-slate-700' : 'bg-white border-slate-200'}`
          }`}
        >
          {task.completed && <svg width="12" height="9" viewBox="0 0 14 11" fill="none"><path d="M1 6L5 9.5L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {isReview && (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[7px] font-black uppercase tracking-tighter flex items-center gap-1">
                {task.reviewIteration ? `Review #${task.reviewIteration}` : 'Spaced Rep'}
              </span>
            )}
            {isHighPriority && (
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[7px] font-black uppercase tracking-tighter">Intensive</span>
            )}
          </div>

          <h4 className={`font-black text-[13px] leading-tight ${task.completed ? 'line-through opacity-40' : ''}`}>
            {task.title}
          </h4>

          {!task.completed && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black tracking-widest uppercase ${styles.bg} ${styles.text}`}>
                {styles.label}
              </span>
              <span className="text-slate-500 text-[8px] font-bold">{task.duration}</span>
            </div>
          )}

          {task.completed && !task.masteryRating && !isCARS && (
            <div className="mt-3 flex flex-col gap-2 p-2 bg-black/10 rounded-xl" onClick={e => e.stopPropagation()}>
              <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-1">Self-Assessment</p>
              <div className="grid grid-cols-4 gap-1">
                {(['Again', 'Hard', 'Good', 'Easy'] as MasteryRating[]).map(r => (
                  <button
                    key={r}
                    onClick={() => onRate(task.id, r)}
                    className={`py-1 rounded-lg text-[7px] font-black uppercase transition-all hover:scale-105 ${
                      r === 'Again' ? 'bg-rose-500 text-white' : 
                      r === 'Hard' ? 'bg-orange-500 text-white' : 
                      r === 'Good' ? 'bg-blue-500 text-white' : 
                      'bg-emerald-500 text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {task.masteryRating && !isCARS && (
            <div className="mt-2">
               <span className={`text-[8px] font-black uppercase ${
                  task.masteryRating === 'Again' ? 'text-rose-400' : 
                  task.masteryRating === 'Hard' ? 'text-orange-400' : 
                  task.masteryRating === 'Good' ? 'text-blue-400' : 
                  'text-emerald-400'
                }`}>
                {task.masteryRating} Mastery
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;