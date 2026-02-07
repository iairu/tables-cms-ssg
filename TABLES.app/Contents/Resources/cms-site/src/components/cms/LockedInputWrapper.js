import React from 'react';

const LockedInputWrapper = ({ fieldId, children, cmsData }) => {
    const { collabState, requestLock, releaseLock } = cmsData;
    const { isConnected, socketId, activeLocks } = collabState || {};

    const lock = activeLocks?.find(l => l.fieldId === fieldId);

    // Determine lock status
    const isLockedByMe = lock && lock.socketId === socketId;
    const isLockedByOther = lock && lock.socketId !== socketId;

    const handleFocus = () => {
        if (isConnected) {
            requestLock(fieldId);
        }
    };

    const handleBlur = () => {
        if (isConnected && isLockedByMe) {
            releaseLock(fieldId);
        }
    };

    // Cleanup on unmount: if we hold the lock, release it
    React.useEffect(() => {
        return () => {
            if (isConnected && isLockedByMe) {
                // We typically can't use the state 'isLockedByMe' directly in cleanup 
                // because of closure staleness, but 'activeLocks' changes will trigger re-renders.
                // However, to be safe and ensure we release if we *think* we have it,
                // we can just attempt to release it. 
                // Better yet, check the ref if possible, but here we can rely on re-renders 
                // or just fire releaseLock blind which is safe (server ignores if not locked by us).
                releaseLock(fieldId);
            }
        };
    }, [fieldId, isConnected, isLockedByMe, releaseLock]);

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
                disabled: isLockedByOther || !isConnected || child.props.disabled, // Restore disabled if disconnected? Maybe just warn? Let's disable to prevent data loss if offline
                style: {
                    ...child.props.style,
                    border: isLockedByOther
                        ? '1px solid #e11d48'
                        : isLockedByMe
                            ? '1px solid #10b981' // Green for "Locked by me"
                            : child.props.style?.border,
                    background: isLockedByOther ? '#fff1f2' : (isLockedByMe ? '#ecfdf5' : child.props.style?.background),
                    cursor: isLockedByOther ? 'not-allowed' : child.props.style?.cursor,
                    outline: isLockedByMe ? 'none' : child.props.style?.outline // Remove default outline if we have custom border
                }
            })}
            {isLockedByOther && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(225, 29, 72, 0.9)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    zIndex: 100, // Increased zIndex
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i>
                    Editing: {lock.clientName}
                </div>
            )}
            {/* Optional: "Locked by Me" badge? Maybe just the border is enough for now to keep it clean. */}
        </div>
    );
};

export default LockedInputWrapper;
