import React from 'react';

const SlugPicker = ({ cmsData, onSelectSlug }) => {
  const pages = cmsData.pages || [];
  const blogArticles = cmsData.blogArticles || [];

  const handleSlugChange = (e) => {
    onSelectSlug(e.target.value);
  };

  return (
    <select onChange={handleSlugChange} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }}>
      <option value="">Select a page or blog post</option>
      <optgroup label="Pages">
        {pages.map(page => (
          <option key={`page-${page.id}`} value={`${page.slug}`}>
            {page.slug}
          </option>
        ))}
      </optgroup>
      {blogArticles.length > 0 && (
        <optgroup label="Blog Posts">
          {blogArticles.map(article => (
            <option key={`blog-${article.id}`} value={`blog/${article.slug}`}>
              {article.slug}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
};

export default SlugPicker;
