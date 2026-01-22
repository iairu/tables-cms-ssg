// count: which next section to go to (1 = first (default), 2 = second, ...)
// animate: true (default) for smoothscroll, false for instant scroll
// callingElement: an optional DOM element; if provided, the "next section" count
//                 starts from the closest .content-section parent of this element.

// import smoothscroll from "smoothscroll-polyfill";
// smoothscroll.polyfill();
if (typeof window !== 'undefined') {
  // Changed to a regular function to allow 'this' context to be dynamically bound.
  window.nextSection = function(count = 1, offsetSearch = window.pageYOffset, animate = true, callingElement = null) {
    var sections = document.querySelectorAll(".content-section");
    var header = document.getElementsByTagName("header");
    var offsetHeader = (header.length) ? (header[0].getBoundingClientRect().height) : 0;

    if (sections.length === 0) {
      return; // No sections to scroll to
    }

    // Determine the actual calling element.
    // If 'callingElement' was not explicitly provided as an argument,
    // and 'this' refers to a DOM element (e.g., when called as an event handler
    // via `element.onclick = nextSection`), use 'this' as the calling element.
    let actualCallingElement = callingElement;
    if (actualCallingElement === null && this instanceof Element && this !== window) {
      actualCallingElement = this;
    }

    let currentSectionIdx = -1; // Initialize to -1 to indicate it hasn't been found yet

    // Option 1: Determine the current section based on the actualCallingElement's parent .content-section
    if (actualCallingElement instanceof Element) {
      const parentSection = actualCallingElement.closest('.content-section');
      if (parentSection) {
        // Find the index of this parentSection within the 'sections' NodeList
        for (let i = 0; i < sections.length; i++) {
          if (sections[i] === parentSection) {
            currentSectionIdx = i;
            break;
          }
        }
      }
    }

    // Option 2: If currentSectionIdx was not determined by callingElement (or no parent found),
    // determine it based on the scroll position (original implementation).
    if (currentSectionIdx === -1) {
      currentSectionIdx = 0; // Default to the first section if no section found by scroll position
      for (let i = 0; i < sections.length; i++) {
        // Calculate the effective top of the section, considering the fixed header.
        // If `sections[i].offsetTop` is the absolute position of the section,
        // and `offsetHeader` is the height of a fixed header, then the point where
        // this section visually appears at the top of the content area is
        // `sections[i].offsetTop - offsetHeader`.
        const sectionTopAdjusted = sections[i].offsetTop - offsetHeader;

        if (sectionTopAdjusted <= offsetSearch) {
          currentSectionIdx = i;
        } else {
          // The current scroll position `offsetSearch` is *above` the adjusted top
          // of this section, meaning `currentSectionIdx` holds the index of the
          // section that `offsetSearch` is currently within or has just passed.
          break;
        }
      }
    }

    // Calculate the target index.
    // `count` is 1-based, meaning `count=1` is the next section, `count=2` is the second next, etc.
    // If `currentSectionIdx` is `k`, and `count` is 1, the target should be `k + 1`.
    // So, the `targetIndex` is `currentSectionIdx + count`.
    let targetIndex = currentSectionIdx + count;

    // Ensure the target index is within the valid range of section indices.
    if (targetIndex >= sections.length) {
      targetIndex = sections.length - 1; // Cap at the last section
    }
    if (targetIndex < 0) {
      targetIndex = 0; // Should not happen with count >= 1, but for safety.
    }

    // Scroll to the calculated target section.
    window.scrollTo({
      top: sections[targetIndex].offsetTop - offsetHeader + 1, // +1 for pixel underflow, as in original
      behavior: animate ? "smooth" : "auto" // Use the 'animate' parameter
    });
  }
}