import React from 'react';

interface DashboardConceptProps {
  className?: string;
}

const DashboardConcept: React.FC<DashboardConceptProps> = ({ className }) => {
  return (
    <div className={`bg-white rounded-xl p-6 ${className}`}>
      <div className="flex mb-6">
        <div className="w-72 bg-gray-50 rounded-lg p-4 border border-gray-100 mr-6 h-[calc(100vh-12rem)]">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <h2 className="ml-3 font-medium text-gray-800">Projects</h2>
          </div>
          
          <div className="space-y-2">
            {['Marketing Campaign', 'Product Launch', 'Website Redesign', 'Data Migration', 'Annual Report'].map((project, i) => (
              <div 
                key={i} 
                className={`px-3 py-2 rounded-md ${i === 1 ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              >
                {project}
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['Urgent', 'Design', 'Development', 'Planning', 'Review'].map((tag, i) => (
                <span 
                  key={i} 
                  className={`px-2 py-1 rounded-full text-xs ${
                    i % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Product Launch</h1>
            <div className="flex space-x-2">
              <button className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                Filter
              </button>
              <button className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
                Add Task
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {['To Do', 'In Progress', 'Completed'].map((column, colIndex) => (
              <div key={colIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-medium text-gray-800 mb-4">{column}</h3>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((item, i) => (
                    <div 
                      key={i} 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-800">
                          {colIndex === 0 ? `Create ${i === 0 ? 'marketing plan' : i === 1 ? 'social media schedule' : 'press release'}`
                            : colIndex === 1 ? `Design ${i === 0 ? 'product page' : i === 1 ? 'email templates' : 'presentation slides'}`
                            : `Finalize ${i === 0 ? 'launch strategy' : i === 1 ? 'budget allocation' : 'team assignments'}`
                          }
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          colIndex === 0 ? 'bg-yellow-100 text-yellow-800' 
                            : colIndex === 1 ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {colIndex === 0 ? 'Medium' : colIndex === 1 ? 'High' : 'Done'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {colIndex === 0 ? 'Due in 3 days' : colIndex === 1 ? 'Due tomorrow' : 'Completed 2 days ago'}
                      </p>
                      <div className="mt-3 flex items-center">
                        <div className="flex -space-x-2">
                          {[0, 1].map((avatar) => (
                            <div 
                              key={avatar} 
                              className={`h-6 w-6 rounded-full ${
                                avatar === 0 ? 'bg-primary/20' : 'bg-accent/20'
                              } flex items-center justify-center text-xs font-medium ${
                                avatar === 0 ? 'text-primary' : 'text-accent'
                              }`}
                            >
                              {avatar === 0 ? 'JS' : 'KM'}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-3">
                          {colIndex === 0 ? '2 comments' : colIndex === 1 ? '5 comments' : '8 comments'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardConcept;