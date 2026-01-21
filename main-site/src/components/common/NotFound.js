import React from 'react';
import { t } from '../../utils/localization';

const NotFound = ({ language }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}>
    <div>{t('notFound', language)}</div>
  </div>
);

export default NotFound;
