import React, { useEffect } from 'react';
import { usePageNavigation } from '../../context/NavigationContext';

export const SectionSubnav = () => {
  const { pageSections, activeSectionId, scrollToSection, setActiveSectionId } = usePageNavigation();

  useEffect(() => {
    if (!pageSections || pageSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1
      }
    );

    pageSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pageSections, setActiveSectionId]);

  if (!pageSections || pageSections.length === 0) return null;

  return (
    <nav 
      aria-label="Page section navigation"
      className="sticky top-14 sm:top-16 md:top-20 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-2xs py-2 px-3 sm:px-6 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 w-full">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md shrink-0 mr-1 hidden sm:inline-block">
            Jump to:
          </span>
          {pageSections.map((sec) => {
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs scale-102'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
