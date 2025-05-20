import React, { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Task type definition
interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'completed';
  tags?: string[];
}

// Task Dashboard Component
export default function TasksPage() {
  // Sample tasks for demonstration
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 1, 
      title: 'Complete project proposal', 
      description: 'Finalize the project proposal document including budget and timeline',
      dueDate: '2025-05-22',
      priority: 'high',
      status: 'in-progress',
      tags: ['work', 'important']
    },
    { 
      id: 2, 
      title: 'Schedule team meeting', 
      description: 'Set up a meeting with the development team to discuss the new features',
      dueDate: '2025-05-21',
      priority: 'medium',
      status: 'todo',
      tags: ['work', 'meeting']
    },
    { 
      id: 3, 
      title: 'Review code changes', 
      description: 'Review pull requests and merge approved changes',
      dueDate: '2025-05-20',
      priority: 'medium',
      status: 'todo',
      tags: ['work', 'development']
    },
    { 
      id: 4, 
      title: 'Buy groceries', 
      description: 'Get milk, eggs, bread, and vegetables',
      dueDate: '2025-05-20',
      priority: 'low',
      status: 'todo',
      tags: ['personal', 'shopping']
    },
    { 
      id: 5, 
      title: 'Workout session', 
      description: '30 min cardio + strength training',
      dueDate: '2025-05-20',
      priority: 'medium',
      status: 'todo',
      tags: ['personal', 'health']
    },
    { 
      id: 6, 
      title: 'Send follow-up email', 
      description: 'Follow up with client regarding the project status',
      dueDate: '2025-05-19',
      priority: 'high',
      status: 'completed',
      tags: ['work', 'client']
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [sort, setSort] = useState<'priority' | 'dueDate'>('dueDate');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    tags: []
  });

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Sort tasks based on criteria
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else {
      // Sort by due date
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });

  // Add a new task
  const handleAddTask = () => {
    if (!newTask.title) return;
    
    const taskToAdd: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title: newTask.title || '',
      description: newTask.description,
      dueDate: newTask.dueDate,
      priority: newTask.priority as 'high' | 'medium' | 'low',
      status: newTask.status as 'todo' | 'in-progress' | 'completed',
      tags: newTask.tags
    };
    
    setTasks([...tasks, taskToAdd]);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'todo',
      tags: []
    });
    setShowAddTask(false);
  };

  // Update task status
  const handleStatusChange = (taskId: number, newStatus: 'todo' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Delete a task
  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
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
  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
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

  return (
    <DashboardLayout title="Tasks">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
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
                  Title*
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Task description"
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
                          checked={task.status === 'completed'}
                          onChange={() => handleStatusChange(
                            task.id, 
                            task.status === 'completed' ? 'todo' : 'completed'
                          )}
                          className="h-5 w-5 text-teal-600 focus:ring-teal-500 rounded"
                        />
                      </div>
                      <div>
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </span>
                          {task.status === 'in-progress' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              In Progress
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
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
                      {task.status !== 'in-progress' && task.status !== 'completed' && (
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
    </div>
  );
}