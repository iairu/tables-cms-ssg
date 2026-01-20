import { navigate as gatsbyNavigate } from 'gatsby';

export const createNavigation = (showLoading, hideLoading) => (to, options) => {
  showLoading();
  gatsbyNavigate(to, options);
  // The loading bar will be hidden by the layout when the new page is rendered.
  // We can add a small timeout to hide it in case the navigation fails
  setTimeout(hideLoading, 1000);
};
