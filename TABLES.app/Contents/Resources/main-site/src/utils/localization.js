// Localization utilities for static text translations

export const translations = {
  en: {
    // Blog-related
    by: 'By',
    backToBlog: '← Back to Blog',
    pinned: '📌 Pinned',
    noBlogPosts: 'No blog posts yet.',
    
    // Breadcrumbs
    home: 'Home',
    blog: 'Blog',
    
    // Date-related
    months: {
      long: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      short: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
    },
    
    // General
    loading: 'Loading...',
    notFound: 'Not found',
    builtWith: 'Built with Gatsby',
    noContent: 'No content added yet. Please add components in the CMS.',
    

  },
  
  sk: {
    // Blog-related
    by: 'Autor',
    backToBlog: '← Späť na Blog',
    pinned: '📌 Pripnuté',
    noBlogPosts: 'Zatiaľ žiadne blogové príspevky.',
    
    // Breadcrumbs
    home: 'Domov',
    blog: 'Blog',
    
    // Date-related
    months: {
      long: [
        'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
        'Júl', 'August', 'September', 'Október', 'November', 'December'
      ],
      short: [
        'Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún',
        'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
      ]
    },
    
    // General
    loading: 'Načítava sa...',
    notFound: 'Nenájdené',
    builtWith: 'Vytvorené pomocou Gatsby',
    noContent: 'Zatiaľ nebol pridaný žiadny obsah. Pridajte komponenty v CMS.',
    

  }
};

/**
 * Get translated text for a given key and language
 * @param {string} key - Translation key (e.g., 'by', 'backToBlog')
 * @param {string} lang - Language code (e.g., 'en', 'sk')
 * @returns {string} Translated text
 */
export const t = (key, lang = 'en') => {
  const langTranslations = translations[lang] || translations['en'];
  const keys = key.split('.');
  
  let result = langTranslations;
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) {
      // Fallback to English if translation not found
      result = translations['en'];
      for (const k of keys) {
        result = result?.[k];
      }
      return result || key;
    }
  }
  
  return result || key;
};

/**
 * Format date according to language
 * @param {Date|string} date - Date to format
 * @param {string} lang - Language code (e.g., 'en', 'sk')
 * @param {string} format - Format type: 'long' (default), 'short', 'numeric'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, lang = 'en', format = 'long') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  
  const langTranslations = translations[lang] || translations['en'];
  
  if (format === 'numeric') {
    // DD.MM.YYYY for Slovak, MM/DD/YYYY for English
    if (lang === 'sk') {
      return `${day}.${month + 1}.${year}`;
    }
    return `${month + 1}/${day}/${year}`;
  }
  
  const monthFormat = format === 'short' ? 'short' : 'long';
  const monthName = langTranslations.months[monthFormat][month];
  
  // Slovak format: DD. Month YYYY, English format: Month DD, YYYY
  if (lang === 'sk') {
    return `${day}. ${monthName} ${year}`;
  }
  
  return `${monthName} ${day}, ${year}`;
};

/**
 * Get month name in specified language
 * @param {number} monthIndex - Month index (0-11)
 * @param {string} lang - Language code (e.g., 'en', 'sk')
 * @param {string} format - Format type: 'long' (default) or 'short'
 * @returns {string} Month name
 */
export const getMonthName = (monthIndex, lang = 'en', format = 'long') => {
  const langTranslations = translations[lang] || translations['en'];
  const monthFormat = format === 'short' ? 'short' : 'long';
  return langTranslations.months[monthFormat][monthIndex] || monthIndex.toString();
};