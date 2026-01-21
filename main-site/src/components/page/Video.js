import React from 'react';

const Video = ({ row }) => {
  return (
    <div style={{
      padding: row.fields.specialTheme === 'autoplay-fullwidth' ? '0' : '2rem',
      background: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: row.fields.specialTheme === 'autoplay-fullwidth' ? '100%' : '800px',
        width: '100%',
        position: 'relative',
        paddingBottom: row.fields.specialTheme === 'iphone' ? '0' : '56.25%',
        height: row.fields.specialTheme === 'iphone' ? '600px' : '0',
        borderRadius: row.fields.specialTheme.includes('iphone') ? '30px' : '0',
        overflow: 'hidden',
        border: row.fields.specialTheme.includes('iphone') ? '8px solid #1e293b' : 'none'
      }}>
        <iframe
        src={`https://www.youtube.com/embed/${
          row.fields.youtubeUrl.includes('youtu.be/')
            ? row.fields.youtubeUrl.split('youtu.be/')[1].split('?')[0]
            : row.fields.youtubeUrl.split('v=')[1]?.split('&')[0] || row.fields.youtubeUrl
        }${row.fields.specialTheme.includes('autoplay') ? '?autoplay=1&mute=1' : ''}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default Video;
