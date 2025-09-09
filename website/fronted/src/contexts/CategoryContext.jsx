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
      
      const serviceResponse = await fetch(`${API_ENDPOINTS.SERVICES}/categories?t=${Date.now()}`);
      const serviceData = await serviceResponse.json();
      if (serviceData.success) {
        setServiceCategories(serviceData.data);
      }

      const articlesResponse = await fetch(`${API_ENDPOINTS.ARTICLES}?t=${Date.now()}`);
      const articlesData = await articlesResponse.json();
      if (articlesData.success && articlesData.data.articles) {
        const uniqueCategories = [...new Set(articlesData.data.articles.map(article => article.category))];
        const knowledgeCategories = uniqueCategories.map(category => ({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          type: 'knowledge',
          description: `Articles about ${category}`,
          icon: 'BookOpen',
          color: 'Blue',
          is_active: true
        }));
        setKnowledgeCategories(knowledgeCategories);
      }
      
      setLastUpdated(Date.now());
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCategories();
    }, 30000);

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
    fetchCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
