import React from 'react';
import { t, formatDate } from '../../utils/localization';

const ArticleCard = ({ article, currentLanguage, getLocalizedContent }) => {
  const localizedContent = getLocalizedContent(article, currentLanguage);

  return (
    <a
      key={article.id}
      href={`/${currentLanguage}/blog/${article.year}/${article.month}/${localizedContent.slug}`}
      style={{
        display: 'block',
        background: article.highlighted ? '#fefce8' : 'white',
        padding: '1.5rem',
        textDecoration: 'none',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s',
        border: article.highlighted ? '2px solid #facc15' : '1px solid #e2e8f0',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#667eea';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = article.highlighted ? '#facc15' : '#e2e8f0';
      }}
    >
      {article.highlighted && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: '#fbbf24',
          color: '#78350f',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {t('pinned', currentLanguage)}
        </div>
      )}
      <h4 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#0f172a',
        paddingRight: article.highlighted ? '6rem' : '0'
      }}>
        {localizedContent.title}
      </h4>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: '#64748b',
        fontSize: '0.875rem'
      }}>
        {(localizedContent.author || article.author) && (
          <span>{t('by', currentLanguage)} {localizedContent.author || article.author}</span>
        )}
        {article.date && (
          <span>
            {formatDate(article.date, currentLanguage, 'long')}
          </span>
        )}
      </div>
      
      {((localizedContent.category || article.category) || (localizedContent.tags || article.tags)) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          marginTop: '0.75rem'
        }}>
          {(localizedContent.category || article.category) && (
            <span style={{
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '0.25rem 0.5rem',
              
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {localizedContent.category || article.category}
            </span>
          )}
          {(localizedContent.tags || article.tags) && (localizedContent.tags || article.tags).split(',').map((tag, idx) => (
            <span 
              key={idx}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '0.25rem 0.5rem',
                
                fontSize: '0.75rem'
              }}
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
      
      {(localizedContent.content || article.content) && (
        <p style={{
          marginTop: '1rem',
          color: '#475569',
          lineHeight: '1.6',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {localizedContent.content || article.content}
        </p>
      )}
    </a>
  );
}

export default ArticleCard;