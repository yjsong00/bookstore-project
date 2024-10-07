import React, { useState, useRef, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Bookstore } from "../pages/app";
import { useSwipeable } from 'react-swipeable';


  interface NetflixStyleSliderProps {
    personalizedRecommendations:Array<string>;
    imageSrc?: string;
    preventDefaultTouchmoveEvent?: boolean; // 필요 시 추가

  }
  

  const NetflixStyleSlider: React.FC<NetflixStyleSliderProps> = ({ personalizedRecommendations, imageSrc }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bookstoreList, setBookstoreList] = useState<Bookstore[]>([]);
    const [showBookstoreList, setShowBookstoreList] = useState<Boolean>(false); // Toggle state for bookstore list
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const sliderRef = useRef<HTMLDivElement | null>(null);




    const getFacilityInfo = (
        ID: string
      ): { name: string | null; description: string | null } => {
        const foundBookstore = bookstoreList.find(
          (bookstore) => bookstore.ESNTL_ID === ID
        );
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
    // preventDefaultTouchmoveEvent: true,
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
        sliderRef.current.style.transform = `translateX(calc(-${currentIndex * 100}% + ${offset}px))`;
    }
}, [currentIndex, isSwiping, swipeOffset]);

  return (
    <div className="relative overflow-hidden  mx-auto w-[90%] md:w-[80%]" data-uia="nmhp-top-10">
      <h1 className="">개인화된 책방 추천</h1>
      <div className="relative" {...handlers}>
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full"
          disabled={currentIndex === 0}
        >
          <FaArrowLeft size={24} /> 
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full"
          disabled={currentIndex === personalizedRecommendations.length - 1}
        >
          <FaArrowRight size={24} />
        </button>
        <div
          ref={sliderRef}
          className="flex transition-transform duration-300 ease-in-out"
          style={{ width: `${personalizedRecommendations.length * 10}%` }}
        >
                        {personalizedRecommendations.map(
                          (id, index) => {
                            const facilityInfo =
                              getFacilityInfo(id);
            return (
              <div key={index} className="flex-shrink-0 px-2">
                <div className="relative rounded-2xl overflow-hidden pointer-events-none">
                  <img
                    src={imageSrc || 'defaultImage.jpg'}
                    alt={facilityInfo.name || "책방 이미지"}
                    className="w-[22vw] h-[18vw] object-cover "
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent min-h-32 pt-4 pb-4 px-4">
                    <h3 className="text-white text-xl font-bold">
                      {facilityInfo.name || "Unknown Facility"}
                    </h3>
                    <p className="flex text-white text-sm mt-1">
                      {facilityInfo.description || "No description available"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center mt-4">
        {personalizedRecommendations.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full mx-1 ${
              index === currentIndex ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default NetflixStyleSlider;