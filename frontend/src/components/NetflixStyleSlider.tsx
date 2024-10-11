import React, { useState, useRef, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Bookstore } from "../pages/app";
import { useSwipeable } from 'react-swipeable';

interface NetflixStyleSliderProps {
  personalizedRecommendations: Array<string>;
  imageSrc?: Array<string>;
  preventDefaultTouchmoveEvent?: boolean;
}

const NetflixStyleSlider: React.FC<NetflixStyleSliderProps> = ({ personalizedRecommendations, imageSrc }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookstoreList, setBookstoreList] = useState<Bookstore[]>([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [randomImages, setRandomImages] = useState<string[]>([]);

  const getFacilityInfo = (ID: string): { name: string | null; description: string | null } => {
    const foundBookstore = bookstoreList.find((bookstore) => bookstore.ESNTL_ID === ID);
    return {
      name: foundBookstore ? foundBookstore.FCLTY_NM : null,
      description: foundBookstore ? foundBookstore.OPTN_DC : null,
    };
  };

  const nextSlide = () => {
    if (currentIndex < personalizedRecommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setIsSwiping(true);
      setSwipeOffset(eventData.deltaX);
    },
    onSwipedLeft: () => {
      setIsSwiping(false);
      setSwipeOffset(0);
      nextSlide();
    },
    onSwipedRight: () => {
      setIsSwiping(false);
      setSwipeOffset(0);
      prevSlide();
    },
    onSwiped: () => {
      setIsSwiping(false);
      setSwipeOffset(0);
    },
    trackMouse: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("../data/bookstore.json");
        const data = await response.json();
        setBookstoreList(data);
      } catch (error) {
        console.error("Error fetching bookstore data:", error);
      }
    };

    fetchData();
  }, []); 

  useEffect(() => {
    if (sliderRef.current) {
      const offset = isSwiping ? swipeOffset : 0;
      sliderRef.current.style.transform = `translateX(calc(-${currentIndex * 100}vw + ${offset}px))`;
    }
  }, [currentIndex, isSwiping, swipeOffset]);

  useEffect(() => {
    const getRandomImage = () => {
      if (!imageSrc || imageSrc.length === 0) return 'defaultImage.jpg';
      const randomIndex = Math.floor(Math.random() * imageSrc.length);
      return imageSrc[randomIndex];
    };

    const newRandomImages = personalizedRecommendations.map(() => getRandomImage());
    setRandomImages(newRandomImages);
  }, [personalizedRecommendations, imageSrc]);

  return (
    <div className=''>
    <div className="relative overflow-hidden w-[90vw] md:w-[80vw] mx-auto " data-uia="nmhp-top-10">
      <div className="relative " {...handlers}>
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-green-700 bg-opacity-50 text-white p-2 rounded-full"
          disabled={currentIndex === 0}
        >
          <FaArrowLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-green-900 bg-opacity-50 text-white p-2 rounded-full "
          disabled={currentIndex === personalizedRecommendations.length - 1}
        >
          <FaArrowRight size={24} />
        </button>
        <div
          ref={sliderRef}
          className="flex transition-transform duration-300 ease-in-out"
          style={{ width: `${personalizedRecommendations.length * 100}vw` }}
        >
          <div className='flex '>
          {personalizedRecommendations.map((id, index) => {
            const facilityInfo = getFacilityInfo(id);
            return (
              <div key={index} className="flex-shrink-0 w-[300px] mx-4">
                <div 
                  className="relative rounded-2xl overflow-hidden pointer-events-none border-[#29bc29] border-opacity-50 border-[6px]"
                  style={{
                    boxShadow: '8px 8px 16px #bcbcbcb0, -8px -8px 16px #fffdf7'
                  }}
                >
                  <img
                    src={randomImages[index]}
                    alt={facilityInfo.name || "책방 이미지"}
                    className="w-full h-[250px] object-cover brightness-200"
                    style={{
                      filter: 'grayscale(50%)',
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent min-h-32 pt-4 pb-4 px-4">
                    <h3 className="text-white text-xl font-bold bg-green-900 inline-block px-2 rounded-full py-1 bg-opacity-70">
                      {facilityInfo.name || "Unknown Facility"}
                    </h3>
                    <p className="flex text-black text-sm mt-1 line-clamp-2">
                      {facilityInfo.description || "No description available"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
  </div>

        </div>
      </div>
      <div className="flex justify-center mt-4">
        {personalizedRecommendations.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full mx-1 ${index === currentIndex ? 'bg-green-500' : 'bg-white border'}`}
          />
        ))}
      </div>
    </div>


</div>
  );
};

export default NetflixStyleSlider;
