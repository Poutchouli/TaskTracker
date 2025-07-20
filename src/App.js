/**
 * Household Harmony Hub
 * A modern, mobile-first web application for managing household tasks,
 * grocery lists, notes, and tracking family activities.
 * 
 * @author Your Name
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- MOCK USER DATA ---
// In a real app, this would come from a user authentication system
const loadUsersFromStorage = () => {
    try {
        const saved = localStorage.getItem('household-users');
        return saved ? JSON.parse(saved) : {
            'user_1': { name: 'You', color: 'bg-teal-600' },
            'user_2': { name: 'Partner', color: 'bg-purple-600' }
        };
    } catch (error) {
        console.warn('Failed to load users from localStorage:', error);
        return {
            'user_1': { name: 'You', color: 'bg-teal-600' },
            'user_2': { name: 'Partner', color: 'bg-purple-600' }
        };
    }
};

const MOCK_USERS = loadUsersFromStorage();


// --- DATE HELPER FUNCTIONS ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const startOfWeek = (date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    result.setDate(diff);
    return result;
};

const areDatesEqual = (d1, d2) => {
    // Ensure both are Date objects
    const date1 = d1 instanceof Date ? d1 : new Date(d1);
    const date2 = d2 instanceof Date ? d2 : new Date(d2);
    
    // Check for invalid dates
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return false;
    }
    
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

// --- MOCK DATABASE (Replace with API calls) ---
const useMockDatabase = () => {
    // Function to clear corrupted localStorage
    const clearStorageIfCorrupted = () => {
        try {
            const keys = ['household-tasks', 'household-notes', 'household-events', 'household-grocery'];
            keys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    JSON.parse(data); // This will throw if corrupted
                }
            });
        } catch (error) {
            console.warn('Corrupted localStorage detected, clearing...', error);
            ['household-tasks', 'household-notes', 'household-events', 'household-grocery'].forEach(key => {
                localStorage.removeItem(key);
            });
        }
    };

    // Clear corrupted data on app start
    clearStorageIfCorrupted();

    // Load from localStorage or use defaults
    const loadFromStorage = (key, defaultValue) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved, (key, value) => {
                // Parse dates back from JSON
                if (key === 'lastCompleted' || key === 'timestamp' || key === 'date') {
                    return new Date(value);
                }
                return value;
            }) : defaultValue;
        } catch (error) {
            console.warn(`Failed to load ${key} from localStorage:`, error);
            return defaultValue;
        }
    };

    const [tasks, setTasks] = useState(() => loadFromStorage('household-tasks', [
        { id: 1, name: 'Clean toilets', frequency: 3, lastCompleted: addDays(new Date(), -2) },
        { id: 2, name: 'Take out recycling', frequency: 7, lastCompleted: addDays(new Date(), -5) },
        { id: 3, name: 'Clean litter box', frequency: 1, lastCompleted: addDays(new Date(), -1) },
    ]));
    
    const [notes, setNotes] = useState(() => loadFromStorage('household-notes', [
        { id: 1, text: "We're out of paper towels.", authorId: 'user_2', timestamp: new Date() }
    ]));
    
    const [events, setEvents] = useState(() => loadFromStorage('household-events', [])); // Calendar events
    
    const [groceryItems, setGroceryItems] = useState(() => loadFromStorage('household-grocery', [
        { id: 1, item: 'Milk', addedBy: 'user_1', timestamp: addDays(new Date(), -1), completed: false, image: null },
        { id: 2, item: 'Bananas', addedBy: 'user_2', timestamp: new Date(), completed: true, image: null }
    ]));

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('household-tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('household-notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('household-events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('household-grocery', JSON.stringify(groceryItems));
    }, [groceryItems]);

    // --- Mock Database API ---
    // In a real application, these would be HTTP requests to your backend
    const api = useMemo(() => ({
        getTasks: () => tasks,
        addTask: (task) => setTasks(prev => [...prev, { ...task, id: Date.now() }]),
        updateTask: (updatedTask) => setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t)),
        deleteTask: (taskId) => setTasks(prev => prev.filter(t => t.id !== taskId)),
        
        getNotes: () => notes,
        addNote: (note) => setNotes(prev => [...prev, { ...note, id: Date.now() }]),
        deleteNote: (noteId) => setNotes(prev => prev.filter(n => n.id !== noteId)),
        
        // Calendar events are derived from tasks, but could also be stored
        getEvents: () => events,
        setEvents: (newEvents) => setEvents(newEvents),
        assignEvent: (eventId, userId) => {
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, assignedTo: userId, status: 'assigned' } : e));
        },
        unassignEvent: (eventId) => {
             setEvents(prev => prev.map(e => e.id === eventId ? { ...e, assignedTo: null, status: 'pending' } : e));
        },

        // Grocery list methods
        getGroceryItems: () => groceryItems,
        addGroceryItem: (item) => setGroceryItems(prev => [...prev, { ...item, id: Date.now() }]),
        updateGroceryItem: (updatedItem) => setGroceryItems(prev => prev.map(g => g.id === updatedItem.id ? updatedItem : g)),
        deleteGroceryItem: (itemId) => setGroceryItems(prev => prev.filter(g => g.id !== itemId)),
        toggleGroceryItem: (itemId) => setGroceryItems(prev => prev.map(g => g.id === itemId ? { ...g, completed: !g.completed } : g))
    }), [tasks, notes, events, groceryItems, setTasks, setNotes, setEvents, setGroceryItems]);

    return { tasks, notes, events, groceryItems, api };
};


// --- Main App Component ---
export default function App() {
    const [view, setView] = useState('calendar'); // calendar, tasks, notes, grocery, reports
    const [currentUserId, setCurrentUserId] = useState('user_1');
    const { tasks, notes, events, groceryItems, api } = useMockDatabase();

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <Header setView={setView} currentView={view} currentUserId={currentUserId} setCurrentUserId={setCurrentUserId} />
                <main className="p-3 sm:p-6 lg:p-8">
                    {view === 'calendar' && <CalendarSection tasks={tasks} events={events} api={api} currentUserId={currentUserId} />}
                    {view === 'tasks' && <TaskManagementSection tasks={tasks} api={api} currentUserId={currentUserId} />}
                    {view === 'notes' && <NotesSection notes={notes} api={api} currentUserId={currentUserId} />}
                    {view === 'grocery' && <GroceryListSection groceryItems={groceryItems} api={api} currentUserId={currentUserId} />}
                    {view === 'reports' && <ReportsSection tasks={tasks} groceryItems={groceryItems} currentUserId={currentUserId} />}
                </main>
            </div>
        </div>
    );
}


// --- Components ---

function Header({ setView, currentView, currentUserId, setCurrentUserId }) {
    return (
        <header className="bg-gray-800 p-3 sm:p-4 shadow-lg">
            <div className="flex flex-col space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-teal-400">Household Hub</h1>
                    <UserToggle currentUserId={currentUserId} setCurrentUserId={setCurrentUserId} />
                </div>
                <nav className="grid grid-cols-5 gap-1 sm:flex sm:space-x-2">
                    <NavButton text="📅" fullText="Calendar" onClick={() => setView('calendar')} isActive={currentView === 'calendar'} />
                    <NavButton text="✓" fullText="Tasks" onClick={() => setView('tasks')} isActive={currentView === 'tasks'} />
                    <NavButton text="📝" fullText="Notes" onClick={() => setView('notes')} isActive={currentView === 'notes'} />
                    <NavButton text="🛒" fullText="Grocery" onClick={() => setView('grocery')} isActive={currentView === 'grocery'} />
                    <NavButton text="📊" fullText="Reports" onClick={() => setView('reports')} isActive={currentView === 'reports'} />
                </nav>
            </div>
        </header>
    );
}

function UserToggle({ currentUserId, setCurrentUserId }) {
    const [editingUser, setEditingUser] = useState(null);
    const [editName, setEditName] = useState('');

    const handleEditClick = (userId, userName, e) => {
        e.stopPropagation();
        setEditingUser(userId);
        setEditName(userName);
    };

    const handleSaveName = (userId) => {
        if (editName.trim()) {
            // Update the user name in MOCK_USERS
            MOCK_USERS[userId].name = editName.trim();
            // Force a re-render by updating localStorage to persist the change
            localStorage.setItem('household-users', JSON.stringify(MOCK_USERS));
        }
        setEditingUser(null);
        setEditName('');
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditName('');
    };

    const handleKeyPress = (e, userId) => {
        if (e.key === 'Enter') {
            handleSaveName(userId);
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
            <span className="text-sm text-gray-300">Acting as:</span>
            {Object.entries(MOCK_USERS).map(([userId, user]) => (
                <div key={userId} className="relative">
                    {editingUser === userId ? (
                        <div className="flex items-center space-x-1">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, userId)}
                                onBlur={() => handleSaveName(userId)}
                                className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-white text-sm w-20 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                autoFocus
                            />
                            <button
                                onClick={() => handleSaveName(userId)}
                                className="text-green-400 hover:text-green-300 text-xs"
                                title="Save"
                            >
                                ✓
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="text-red-400 hover:text-red-300 text-xs"
                                title="Cancel"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center group">
                            <button
                                onClick={() => setCurrentUserId(userId)}
                                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                                    currentUserId === userId
                                        ? `${user.color} text-white shadow-md`
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                            >
                                {user.name}
                            </button>
                            <button
                                onClick={(e) => handleEditClick(userId, user.name, e)}
                                className="ml-1 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                title="Edit name"
                            >
                                ✏️
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function NavButton({ text, fullText, onClick, isActive }) {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-2 text-lg sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-md transition-all duration-200 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1 min-h-[60px] sm:min-h-[auto] ${
                isActive 
                ? 'bg-teal-500 text-white shadow-md' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            <span className="text-lg sm:hidden">{text}</span>
            <span className="hidden sm:inline">{fullText || text}</span>
            <span className="text-xs sm:hidden">{fullText}</span>
        </button>
    );
}

function CalendarSection({ tasks, events, api, currentUserId }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // month, week
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        // This function generates calendar events from the recurring tasks.
        // In a real app, this might happen on the backend.
        const generateEvents = () => {
            const newEvents = [];
            const today = new Date();
            const endDate = addDays(today, 60); // Generate for next 60 days

            tasks.forEach(task => {
                try {
                    // Ensure lastCompleted is a Date object
                    const lastCompletedDate = task.lastCompleted instanceof Date 
                        ? task.lastCompleted 
                        : new Date(task.lastCompleted);
                    
                    if (isNaN(lastCompletedDate.getTime())) {
                        console.warn(`Invalid lastCompleted date for task ${task.name}:`, task.lastCompleted);
                        return;
                    }
                    
                    let nextDate = new Date(lastCompletedDate);
                    while (nextDate <= endDate) {
                        nextDate = addDays(nextDate, task.frequency);
                        if (nextDate > today) { // Only show future tasks
                            newEvents.push({
                                id: `${task.id}-${nextDate.getTime()}`,
                                taskId: task.id,
                                taskName: task.name,
                                date: new Date(nextDate), // Ensure it's a proper Date object
                                status: 'pending',
                                assignedTo: null,
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error processing task ${task.name}:`, error);
                }
            });
            // Only update events if they have actually changed
            api.setEvents(newEvents);
        };
        generateEvents();
    }, [tasks, api]); // Include api in dependencies

    const changeMonth = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    
    const changeWeek = (offset) => {
        setCurrentDate(prev => addDays(prev, offset * 7));
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setShowTaskModal(true);
    };

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <CalendarHeader
                currentDate={currentDate}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onPrev={() => viewMode === 'month' ? changeMonth(-1) : changeWeek(-1)}
                onNext={() => viewMode === 'month' ? changeMonth(1) : changeWeek(1)}
                onToday={() => setCurrentDate(new Date())}
            />
            {viewMode === 'month' ? (
                <MonthView 
                    date={currentDate} 
                    events={events} 
                    api={api} 
                    tasks={tasks} 
                    currentUserId={currentUserId}
                    onDateClick={handleDateClick}
                />
            ) : (
                <WeekView 
                    date={currentDate} 
                    events={events} 
                    api={api} 
                    tasks={tasks} 
                    currentUserId={currentUserId}
                    onDateClick={handleDateClick}
                />
            )}
            {showTaskModal && (
                <TaskCreationModal
                    selectedDate={selectedDate}
                    onClose={() => setShowTaskModal(false)}
                    api={api}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}

function CalendarHeader({ currentDate, viewMode, setViewMode, onPrev, onNext, onToday }) {
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
                <button onClick={onPrev} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">‹</button>
                <button onClick={onNext} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">›</button>
                <button onClick={onToday} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">Today</button>
                <h2 className="text-xl font-bold text-white ml-4">{monthName}</h2>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
                <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-md text-sm ${viewMode === 'month' ? 'bg-teal-600' : 'bg-gray-700'}`}>Month</button>
                <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-md text-sm ${viewMode === 'week' ? 'bg-teal-600' : 'bg-gray-700'}`}>Week</button>
            </div>
        </div>
    );
}

function MonthView({ date, events, api, tasks, currentUserId, onDateClick }) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const calendarDays = useMemo(() => {
        const today = new Date();
        const days = [];
        // Pad start
        for (let i = 0; i < firstDay; i++) {
            days.push({ key: `pad-start-${i}`, isPadding: true });
        }
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            days.push({
                key: `day-${day}`,
                date: dayDate,
                isToday: areDatesEqual(dayDate, today),
                dayNumber: day,
                events: events.filter(e => areDatesEqual(e.date, dayDate))
            });
        }
        return days;
    }, [year, month, daysInMonth, firstDay, events]);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="grid grid-cols-7 gap-1">
            {weekdays.map(day => <div key={day} className="text-center font-bold text-gray-400 text-xs sm:text-sm py-2">{day}</div>)}
            {calendarDays.map(day => (
                day.isPadding ? <div key={day.key} className="border border-gray-700 rounded-md"></div> :
                <div 
                    key={day.key} 
                    className={`border border-gray-700 rounded-md p-1.5 min-h-[120px] cursor-pointer hover:bg-gray-700 transition-colors ${day.isToday ? 'bg-teal-900' : 'bg-gray-800'}`}
                    onClick={() => onDateClick(day.date)}
                >
                    <span className={`text-xs sm:text-sm font-bold ${day.isToday ? 'text-teal-400' : 'text-white'}`}>{day.dayNumber}</span>
                    <div className="mt-1 space-y-1">
                        {day.events.map(event => <CalendarEvent key={event.id} event={event} api={api} tasks={tasks} currentUserId={currentUserId} />)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function WeekView({ date, events, api, tasks, currentUserId, onDateClick }) {
    const weekStart = startOfWeek(date);

    const weekDays = useMemo(() => {
        const today = new Date();
        const days = [];
        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(weekStart, i);
            days.push({
                key: `week-day-${i}`,
                date: dayDate,
                isToday: areDatesEqual(dayDate, today),
                events: events.filter(e => areDatesEqual(e.date, dayDate))
            });
        }
        return days;
    }, [weekStart, events]);
    
    return (
         <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {weekDays.map(day => (
                <div 
                    key={day.key} 
                    className={`border border-gray-700 rounded-md p-2 min-h-[200px] cursor-pointer hover:bg-gray-700 transition-colors ${day.isToday ? 'bg-teal-900' : 'bg-gray-800'}`}
                    onClick={() => onDateClick(day.date)}
                >
                    <h3 className={`font-bold text-center ${day.isToday ? 'text-teal-400' : 'text-white'}`}>
                        {day.date.toLocaleDateString('default', { weekday: 'short' })}
                        <span className="block text-sm">{day.date.toLocaleDateString('default', { day: 'numeric' })}</span>
                    </h3>
                    <div className="mt-2 space-y-2">
                        {day.events.map(event => <CalendarEvent key={event.id} event={event} api={api} tasks={tasks} currentUserId={currentUserId} />)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function CalendarEvent({ event, api, tasks, currentUserId }) {
    const handleAssign = (e) => {
        e.stopPropagation(); // Prevent triggering date click
        if (event.assignedTo === currentUserId) {
            // TODO: Replace with API call
            api.unassignEvent(event.id);
        } else {
            // TODO: Replace with API call
            api.assignEvent(event.id, currentUserId);
        }
    };
    
    const handleComplete = (e) => {
        e.stopPropagation(); // Prevent triggering date click
        const task = tasks.find(t => t.id === event.taskId);
        if (task) {
            // TODO: Replace with API call to update task
            api.updateTask({ ...task, lastCompleted: new Date(), completedBy: currentUserId });
            // This will trigger a regeneration of events
        }
    };

    const assignedUser = event.assignedTo ? MOCK_USERS[event.assignedTo] : null;
    const isAssignedToMe = event.assignedTo === currentUserId;

    return (
        <div className={`p-1.5 rounded-md text-xs shadow cursor-pointer ${
            isAssignedToMe 
                ? `${MOCK_USERS[currentUserId]?.color || 'bg-blue-800'}` 
                : 'bg-gray-700'
        }`}>
            <p className="font-semibold text-white">{event.taskName}</p>
            {assignedUser && <p className="text-blue-300">By: {assignedUser.name}</p>}
            <div className="flex space-x-1 mt-1">
                <button 
                    onClick={handleAssign} 
                    className={`w-full py-1 text-xs rounded transition-colors ${
                        isAssignedToMe 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isAssignedToMe ? 'Un-assign' : 'I\'ll do it'}
                </button>
                {isAssignedToMe && (
                     <button 
                        onClick={handleComplete} 
                        className="w-full py-1 text-xs rounded bg-green-600 hover:bg-green-700 transition-colors"
                    >
                        Done
                    </button>
                )}
            </div>
        </div>
    );
}

function TaskCreationModal({ selectedDate, onClose, api, currentUserId }) {
    const [taskName, setTaskName] = useState('');
    const [frequency, setFrequency] = useState('3');
    const [assignToMe, setAssignToMe] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        // Create the task
        const newTask = {
            name: taskName.trim(),
            frequency: parseInt(frequency, 10),
            lastCompleted: addDays(selectedDate, -parseInt(frequency, 10)) // Set so next occurrence is on selected date
        };
        
        api.addTask(newTask);

        // If "assign to me" is checked, we'll assign it when the event is generated
        if (assignToMe) {
            // This is a bit hacky, but we'll set a flag that the next generation should assign to current user
            // In a real app, this would be handled differently
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-teal-400 mb-4">
                    Create Task for {selectedDate?.toLocaleDateString()}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Task Name</label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="e.g., Clean bathroom"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Repeat every (days)</label>
                        <input
                            type="number"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            min="1"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="assignToMe"
                            checked={assignToMe}
                            onChange={(e) => setAssignToMe(e.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor="assignToMe" className="text-sm text-gray-300">
                            Assign to me ({MOCK_USERS[currentUserId]?.name})
                        </label>
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper function to calculate days until next task is due
function getDaysUntilDue(lastCompleted, frequency) {
    const now = new Date();
    const lastDate = new Date(lastCompleted);
    const nextDue = new Date(lastDate.getTime() + (frequency * 24 * 60 * 60 * 1000));
    const timeDiff = nextDue.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft;
}

// Helper function to get timer bar color and width
function getTimerBarStyle(daysLeft, frequency) {
    const percentLeft = Math.max(0, Math.min(100, (daysLeft / frequency) * 100));
    let colorClass = 'bg-green-500';
    
    if (daysLeft <= 0) {
        colorClass = 'bg-red-500';
    } else if (daysLeft <= 1) {
        colorClass = 'bg-orange-500';
    } else if (daysLeft <= 2) {
        colorClass = 'bg-yellow-500';
    }
    
    return { colorClass, width: percentLeft };
}

// Export utilities for grocery list
const exportGroceryList = {
    // Export as text file
    asText: (groceryItems) => {
        const pendingItems = groceryItems.filter(item => !item.completed);
        const completedItems = groceryItems.filter(item => item.completed);
        
        let content = "🛒 GROCERY LIST\n";
        content += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        if (pendingItems.length > 0) {
            content += "📝 TO BUY:\n";
            pendingItems.forEach((item, index) => {
                content += `${index + 1}. ${item.item}\n`;
                content += `   Added by: ${MOCK_USERS[item.addedBy]?.name || 'Unknown'}\n`;
                content += `   Date: ${item.timestamp.toLocaleDateString()}\n\n`;
            });
        }
        
        if (completedItems.length > 0) {
            content += "\n✅ COMPLETED:\n";
            completedItems.forEach((item, index) => {
                content += `${index + 1}. ${item.item}\n`;
            });
        }
        
        return content;
    },
    
    // Export as JSON backup
    asJSON: (groceryItems) => {
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            version: "1.0",
            groceryItems: groceryItems
        }, null, 2);
    },
    
    // Download file
    downloadFile: (content, filename, type = 'text/plain') => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    // Share via Web Share API (mobile)
    share: async (content, title = 'Grocery List') => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: content
                });
            } catch (error) {
                console.warn('Web Share failed:', error);
                // Fallback to copying to clipboard
                exportGroceryList.copyToClipboard(content);
            }
        } else {
            // Fallback to copying to clipboard
            exportGroceryList.copyToClipboard(content);
        }
    },
    
    // Copy to clipboard
    copyToClipboard: async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            alert('Grocery list copied to clipboard! 📋');
        } catch (error) {
            console.warn('Clipboard write failed:', error);
            // Fallback: show in alert for manual copy
            alert('Copy this grocery list:\n\n' + content);
        }
    }
};

function TaskManagementSection({ tasks, api, currentUserId }) {
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('3');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !frequency) return;
        api.addTask({
            name: name.trim(),
            frequency: parseInt(frequency, 10),
            lastCompleted: new Date()
        });
        setName('');
        setFrequency('3');
    };

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-teal-400 mb-4">✓ Manage Recurring Tasks</h2>
            <form onSubmit={handleSubmit} className="mobile-form flex flex-col sm:flex-row gap-3 items-center bg-gray-700 p-4 rounded-md mb-6">
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="New task name" 
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-3 text-white w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                />
                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <input 
                        type="number" 
                        value={frequency} 
                        onChange={(e) => setFrequency(e.target.value)} 
                        min="1" 
                        className="bg-gray-800 border border-gray-600 rounded-md px-4 py-3 text-white w-20 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                    />
                    <span className="text-gray-400 whitespace-nowrap">days</span>
                    <button 
                        type="submit" 
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-md flex-shrink-0 transition-colors"
                    >
                        Add Task
                    </button>
                </div>
            </form>
            <div className="space-y-3">
                {tasks.map(task => {
                    const daysLeft = getDaysUntilDue(task.lastCompleted, task.frequency);
                    const timerStyle = getTimerBarStyle(daysLeft, task.frequency);
                    
                    return (
                        <div key={task.id} className="bg-gray-700 p-4 rounded-md">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-white text-lg">{task.name}</p>
                                        <button 
                                            onClick={() => api.deleteTask(task.id)} 
                                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md text-sm ml-2"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    
                                    {/* Timer Bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-300">
                                                {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : 
                                                 daysLeft === 0 ? 'Due today!' : 
                                                 `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                Every {task.frequency} days
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-600 rounded-full h-2">
                                            <div 
                                                className={`${timerStyle.colorClass} h-2 rounded-full transition-all duration-300`}
                                                style={{ width: `${timerStyle.width}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-400">
                                        Last done: {task.lastCompleted.toLocaleDateString()}
                                        {task.completedBy && ` by ${MOCK_USERS[task.completedBy]?.name}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function NotesSection({ notes, api, currentUserId }) {
    const [newNote, setNewNote] = useState('');

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        // TODO: Replace with API call
        api.addNote({
            text: newNote.trim(),
            authorId: currentUserId,
            timestamp: new Date(),
        });
        setNewNote('');
    };

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-teal-400 mb-4">Shared Notes</h2>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-6">
                <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Write a note..." className="flex-grow bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" />
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">Send</button>
            </form>
            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className={`p-3 rounded-lg ${note.authorId === currentUserId ? 'bg-teal-800 ml-auto' : 'bg-gray-700'} max-w-xl`}>
                        <p className="text-white">{note.text}</p>
                        <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                            <span>By {MOCK_USERS[note.authorId]?.name} at {note.timestamp.toLocaleTimeString()}</span>
                            {note.authorId === currentUserId && (
                                <button onClick={() => api.deleteNote(note.id)} className="text-red-500 hover:text-red-400">Delete</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GroceryListSection({ groceryItems, api, currentUserId }) {
    const [newItem, setNewItem] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const fileInputRef = React.useRef(null);
    const importFileRef = React.useRef(null);

    // Check localStorage usage
    const getCacheInfo = () => {
        try {
            const groceryData = localStorage.getItem('household-grocery');
            const sizeInBytes = new Blob([groceryData || '']).size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(1);
            const itemCount = groceryItems.length;
            const lastUpdate = new Date().toLocaleString();
            
            return { sizeInKB, itemCount, lastUpdate };
        } catch (error) {
            return { sizeInKB: '0', itemCount: 0, lastUpdate: 'Unknown' };
        }
    };

    const handleImportFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let importedData;
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(e.target.result);
                    importedData = data.groceryItems || data;
                } else {
                    // Parse text format
                    const lines = e.target.result.split('\n');
                    importedData = [];
                    let idCounter = Date.now();
                    
                    lines.forEach(line => {
                        const trimmed = line.trim();
                        if (trimmed && !trimmed.startsWith('🛒') && !trimmed.startsWith('Generated:') && 
                            !trimmed.startsWith('📝') && !trimmed.startsWith('✅') && 
                            !trimmed.includes('Added by:') && !trimmed.includes('Date:')) {
                            
                            const match = trimmed.match(/^\d+\.\s*(.+)/);
                            if (match) {
                                importedData.push({
                                    id: idCounter++,
                                    item: match[1],
                                    addedBy: currentUserId,
                                    timestamp: new Date(),
                                    completed: false,
                                    image: null
                                });
                            }
                        }
                    });
                }

                // Merge with existing items (avoid duplicates)
                const existingItems = groceryItems.map(item => item.item.toLowerCase());
                const newItems = importedData.filter(item => 
                    !existingItems.includes(item.item.toLowerCase())
                );

                newItems.forEach(item => api.addGroceryItem(item));
                alert(`Imported ${newItems.length} new items! (${importedData.length - newItems.length} duplicates skipped)`);
                setShowImportModal(false);
                
            } catch (error) {
                alert('Error importing file. Please check the format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        
        if (!newItem.trim()) {
            return;
        }
        
        const itemToAdd = {
            item: newItem.trim(),
            addedBy: currentUserId,
            timestamp: new Date(),
            completed: false,
            image: selectedImage
        };
        
        api.addGroceryItem(itemToAdd);
        
        setNewItem('');
        setSelectedImage(null);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openCamera = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Separate completed and pending items
    const pendingItems = groceryItems.filter(item => !item.completed);
    const completedItems = groceryItems.filter(item => item.completed);

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-xl font-bold text-teal-400">🛒 Grocery List</h2>
                
                {/* Export Actions */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            const content = exportGroceryList.asText(groceryItems);
                            exportGroceryList.share(content);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                        title="Share grocery list"
                    >
                        � Share
                    </button>
                    
                    <button
                        onClick={() => {
                            const content = exportGroceryList.asText(groceryItems);
                            const filename = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
                            exportGroceryList.downloadFile(content, filename);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                        title="Download as text file"
                    >
                        💾 Save
                    </button>
                    
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                        title="Import grocery list"
                    >
                        📥 Import
                    </button>
                    
                    <button
                        onClick={() => {
                            const content = exportGroceryList.asJSON(groceryItems);
                            const filename = `grocery-backup-${new Date().toISOString().split('T')[0]}.json`;
                            exportGroceryList.downloadFile(content, filename, 'application/json');
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                        title="Download backup (JSON)"
                    >
                        📋 Backup
                    </button>
                </div>
            </div>
            
            {/* Cache Status */}
            <div className="bg-gray-700 p-3 rounded-md mb-4 text-sm">
                <div className="flex flex-wrap gap-4 text-gray-300">
                    <span>💾 Cached: {getCacheInfo().sizeInKB} KB</span>
                    <span>📦 Items: {getCacheInfo().itemCount}</span>
                    <span>🔄 Auto-saved locally</span>
                </div>
            </div>
            
            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-white mb-4">📥 Import Grocery List</h3>
                        <p className="text-gray-300 mb-4">
                            Import from a text file (.txt) or backup file (.json). 
                            Items will be merged with your current list.
                        </p>
                        
                        <input
                            ref={importFileRef}
                            type="file"
                            accept=".txt,.json"
                            onChange={handleImportFile}
                            className="hidden"
                        />
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => importFileRef.current?.click()}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex-1"
                            >
                                Choose File
                            </button>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add new item form */}
            <form onSubmit={handleAddItem} className="mb-6">
                <div className="flex flex-col gap-3 bg-gray-700 p-4 rounded-md">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newItem} 
                            onChange={(e) => setNewItem(e.target.value)} 
                            placeholder="Add grocery item..." 
                            className="flex-grow bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                        />
                        <button 
                            type="button"
                            onClick={openCamera}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                            title="Add photo"
                        >
                            📷
                        </button>
                    </div>
                    
                    {/* Hidden file input for camera */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageCapture}
                        className="hidden"
                    />
                    
                    {/* Image preview */}
                    {selectedImage && (
                        <div className="relative inline-block">
                            <img 
                                src={selectedImage} 
                                alt="Selected" 
                                className="w-20 h-20 object-cover rounded-md"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded self-start"
                    >
                        Add Item
                    </button>
                </div>
            </form>

            {/* Pending items */}
            <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-gray-300">Shopping List</h3>
                {pendingItems.length === 0 ? (
                    <p className="text-gray-500 italic">No items to buy</p>
                ) : (
                    pendingItems.map(item => (
                        <GroceryItem 
                            key={item.id} 
                            item={item} 
                            api={api} 
                            currentUserId={currentUserId}
                        />
                    ))
                )}
            </div>

            {/* Completed items */}
            {completedItems.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-500">✅ Completed</h3>
                    {completedItems.map(item => (
                        <GroceryItem 
                            key={item.id} 
                            item={item} 
                            api={api} 
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function GroceryItem({ item, api, currentUserId }) {
    const handleToggle = () => {
        api.toggleGroceryItem(item.id);
    };

    const handleDelete = () => {
        api.deleteGroceryItem(item.id);
    };

    const addedByUser = MOCK_USERS[item.addedBy];
    const isMyItem = item.addedBy === currentUserId;

    return (
        <div className={`p-3 rounded-md border ${
            item.completed 
                ? 'bg-gray-700 border-gray-600 opacity-75' 
                : 'bg-gray-700 border-gray-600'
        }`}>
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={handleToggle}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-400 hover:border-gray-300'
                    }`}
                >
                    {item.completed && '✓'}
                </button>

                <div className="flex-grow">
                    {/* Item details */}
                    <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${
                            item.completed ? 'line-through text-gray-400' : 'text-white'
                        }`}>
                            {item.item}
                        </h4>
                        {isMyItem && (
                            <button
                                onClick={handleDelete}
                                className="text-red-500 hover:text-red-400 text-sm px-2 py-1 rounded"
                                title="Delete item"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                    
                    {/* Image if present */}
                    {item.image && (
                        <div className="mt-2">
                            <img 
                                src={item.image} 
                                alt={item.item} 
                                className="w-16 h-16 object-cover rounded-md cursor-pointer hover:opacity-80"
                                onClick={() => {
                                    // Open image in modal/fullscreen (for now just basic)
                                    const newWindow = window.open();
                                    newWindow.document.write(`<img src="${item.image}" style="max-width:100%;max-height:100%;"/>`);
                                }}
                            />
                        </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="text-xs text-gray-400 mt-1">
                        Added by {addedByUser?.name} • {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reports Section Component
function ReportsSection({ tasks, groceryItems, currentUserId }) {
    const [reportType, setReportType] = useState('task-completion');
    
    // Calculate task completion stats
    const taskStats = useMemo(() => {
        const now = new Date();
        const overdueTasks = tasks.filter(task => {
            const daysLeft = getDaysUntilDue(task.lastCompleted, task.frequency);
            return daysLeft < 0;
        });
        
        const dueTodayTasks = tasks.filter(task => {
            const daysLeft = getDaysUntilDue(task.lastCompleted, task.frequency);
            return daysLeft === 0;
        });
        
        const completedThisWeek = tasks.filter(task => {
            const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            return new Date(task.lastCompleted) >= weekAgo;
        });
        
        return {
            total: tasks.length,
            overdue: overdueTasks.length,
            dueToday: dueTodayTasks.length,
            completedThisWeek: completedThisWeek.length,
            overdueTasks,
            dueTodayTasks
        };
    }, [tasks]);
    
    // Calculate grocery stats
    const groceryStats = useMemo(() => {
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        
        const recentItems = groceryItems.filter(item => 
            new Date(item.timestamp) >= thisWeek
        );
        
        const completedItems = groceryItems.filter(item => item.completed);
        const pendingItems = groceryItems.filter(item => !item.completed);
        
        const itemsByUser = groceryItems.reduce((acc, item) => {
            const user = item.addedBy;
            if (!acc[user]) acc[user] = 0;
            acc[user]++;
            return acc;
        }, {});
        
        return {
            total: groceryItems.length,
            completed: completedItems.length,
            pending: pendingItems.length,
            addedThisWeek: recentItems.length,
            byUser: itemsByUser
        };
    }, [groceryItems]);

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-teal-400 mb-4">📊 Household Reports</h2>
                
                {/* Report Type Selector */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <button
                        onClick={() => setReportType('task-completion')}
                        className={`p-3 rounded-md text-sm font-medium ${
                            reportType === 'task-completion'
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        📋 Task Reports
                    </button>
                    <button
                        onClick={() => setReportType('grocery-stats')}
                        className={`p-3 rounded-md text-sm font-medium ${
                            reportType === 'grocery-stats'
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        🛒 Grocery Stats
                    </button>
                </div>

                {/* Task Completion Report */}
                {reportType === 'task-completion' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-700 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-white">{taskStats.total}</div>
                                <div className="text-sm text-gray-400">Total Tasks</div>
                            </div>
                            <div className="bg-red-900 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-red-300">{taskStats.overdue}</div>
                                <div className="text-sm text-red-400">Overdue</div>
                            </div>
                            <div className="bg-orange-900 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-orange-300">{taskStats.dueToday}</div>
                                <div className="text-sm text-orange-400">Due Today</div>
                            </div>
                            <div className="bg-green-900 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-green-300">{taskStats.completedThisWeek}</div>
                                <div className="text-sm text-green-400">Done This Week</div>
                            </div>
                        </div>
                        
                        {/* Overdue Tasks Alert */}
                        {taskStats.overdue > 0 && (
                            <div className="bg-red-900 border border-red-600 p-4 rounded-md">
                                <h3 className="text-lg font-semibold text-red-300 mb-2">⚠️ Overdue Tasks</h3>
                                <div className="space-y-2">
                                    {taskStats.overdueTasks.map(task => {
                                        const daysOverdue = Math.abs(getDaysUntilDue(task.lastCompleted, task.frequency));
                                        return (
                                            <div key={task.id} className="text-red-200">
                                                <strong>{task.name}</strong> - {daysOverdue} day{daysOverdue === 1 ? '' : 's'} overdue
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* Due Today Tasks */}
                        {taskStats.dueToday > 0 && (
                            <div className="bg-orange-900 border border-orange-600 p-4 rounded-md">
                                <h3 className="text-lg font-semibold text-orange-300 mb-2">📅 Due Today</h3>
                                <div className="space-y-2">
                                    {taskStats.dueTodayTasks.map(task => (
                                        <div key={task.id} className="text-orange-200">
                                            <strong>{task.name}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Grocery Stats Report */}
                {reportType === 'grocery-stats' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-700 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-white">{groceryStats.total}</div>
                                <div className="text-sm text-gray-400">Total Items</div>
                            </div>
                            <div className="bg-green-900 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-green-300">{groceryStats.completed}</div>
                                <div className="text-sm text-green-400">Completed</div>
                            </div>
                            <div className="bg-blue-900 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-blue-300">{groceryStats.pending}</div>
                                <div className="text-sm text-blue-400">Pending</div>
                            </div>
                            <div className="bg-purple-900 p-4 rounded-md text-center">
                                <div className="text-2xl font-bold text-purple-300">{groceryStats.addedThisWeek}</div>
                                <div className="text-sm text-purple-400">Added This Week</div>
                            </div>
                        </div>
                        
                        {/* User Contribution */}
                        <div className="bg-gray-700 p-4 rounded-md">
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">👥 Contributions</h3>
                            <div className="space-y-2">
                                {Object.entries(groceryStats.byUser).map(([userId, count]) => (
                                    <div key={userId} className="flex justify-between items-center">
                                        <span className="text-gray-300">{MOCK_USERS[userId]?.name || 'Unknown'}</span>
                                        <span className="text-white font-semibold">{count} items</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Shopping Completion Rate */}
                        {groceryStats.total > 0 && (
                            <div className="bg-gray-700 p-4 rounded-md">
                                <h3 className="text-lg font-semibold text-gray-300 mb-3">✅ Completion Rate</h3>
                                <div className="w-full bg-gray-600 rounded-full h-4">
                                    <div 
                                        className="bg-green-500 h-4 rounded-full transition-all duration-300"
                                        style={{ width: `${(groceryStats.completed / groceryStats.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-center mt-2 text-gray-300">
                                    {Math.round((groceryStats.completed / groceryStats.total) * 100)}% Complete
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
