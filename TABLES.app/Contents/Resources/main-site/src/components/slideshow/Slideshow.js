
import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slide from "./Slide";
import "./slideshow.css";

const Slideshow = ({ slides, minHeight, maxHeight }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isPaused,
    autoplaySpeed: 3000,
    cssEase: "linear",
  };

  const style = {
    minHeight: minHeight ? `${minHeight}vh` : '30vh',
    maxHeight: maxHeight ? `${maxHeight}vh` : '70vh',
  };

  const next = () => {
    sliderRef.current.slickNext();
  };

  const previous = () => {
    sliderRef.current.slickPrev();
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setIsHovered(false);
  };

  return (
    <div 
      className="slideshow" 
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Slider {...settings} ref={sliderRef}>
        {slides && slides.map((slide, index) => (
          <Slide key={index} slide={slide} />
        ))}
      </Slider>
      {isHovered && (
        <>
          <div className="slideshow-pause-indicator">
            <i className="fa fa-pause"></i>
          </div>
          <button className="slideshow-nav-button prev" onClick={previous}>
            <i className="fa fa-angle-double-left"></i>
          </button>
          <button className="slideshow-nav-button next" onClick={next}>
            <i className="fa fa-angle-double-right"></i>
          </button>
        </>
      )}
    </div>
  );
};

export default Slideshow;
