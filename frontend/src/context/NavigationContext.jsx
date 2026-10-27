import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [pageSections, setPageSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState('');

  // Register or clear sections for the current page
  const registerSections = useCallback((sections) => {
    const newSections = sections || [];
    setPageSections((prevSections) => {
      // Avoid state update if sections are identical
      if (
        prevSections.length === newSections.length &&
        prevSections.every((sec, idx) => sec.id === newSections[idx]?.id && sec.label === newSections[idx]?.label)
      ) {
        return prevSections;
      }
      return newSections;
    });

    if (newSections.length > 0) {
      setActiveSectionId((prev) => (prev === newSections[0].id ? prev : newSections[0].id));
    } else {
      setActiveSectionId((prev) => (prev === '' ? prev : ''));
    }
  }, []);

  // Smooth scroll with offset for sticky header
  const scrollToSection = useCallback((id) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update hash without jumping
      try {
        window.history.pushState(null, null, `#${id}`);
      } catch (e) {
        // Safe catch for environment constraints
      }
    }
  }, []);

  const value = useMemo(() => ({
    pageSections,
    activeSectionId,
    registerSections,
    scrollToSection,
    setActiveSectionId
  }), [pageSections, activeSectionId, registerSections, scrollToSection]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const usePageNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    return {
      pageSections: [],
      activeSectionId: '',
      registerSections: () => {},
      scrollToSection: () => {},
      setActiveSectionId: () => {}
    };
  }
  return context;
};
