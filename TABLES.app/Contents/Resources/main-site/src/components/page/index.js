import React from 'react';
import TitleSlide from './TitleSlide';
import Boxes from './Boxes';
import Infobar from './Infobar';
import Flies from './Flies';
import Slide from './Slide';
import Video from './Video';
import Ranking from './Ranking';
import References from './References';
import Reviews from './Reviews';

const PageComponent = ({ row }) => {
  switch (row.component) {
    case 'TitleSlide':
      return <TitleSlide row={row} />;
    case 'Boxes':
      return <Boxes row={row} />;
    case 'Infobar':
      return <Infobar row={row} />;
    case 'Flies':
      return <Flies row={row} />;
    case 'Slide':
      return <Slide row={row} />;
    case 'Video':
      return <Video row={row} />;
    case 'Ranking':
      return <Ranking row={row} />;
    case 'References':
      return <References row={row} />;
    case 'Reviews':
      return <Reviews row={row} />;
    default:
      return null;
  }
};

export default PageComponent;
