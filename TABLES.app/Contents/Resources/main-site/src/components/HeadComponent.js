import React from 'react';
import { Helmet } from 'react-helmet';

const HeadComponent = ({ fullTitle, description, favicon, lang }) => (
  <Helmet htmlAttributes={lang ? { lang } : {}}>
    <title>{fullTitle}</title>
    {description !== undefined && <meta name="description" content={description} />}
    {favicon && <link rel="icon" href={favicon} />}
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />
    {/* Static assets linking */}
    <script src="/assets/nextSection.js"></script>
  </Helmet>
);

export default HeadComponent;
