import React, { useState, useEffect, useMemo } from 'react';
import DayColumn from './components/DayColumn.tsx';
import EditTaskModal from './components/EditTaskModal.tsx';
import DeletePromptModal from './components/DeletePromptModal.tsx';
import { StudyTask, ViewType, MasteryRating } from './types.ts';
import { INITIAL_TASKS, formatDateKey, DAYS_SHORT, SECTION_STYLES, parseLocalDate } from './constants.tsx';
import { adaptSchedule } from './services/geminiService.ts';
import { auth, db, signInWithPopup, signOut, googleProvider, onAuthStateChanged, collection, doc, setDoc, deleteDoc, onSnapshot, query, handleFirestoreError, OperationType } from './firebase.ts';

const STORAGE_KEY = 'lock-tf-in-v3-sr';
const THEME_KEY = 'lock-tf-in-theme';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    // Changed default to FALSE (Light Mode)
    return saved !== null ? saved === 'true' : false;
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [view, setView] = useState<ViewType>('weekly');
  const [baseDate, setBaseDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaskToEdit, setCurrentTaskToEdit] = useState<Partial<StudyTask> | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<StudyTask | null>(null);

  const [testDate, setTestDate] = useState<string>(() => {
    const saved = localStorage.getItem('lock-tf-in-test-date');
    if (saved) return saved;
    const d = new Date();
    d.setMonth(d.getMonth() + 3); // Default 3 months
    return formatDateKey(d);
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    
    if (user) {
      const q = query(collection(db, `users/${user.uid}/tasks`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedTasks: StudyTask[] = [];
        snapshot.forEach((doc) => {
          loadedTasks.push(doc.data() as StudyTask);
        });
        setTasks(loadedTasks);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/tasks`);
      });
      return () => unsubscribe();
    } else {
      // Load from local storage if not logged in
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setTasks(parsed);
        } catch (e) {
          console.error("Failed to load tasks from storage", e);
        }
      } else {
        setTasks(INITIAL_TASKS);
      }
    }
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  useEffect(() => {
    localStorage.setItem('lock-tf-in-test-date', testDate);
  }, [testDate]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, String(isDarkMode));
    document.body.style.backgroundColor = isDarkMode ? '#090712' : '#f8fafc';
    document.body.style.color = isDarkMode ? '#f1f5f9' : '#1e293b';
  }, [isDarkMode]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTasks([]);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const syncTaskToDb = async (task: StudyTask) => {
    if (!user) return;
    try {
      // Clean up undefined fields before saving to Firestore
      const cleanTask = { ...task, userId: user.uid };
      Object.keys(cleanTask).forEach(key => {
        if (cleanTask[key as keyof typeof cleanTask] === undefined) {
          delete cleanTask[key as keyof typeof cleanTask];
        }
      });
      await setDoc(doc(db, `users/${user.uid}/tasks`, task.id), cleanTask);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/tasks/${task.id}`);
    }
  };

  const removeTaskFromDb = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed, masteryRating: undefined };
      if (!user) {
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      } else {
        syncTaskToDb(updatedTask);
      }
    }
  };

  const handleRateTask = (id: string, rating: MasteryRating) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.section === 'CARS') return;

    let newTasks: StudyTask[] = [];
    let tasksToDelete: string[] = [];

    const updatedTask = { ...task, masteryRating: rating, completed: true };
    newTasks.push(updatedTask);

    if (rating === 'Again') {
      const tomorrow = parseLocalDate(task.date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      newTasks.push({
        ...task,
        id: Math.random().toString(36).substring(2, 11),
        title: `Blitz: ${task.title}`,
        date: formatDateKey(tomorrow),
        completed: false,
        masteryRating: undefined,
        isFSRSActive: true
      });
    } else if (rating === 'Hard') {
      const soon = parseLocalDate(task.date);
      soon.setDate(soon.getDate() + 2);
      newTasks.push({
        ...task,
        id: Math.random().toString(36).substring(2, 11),
        title: `Extra Review: ${task.title}`,
        date: formatDateKey(soon),
        completed: false,
        masteryRating: undefined,
        isFSRSActive: true
      });
    } else if (rating === 'Easy') {
      const rootId = task.originalTaskId || task.id;
      tasks.forEach(t => {
        if (t.originalTaskId === rootId && !t.completed && t.id !== id) {
          tasksToDelete.push(t.id);
        }
      });
    }

    if (!user) {
      setTasks(prev => {
        let next = prev.map(t => t.id === id ? updatedTask : t);
        if (rating === 'Again' || rating === 'Hard') {
          next = [...next, newTasks[1]];
        } else if (rating === 'Easy') {
          next = next.filter(t => !tasksToDelete.includes(t.id));
        }
        return next;
      });
    } else {
      newTasks.forEach(t => syncTaskToDb(t));
      tasksToDelete.forEach(tid => removeTaskFromDb(tid));
    }
  };

  const saveTask = (task: StudyTask, scope: 'single' | 'future' = 'single') => {
    const isChapter = task.title.toLowerCase().includes('chapter') && task.section !== 'CARS';
    
    if (task.id) {
      if (scope === 'future' && (task.groupId || task.originalTaskId)) {
        const linkId = task.groupId || task.originalTaskId;
        const tasksToUpdate = tasks.filter(t => (t.groupId === linkId || t.originalTaskId === linkId) && t.date >= task.date);
        
        if (!user) {
          setTasks(prev => prev.map(t => {
            if ((t.groupId === linkId || t.originalTaskId === linkId) && t.date >= task.date) {
              return { ...t, title: task.title, section: task.section, duration: task.duration };
            }
            return t;
          }));
        } else {
          tasksToUpdate.forEach(t => syncTaskToDb({ ...t, title: task.title, section: task.section, duration: task.duration }));
        }
      } else {
        if (!user) setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        else syncTaskToDb(task);
      }
    } else {
      const newId = Math.random().toString(36).substring(2, 11);
      let sequence: StudyTask[] = [];

      if (isChapter) {
        let currentOffset = 0;
        let index = 0;
        const endDate = parseLocalDate(testDate);
        while (true) {
          const d = parseLocalDate(task.date);
          d.setDate(d.getDate() + currentOffset);
          
          if (d > endDate) break;
          if (index > 100) break; // safety cap

          sequence.push({
            ...task,
            id: Math.random().toString(36).substring(2, 11),
            originalTaskId: newId,
            reviewIteration: index === 0 ? undefined : index,
            title: index === 0 ? task.title : `Review #${index}: ${task.title}`,
            date: formatDateKey(d),
            completed: false,
            recurrence: 'None'
          });

          if (index === 0) currentOffset = 1;
          else if (index === 1) currentOffset = 3;
          else if (index === 2) currentOffset = 7;
          else currentOffset = Math.round(currentOffset * 2.2);
          
          index++;
        }
      } else if (task.recurrence && task.recurrence !== 'None') {
        const groupId = Math.random().toString(36).substring(2, 11);
        let interval = 1;
        if (task.recurrence === 'Weekly') interval = 7;
        if (task.recurrence === 'Custom' && task.customInterval) interval = task.customInterval;

        let i = 0;
        const endDate = parseLocalDate(testDate);
        while (true) {
          const d = parseLocalDate(task.date);
          d.setDate(d.getDate() + (i * interval));
          
          if (d > endDate) break;
          if (i > 365) break; // safety cap

          sequence.push({
            ...task,
            id: Math.random().toString(36).substring(2, 11),
            groupId,
            date: formatDateKey(d),
            completed: false
          });
          i++;
        }
      } else {
        sequence.push({ ...task, id: newId });
      }

      if (!user) setTasks(prev => [...prev, ...sequence]);
      else sequence.forEach(t => syncTaskToDb(t));
    }
  };

  const moveTask = (taskId: string, targetDate: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, date: targetDate };
      if (!user) setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      else syncTaskToDb(updatedTask);
    }
  };

  const handleDeleteRequest = (task: StudyTask) => {
    setTaskToDelete(task);
  };

  const executeDelete = (task: Partial<StudyTask>, scope: 'single' | 'future' = 'single') => {
    if (!task.id) return;
    
    if (scope === 'future' && (task.groupId || task.originalTaskId)) {
      const linkId = task.groupId || task.originalTaskId;
      const tasksToDelete = tasks.filter(t => (t.groupId === linkId || t.originalTaskId === linkId) && (task.date && t.date >= task.date));
      
      if (!user) {
        setTasks(prev => prev.filter(t => !((t.groupId === linkId || t.originalTaskId === linkId) && (task.date && t.date >= task.date))));
      } else {
        tasksToDelete.forEach(t => removeTaskFromDb(t.id));
      }
    } else {
      if (!user) setTasks(prev => prev.filter(t => t.id !== task.id));
      else removeTaskFromDb(task.id!);
    }
    setTaskToDelete(null);
  };

  const handleDragStartTask = (e: React.DragEvent, id: string) => e.dataTransfer.setData('taskId', id);
  const handleEditTask = (task: StudyTask) => { setCurrentTaskToEdit(task); setIsModalOpen(true); };
  const handleAddTask = (dateKey: string) => { 
    setCurrentTaskToEdit({ date: dateKey, completed: false, title: '', description: '', section: 'Biology', duration: '1h' }); 
    setIsModalOpen(true); 
  };

  const navigate = (amount: number) => {
    const newDate = new Date(baseDate);
    if (view === 'daily') newDate.setDate(newDate.getDate() + amount);
    if (view === 'weekly') newDate.setDate(newDate.getDate() + (amount * 7));
    if (view === 'monthly') newDate.setMonth(newDate.getMonth() + amount);
    setBaseDate(newDate);
  };

  const currentRangeDays = useMemo(() => {
    if (view === 'daily') return [new Date(baseDate)];
    const start = new Date(baseDate);
    const day = start.getDay();
    const shift = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - shift); 
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [view, baseDate]);

  const monthGrid = useMemo(() => {
    if (view !== 'monthly') return [];
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    const startDay = start.getDay();
    const padding = startDay === 0 ? 6 : startDay - 1;
    const days = [];
    for (let i = 0; i < padding; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() - (padding - i));
      days.push({ date: d, currentMonth: false });
    }
    for (let i = 1; i <= end.getDate(); i++) {
      days.push({ date: new Date(baseDate.getFullYear(), baseDate.getMonth(), i), currentMonth: true });
    }
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(end);
      d.setDate(d.getDate() + i);
      days.push({ date: d, currentMonth: false });
    }
    return days;
  }, [view, baseDate]);

  const handleAiUpdate = async () => {
    if (!userInput.trim()) return;
    setIsAiLoading(true);
    setAiMessage(null);
    try {
      const response = await adaptSchedule(tasks, userInput);
      setTasks(response.updatedTasks);
      setAiMessage(response.suggestion);
      setUserInput('');
    } catch (err) {
      setAiMessage("Sync failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const progressPercent = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
  const bgColor = isDarkMode ? 'bg-[#090712]' : 'bg-[#f8fafc]';
  const surfaceBg = isDarkMode ? 'bg-[#16122b]' : 'bg-white';
  const borderCol = isDarkMode ? 'border-slate-800' : 'border-slate-100';

  return (
    <div className={`min-h-screen ${bgColor} ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} pb-40 transition-colors duration-300`}>
      <header className="px-8 pt-8 max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="shrink-0">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-2 italic">
            <span className={`${isDarkMode ? 'text-[#8b5cf6] drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'text-[#3b5bdb]'}`}>LOCK</span> TF IN!
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} font-bold text-xs tracking-[0.3em] uppercase`}>Adaptive Learning Active</p>
            {user ? (
              <button onClick={handleLogout} className="text-[10px] font-bold text-rose-500 hover:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full transition-colors">Logout</button>
            ) : (
              <button onClick={handleLogin} className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full transition-colors">Login to Sync</button>
            )}
          </div>
        </div>

        <div className={`flex flex-wrap items-center justify-center gap-4 ${surfaceBg} p-2 rounded-[28px] shadow-2xl border ${borderCol}`}>
           <div className={`flex ${isDarkMode ? 'bg-[#0d0b1a]' : 'bg-slate-50'} p-1 rounded-2xl`}>
             {(['daily', 'weekly', 'monthly'] as ViewType[]).map(v => (
               <button key={v} onClick={() => setView(v)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === v ? `${isDarkMode ? 'bg-[#16122b]' : 'bg-white'} ${isDarkMode ? 'text-[#8b5cf6]' : 'text-[#3b5bdb]'} shadow-lg border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}` : `text-slate-400 hover:${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}`}>
                 {v}
               </button>
             ))}
           </div>
           
           <div className="flex items-center gap-2 border-l border-r border-slate-700/30 px-3">
             <button onClick={() => navigate(-1)} className="p-2 hover:opacity-50 transition-opacity">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <button onClick={() => navigate(1)} className="p-2 hover:opacity-50 transition-opacity">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
             </button>
           </div>

           <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-[#1a1630] text-yellow-400' : 'bg-slate-50 text-indigo-600'}`}>
             {isDarkMode ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>}
           </button>
        </div>

        <div className={`flex items-center gap-2 ${surfaceBg} p-2 rounded-2xl shadow-xl border ${borderCol}`}>
          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} pl-2`}>Test Date</span>
          <input 
            type="date" 
            value={testDate} 
            onChange={(e) => setTestDate(e.target.value)}
            className={`bg-transparent border-none text-xs font-bold focus:ring-0 outline-none ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
          />
        </div>

        <div className={`w-full sm:w-auto md:max-w-md ${surfaceBg} rounded-3xl p-2 shadow-2xl border ${borderCol} flex items-center gap-2`}>
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Sync with AI Coach..." className={`flex-1 bg-transparent border-none px-4 py-2 font-semibold text-sm focus:ring-0 outline-none ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} />
          <button onClick={handleAiUpdate} disabled={isAiLoading} className={`${isDarkMode ? 'bg-[#8b5cf6]' : 'bg-[#3b5bdb]'} text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 shadow-lg`}>
            {isAiLoading ? '...' : 'SYNC'}
          </button>
        </div>
      </header>

      {aiMessage && (
        <div className="max-w-[1800px] mx-auto px-8 mt-6">
          <div className={`${surfaceBg} border-l-4 ${isDarkMode ? 'border-[#8b5cf6]' : 'border-[#3b5bdb]'} p-4 rounded-2xl shadow-lg flex items-start gap-4 animate-in slide-in-from-top-4`}>
             <p className="text-sm font-bold italic opacity-90">{aiMessage}</p>
             <button onClick={() => setAiMessage(null)} className="ml-auto opacity-50"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
        </div>
      )}

      <main className="mt-12 px-8 max-w-[1800px] mx-auto overflow-visible">
        <div className={`grid ${view === 'daily' ? 'grid-cols-1 justify-items-center' : view === 'monthly' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'}`}>
          {view === 'monthly' ? (
            <div className={`${surfaceBg} rounded-[40px] shadow-2xl border ${borderCol} overflow-hidden w-full`}>
               <div className={`grid grid-cols-7 border-b ${borderCol} ${isDarkMode ? 'bg-[#0d0b1a]' : 'bg-slate-50'}`}>
                {DAYS_SHORT.map(d => <div key={d} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {monthGrid.map(({ date, currentMonth }, i) => {
                  const dateKey = formatDateKey(date);
                  const dayTasks = tasks.filter(t => t.date === dateKey);
                  return (
                    <div key={i} onClick={() => { setBaseDate(new Date(date)); setView('daily'); }} className={`min-h-[120px] p-2 border-r border-b ${borderCol} cursor-pointer hover:${isDarkMode ? 'bg-[#1a1630]' : 'bg-slate-50'} ${!currentMonth ? 'opacity-20' : ''}`}>
                      <span className="text-[11px] font-black text-slate-500">{date.getDate()}</span>
                      <div className="flex flex-col gap-1 mt-1">
                        {dayTasks.slice(0, 2).map(t => <div key={t.id} className={`px-1.5 py-0.5 rounded text-[7px] font-bold truncate ${SECTION_STYLES[t.section].bg} ${SECTION_STYLES[t.section].text}`}>{t.title}</div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            currentRangeDays.map((d, i) => (
              <DayColumn
                key={i}
                isDarkMode={isDarkMode}
                date={d}
                tasks={tasks.filter(t => t.date === formatDateKey(d))}
                onToggleTask={toggleTask}
                onRateTask={handleRateTask}
                onDropTask={moveTask}
                onDragStartTask={handleDragStartTask}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteRequest}
                isFocused={view === 'daily'}
              />
            ))
          )}
        </div>
      </main>

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 ${isDarkMode ? 'bg-[#16122b]/80' : 'bg-white/80'} backdrop-blur-2xl px-10 py-5 rounded-[40px] shadow-2xl border ${borderCol} flex items-center gap-8 z-50`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery</span>
          <span className={`text-xl font-black ${isDarkMode ? 'text-[#8b5cf6]' : 'text-[#3b5bdb]'}`}>{progressPercent}%</span>
        </div>
        <div className={`w-48 sm:w-64 h-3 ${isDarkMode ? 'bg-[#0d0b1a]' : 'bg-slate-100'} rounded-full overflow-hidden border ${borderCol}`}>
          <div className={`h-full bg-gradient-to-r ${isDarkMode ? 'from-[#8b5cf6] to-[#d946ef]' : 'from-[#3b5bdb] to-[#5c7cff]'} transition-all duration-1000`} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <EditTaskModal isDarkMode={isDarkMode} isOpen={isModalOpen} task={currentTaskToEdit} onClose={() => setIsModalOpen(false)} onSave={saveTask} onDelete={executeDelete} />
      <DeletePromptModal isDarkMode={isDarkMode} isOpen={!!taskToDelete} task={taskToDelete} onClose={() => setTaskToDelete(null)} onConfirm={executeDelete} />
    </div>
  );
};

export default App;