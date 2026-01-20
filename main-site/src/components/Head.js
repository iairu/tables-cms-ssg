import React from 'react';

const Head = ({ fullTitle, description, favicon, lang }) => {
  return (
    <>
      <title>{fullTitle}</title>
      {description !== undefined && <meta name="description" content={description} />}
      {favicon && <link rel="icon" href={favicon} />}
      {lang && <html lang={lang} />}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
    </>
  );
};

export default Head;