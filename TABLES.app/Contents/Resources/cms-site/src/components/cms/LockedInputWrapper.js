import React from 'react';

const LockedInputWrapper = ({ fieldId, children, cmsData }) => {
    const { collabState, requestLock, releaseLock } = cmsData;

    const lock = collabState?.activeLocks?.find(l => l.fieldId === fieldId);

    // Determine if locked by someone else
    // Note: We need socketId in collabState to be accurate, but for now we rely on the server validation
    // and the fact that we receive 'lock-denied' if we fail. 
    // Visually, we show it as locked if ANY lock exists and it's not (presumably) us.
    // Ideally, we check lock.socketId !== collabState.socketId.
    const isLockedByOther = lock && lock.socketId !== collabState.socketId;

    const handleFocus = () => {
        requestLock(fieldId);
    };

    const handleBlur = () => {
        releaseLock(fieldId);
    };

    // Clone child to add handlers
    const child = React.Children.only(children);
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {React.cloneElement(child, {
                onFocus: (e) => {
                    handleFocus();
                    if (child.props.onFocus) child.props.onFocus(e);
                },
                onBlur: (e) => {
                    handleBlur();
                    if (child.props.onBlur) child.props.onBlur(e);
                },
                disabled: isLockedByOther || child.props.disabled, // Respect existing disabled state
                style: {
                    ...child.props.style,
                    border: isLockedByOther ? '1px solid #e11d48' : child.props.style?.border,
                    background: isLockedByOther ? '#fff1f2' : child.props.style?.background,
                    cursor: isLockedByOther ? 'not-allowed' : child.props.style?.cursor
                }
            })}
            {isLockedByOther && (
                <div style={{
                    position: 'absolute',
                    top: '-22px',
                    right: '0',
                    background: '#e11d48',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '4px 4px 0 0',
                    zIndex: 10,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    pointerEvents: 'none'
                }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i>
                    Editing: {lock.clientName}
                </div>
            )}
        </div>
    );
};

export default LockedInputWrapper;
