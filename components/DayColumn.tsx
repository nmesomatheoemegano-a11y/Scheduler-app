import React, { useState } from 'react';
import { StudyTask, MasteryRating } from '../types.ts';
import TaskCard from './TaskCard.tsx';
import { formatDateKey } from '../constants.tsx';

interface DayColumnProps {
  date: Date;
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onRateTask: (id: string, rating: MasteryRating) => void;
  onDropTask: (taskId: string, targetDate: string) => void;
  onDragStartTask: (e: React.DragEvent, id: string) => void;
  onAddTask: (date: string) => void;
  onEditTask: (task: StudyTask) => void;
  onDeleteTask: (task: StudyTask) => void;
  isFocused?: boolean;
  isDarkMode: boolean;
}

const DayColumn: React.FC<DayColumnProps> = ({
  date,
  tasks,
  onToggleTask,
  onRateTask,
  onDropTask,
  onDragStartTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isFocused = false,
  isDarkMode
}) => {
  const [isOver, setIsOver] = useState(false);
  const dateKey = formatDateKey(date);
  const isToday = dateKey === formatDateKey(new Date());
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[date.getDay()];
  const dayNum = date.getDate();

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsOver(true); };
  const handleDragLeave = () => setIsOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    onDropTask(taskId, dateKey);
  };

  const accentHex = isDarkMode ? '#8b5cf6' : '#3b5bdb';
  const surfaceBg = isDarkMode ? 'bg-[#16122b]' : 'bg-white';
  const borderCol = isDarkMode ? 'border-slate-800' : 'border-slate-100';
  const todayBorder = isDarkMode ? (isToday ? 'border-[#8b5cf6]' : 'border-slate-800') : (isToday ? 'border-[#3b5bdb]' : 'border-slate-100');

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-[32px] border-2 p-6 transition-all ${
        isFocused ? 'min-h-[600px] w-full max-w-[500px]' : 'min-h-[450px] w-full'
      } ${
        isOver ? `${isDarkMode ? 'bg-[#1a1630]' : 'bg-blue-50'} border-dashed border-[#8b5cf6]` : `${surfaceBg} ${todayBorder}`
      } ${isToday ? 'shadow-2xl' : ''}`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`text-xl font-black ${isToday ? (isDarkMode ? 'text-[#8b5cf6]' : 'text-[#3b5bdb]') : (isDarkMode ? 'text-slate-100' : 'text-slate-800')}`}>
            {dayName} {dayNum}
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tasks.length} Objectives</p>
        </div>
        <button onClick={() => onAddTask(dateKey)} className={`w-9 h-9 rounded-xl border ${borderCol} flex items-center justify-center hover:opacity-70 transition-opacity`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      
      <div className="flex-1 space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            isDarkMode={isDarkMode}
            task={task}
            onToggle={onToggleTask}
            onRate={onRateTask}
            onDragStart={onDragStartTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className={`h-20 border-2 border-dashed ${isDarkMode ? 'border-slate-800 text-slate-700' : 'border-slate-100 text-slate-300'} rounded-2xl flex items-center justify-center text-[10px] font-bold italic`}>NO MISSIONS</div>
        )}
      </div>
    </div>
  );
};

export default DayColumn;