
import React from "react";

const Slide = ({ slide }) => {
  const { type, src, alt } = slide;

  const renderSlide = () => {
    if (type === "image") {
      return <img src={src} alt={alt || ""} />;
    } else if (type === "video") {
      return (
        <video controls>
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return null;
    }
  };

  return <div className="slide">{renderSlide()}</div>;
};

export default Slide;
