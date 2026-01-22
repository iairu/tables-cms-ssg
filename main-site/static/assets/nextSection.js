// count: which next section to go to (1 = first (default), 2 = second, ...)
// animate: true (default) for smoothscroll, false for instant scroll

// import smoothscroll from "smoothscroll-polyfill";
// smoothscroll.polyfill();
if (typeof window !== 'undefined') {
  window.nextSection = (offsetSearch = window.pageYOffset, count = 1, animate = true) => {
    // var sections = document.getElementsByTagName("section");
    var sections = document.querySelectorAll(".content-section");
    // var offsetHeader = (document.getElementsByClassName("header-margin-fix").length) ? (document.getElementsByClassName("header-margin-fix")[0].clientHeight) : 0;
    var header = document.getElementsByTagName("header");
    var offsetHeader = (header.length) ? (header[0].getBoundingClientRect().height) : 0;
    // var y = window.pageYOffset;

    // Determine which section to scroll to
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop >= offsetSearch) {
        var to = (i + count - 1) < sections.length ? (i + count - 1) : (sections.length - 1);
        // sections[to].scrollIntoView({behavior: animate ? "smooth" : "auto"});  --> doesn't have offsetTop to offset the fixed header
        window.scrollTo({
          top: sections[to].offsetTop - offsetHeader + 1, // +1 because sometimes there is an underflow pixel (e.g. ios safari)
          behavior: animate ? "smooth" : "auto"
        });
        break;
      }
    }
  }
}