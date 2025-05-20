import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TaskWidgetProps {
  userId: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

const TaskWidget: React.FC<TaskWidgetProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In a real implementation, this would fetch from Firebase
        const initialTasks = [
          { id: '1', title: 'Complete quarterly report', completed: false, dueDate: '2025-05-25' },
          { id: '2', title: 'Review product roadmap', completed: false, dueDate: '2025-05-22' },
          { id: '3', title: 'Schedule team offsite', completed: true, dueDate: '2025-05-18' },
          { id: '4', title: 'Update stakeholders on progress', completed: false, dueDate: '2025-05-30' },
        ];
        
        setTasks(initialTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Could not load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [userId]);
  
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    // In a real implementation, this would update Firebase
  };
  
  const addNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      dueDate: undefined
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    
    // In a real implementation, this would add to Firebase
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3">
        <h3 className="text-white font-medium text-sm">Tasks</h3>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-t-teal-500 border-teal-200 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-500">{error}</p>
            <button className="mt-2 text-xs text-teal-600 hover:text-teal-800">
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-start group">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label 
                    className={`font-medium ${
                      task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                  >
                    {task.title}
                  </label>
                  {task.dueDate && (
                    <p className="text-xs text-gray-500">
                      Due: {formatDate(task.dueDate)}
                    </p>
                  )}
                </div>
                <button
                  className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                  onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            <form onSubmit={addNewTask} className="pt-3 mt-3 border-t border-gray-200">
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="block w-full text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskWidget;