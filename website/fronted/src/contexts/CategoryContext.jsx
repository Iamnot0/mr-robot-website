import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../utils/config';
const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [serviceCategories, setServiceCategories] = useState([]);
  const [knowledgeCategories, setKnowledgeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
         // Try to fetch service categories with proper error handling
         try {
           const serviceResponse = await fetch(`${API_ENDPOINTS.SERVICES}/categories?t=${Date.now()}`);
           if (serviceResponse.ok) {
             const responseText = await serviceResponse.text();
             if (responseText) {
               try {
                 const serviceData = JSON.parse(responseText);
                 if (serviceData.success) {
                   setServiceCategories(serviceData.data);
                 }
               } catch (parseError) {
                 console.warn('CategoryContext - Service categories JSON parse failed:', parseError);
               }
             }
           } else {
             console.warn('CategoryContext - Service categories API returned:', serviceResponse.status);
           }
         } catch (serviceError) {
           console.warn('CategoryContext - Service categories fetch failed:', serviceError);
         }

      // Try to fetch knowledge categories with proper error handling
      try {
        const knowledgeResponse = await fetch(`${API_ENDPOINTS.ARTICLES}?t=${Date.now()}`);
        if (knowledgeResponse.ok) {
          const responseText = await knowledgeResponse.text();
          if (responseText) {
            try {
              const knowledgeData = JSON.parse(responseText);
              if (knowledgeData.success && knowledgeData.data && knowledgeData.data.articles) {
            const categories = [...new Set(knowledgeData.data.articles.map(article => article.category))].map(category => ({
              id: category.toLowerCase().replace(/\s+/g, '-'),
              name: category,
              description: `${category} articles and tutorials`,
              icon: 'BookOpen',
              color: 'Blue',
              is_active: true,
              sort_order: 0
            }));
                setKnowledgeCategories(categories);
              } else {
                setFallbackCategories();
              }
            } catch (parseError) {
              console.warn('CategoryContext - Knowledge categories JSON parse failed:', parseError);
              setFallbackCategories();
            }
          } else {
            setFallbackCategories();
          }
        } else {
          console.warn('CategoryContext - Knowledge categories API returned:', knowledgeResponse.status);
          setFallbackCategories();
        }
      } catch (knowledgeError) {
        console.warn('CategoryContext - Knowledge categories fetch failed:', knowledgeError);
        setFallbackCategories();
      }
      
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('CategoryContext - Error fetching categories:', error);
      setFallbackCategories();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackCategories = () => {
    const fallbackCategories = [
      {
        id: 'computer-science',
        name: 'Computer Science',
        description: 'Computer Science articles and tutorials',
        icon: 'BookOpen',
        color: 'Blue',
        is_active: true,
        sort_order: 0
      },
      {
        id: 'a-plus',
        name: 'A+',
        description: 'A+ certification articles and tutorials',
        icon: 'BookOpen',
        color: 'Blue',
        is_active: true,
        sort_order: 1
      }
    ];
    setKnowledgeCategories(fallbackCategories);
  };

  const updateServiceCategory = (updatedCategory) => {
    setServiceCategories(prev => 
      prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
    setLastUpdated(Date.now());
  };

  const updateKnowledgeCategory = (updatedCategory) => {
    setKnowledgeCategories(prev => 
      prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
    setLastUpdated(Date.now());
  };

  const refreshCategories = () => {
    fetchCategories();
  };

  const initializeCategories = () => {
    if (serviceCategories.length === 0) {
      fetchCategories();
    }
  };

  useEffect(() => {
    // Fetch categories when component mounts
    fetchCategories();
  }, []);

  useEffect(() => {
    // Auto-refresh every 5 minutes (not 30s — avoids unnecessary API calls)
    const interval = setInterval(() => {
      fetchCategories();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    serviceCategories,
    knowledgeCategories,
    loading,
    lastUpdated,
    updateServiceCategory,
    updateKnowledgeCategory,
    refreshCategories,
    fetchCategories,
    initializeCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
