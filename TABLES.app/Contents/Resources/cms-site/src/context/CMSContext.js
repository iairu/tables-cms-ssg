import React, { createContext, useContext } from 'react';
import useCMSDataHook from '../hooks/useCMSData';

const CMSContext = createContext(null);

export const CMSProvider = ({ children }) => {
    const cmsData = useCMSDataHook();

    return (
        <CMSContext.Provider value={cmsData}>
            {children}
        </CMSContext.Provider>
    );
};

export const useCMSData = () => {
    const context = useContext(CMSContext);
    if (!context) {
        throw new Error('useCMSData must be used within a CMSProvider');
    }
    return context;
};
