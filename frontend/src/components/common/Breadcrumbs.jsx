import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbName = (name) => {
    // Map specific paths to user-friendly names if needed
    const translations = {
      'portal': 'Client Portal',
      'admin': 'Admin Portal',
      'crm': 'CRM',
      'gallery': 'Smart Gallery',
      'finance': 'Finance',
      'calendar': 'Calendar',
      'activity-log': 'Activity Log',
      'chats': 'Chats',
      'cloud': 'Cloud',
    };
    return translations[name] || name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <nav className="flex mb-4 overflow-x-auto no-scrollbar whitespace-nowrap py-1" aria-label="Breadcrumb">
      <ol className="inline-flex items-center gap-1.5 md:gap-3 bg-stone-100/50 backdrop-blur-xl px-4 py-1.5 rounded-full border border-stone-200/50 shadow-sm">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-all duration-300"
          >
            <Home className="w-3 h-3 mr-1.5 opacity-60" />
            <span className="hidden xs:inline">Home</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to} className="flex items-center animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 80}ms` }}>
              <ChevronRight className="w-3 h-3 text-stone-300 mx-0.5" />
              {last ? (
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-900 px-2 py-0.5 rounded-lg bg-stone-100 max-w-[120px] truncate">
                  {getBreadcrumbName(value)}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-all duration-300 px-1 max-w-[100px] truncate"
                >
                  {getBreadcrumbName(value)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
