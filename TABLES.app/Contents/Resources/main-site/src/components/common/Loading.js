import React from 'react';
import { t } from '../../utils/localization';

const Loading = ({ language }) => (
  <div className="loading-container">
    <div>{t('loading', language)}</div>
  </div>
);

export default Loading;
