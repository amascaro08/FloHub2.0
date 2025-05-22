import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Task type definition that aligns with our API
interface Task {
  id: number;
  text: string;
  dueDate?: string;
  done: boolean;
  source?: string;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  firebaseId?: string;
  userId?: string;
}

// Status mapping to align with widget
type TaskStatus = 'todo' | 'in-progress' | 'completed';

// Task Dashboard Component
export default function TasksPage() {
  // State for tasks from API
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tasks from API
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
      // Fallback to empty array, not mock data
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [sort, setSort] = useState<'priority' | 'dueDate'>('dueDate');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    text: '',
    notes: '',
    dueDate: '',
    priority: 'medium',
    done: false,
    source: 'personal',
    tags: []
  });

  // Convert done status to appropriate filter categories
  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.done) return 'completed';
    // Check if task has 'in-progress' marker in tags or source
    if (task.tags?.includes('in-progress') || task.source === 'in-progress') {
      return 'in-progress';
    }
    return 'todo';
  };

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    const taskStatus = getTaskStatus(task);
    return taskStatus === filter;
  });

  // Sort tasks based on criteria
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'priority') {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[a.priority || 'medium'] || 1;
      const bPriority = priorityOrder[b.priority || 'medium'] || 1;
      return aPriority - bPriority;
    } else {
      // Sort by due date
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });

  // Add a new task
  const handleAddTask = async () => {
    if (!newTask.text) return;
    
    // Prepare task data for API
    const taskData = {
      text: newTask.text,
      notes: newTask.notes,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      done: false,
      source: newTask.source,
      tags: newTask.tags || []
    };
    
    console.log("Creating new task from Tasks page:", taskData);
    
    // Call API to create task
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Task creation error:", response.status, errorText);
        throw new Error(`Failed to create task: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Task created successfully:", result);
      
      // Refresh tasks after creation
      fetchTasks();
      
      // Reset form
      setNewTask({
        text: '',
        notes: '',
        dueDate: '',
        priority: 'medium',
        done: false,
        source: 'personal',
        tags: []
      });
      setShowAddTask(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task. Please try again.');
    }
  };

  // Update task completion status
  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      // Map to API's format (done property)
      const isDone = newStatus === 'completed';
      
      // For in-progress, we'll add a tag
      let updates = { done: isDone };
      if (newStatus === 'in-progress') {
        updates = { 
          done: false,
          tags: [...(tasks.find(t => t.id === taskId)?.tags || []), 'in-progress']
        };
      }
      
      // Call API to update task
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Refresh tasks after update
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task. Please try again.');
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Refresh tasks after deletion
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Add a tag to new task
  const handleAddTag = () => {
    const tagInput = prompt('Enter a tag:');
    if (tagInput && tagInput.trim() !== '') {
      setNewTask({
        ...newTask,
        tags: [...(newTask.tags || []), tagInput.trim()]
      });
    }
  };

  // Get priority badge styles
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Show loading state
  if (isLoading && tasks.length === 0) {
    return (
      <DashboardLayout title="Tasks">
        <div className="max-w-6xl mx-auto p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded mb-6"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Show error state
  if (error && tasks.length === 0) {
    return (
      <DashboardLayout title="Tasks">
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h2 className="text-red-800 text-lg font-medium mb-2">Error Loading Tasks</h2>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchTasks}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tasks">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div></div> {/* Spacer for alignment */}
          <button
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            onClick={() => setShowAddTask(!showAddTask)}
          >
            {showAddTask ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Text*
                </label>
                <input
                  type="text"
                  value={newTask.text || ''}
                  onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="What do you need to do?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newTask.notes || ''}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Additional details"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newTask.tags && newTask.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="text-sm text-teal-600 hover:text-teal-800"
                >
                  + Add Tag
                </button>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'all' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('todo')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'todo' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  To Do
                </button>
                <button
                  onClick={() => setFilter('in-progress')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'in-progress' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'completed' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'priority' | 'dueDate')}
                className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            {filter === 'all' ? 'All Tasks' : 
             filter === 'todo' ? 'To Do' : 
             filter === 'in-progress' ? 'In Progress' : 'Completed'}
            <span className="ml-2 text-sm text-gray-500">({sortedTasks.length})</span>
          </h2>
          
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No tasks found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => handleStatusChange(
                            task.id, 
                            task.done ? 'todo' : 'completed'
                          )}
                          className="h-5 w-5 text-teal-600 focus:ring-teal-500 rounded"
                        />
                      </div>
                      <div>
                        <h3 className={`font-medium ${task.done ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.text}
                        </h3>
                        {task.notes && (
                          <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.priority && (
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </span>
                          )}
                          {getTaskStatus(task) === 'in-progress' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              In Progress
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              new Date(task.dueDate) < new Date() && !task.done
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.source && task.source !== 'in-progress' && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              {task.source}
                            </span>
                          )}
                          {task.tags && task.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {getTaskStatus(task) !== 'in-progress' && !task.done && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'in-progress')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}