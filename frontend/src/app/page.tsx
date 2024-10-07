"use client";
import "./../app/globals.css";
import Script from "next/script";
import axios from "axios";
import { NavComponent } from "./../components/nav";
import Image from "next/image";
import book from "./../static/book.png";
import movie from "./../static/movie.gif";
import { useAuth } from "./../hooks/useAuth";
import React, { useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { Bookstore } from "../pages/app";
import BookstoreListSkeleton from "./../components/BookstoreListSkeleton";
import Gradient from "./../components/gradient";
import NetflixStyleSlider from '../components/NetflixStyleSlider';



// import HowTo from "../static/";
// import Video from "next/video"; // 비디오 컴포넌트를 사용하기 위해 import

const instance_ai = axios.create({
  baseURL: "https://www.taehyun35802.shop",
});
const getImage = async () => {
  try {
    const response = await fetch(
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-3.jpeg"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }
    const blob = await response.blob(); // Blob 형태로 변환
    const imageUrl = URL.createObjectURL(blob); // Blob URL 생성
    return imageUrl; // Blob URL 반환
  } catch (error) {
    console.error("Error fetching image:", error);
    return undefined;
  }
};

const HomeClient: React.FC = () => {
  const { isLoggedIn, userInfo, logout } = useAuth();
  const [aiClick, setAiClick] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [bookstoreList, setBookstoreList] = useState<Bookstore[]>([]);
  const [aiList, setAiList] = useState<any[]>([]);
  const [showBookstoreList, setShowBookstoreList] = useState<Boolean>(false); // Toggle state for bookstore list
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] =
    useState<any[]>([]);
  const [isPersonalizeLoading, setIsPersonalizeLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement>(null);

  const categories = [
    "모임",
    "디저트",
    "상점",
    "전문",
    "중간",
    "아늑한",
    "도시",
    "커피",
    "요리",
    "방법",
    "소품",
    "파티",
    "콩",
    "방",
    "분위기",
    "시설",
    "임대",
    "프로젝터",
    "사람들",
    "구매",
    "음악",
    "객실",
    "서비스",
    "맛",
    "보다",
    "대기",
    "작성자",
    "쿠키",
    "성분",
    "입구",
    "회의",
    "행사",
    "생활",
    "라이브러리",
    "생성",
    "소유자",
    "그룹",
    "기획",
    "월",
    "출판",
    "실내",
    "도서관",
    "활동",
    "숲",
    "시",
    "이벤트",
    "차",
    "설탕",
    "테라스",
    "사진",
    "세미나",
    "하우스",
    "클럽",
    "방식",
    "좌석",
    "체험",
    "음식",
  ];

  const imageUrl = getImage();

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

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSearch = async () => {
    const query = inputValue + " " + selectedCategories.join(" ");
    const isKeyword = !inputValue && selectedCategories.length > 0;
    setShowBookstoreList(true);

    setIsLoading(true);
    console.log("Sending to backend:", {
      searchQuery: inputValue,
      categories: selectedCategories,
      query: query,
      keyword: isKeyword,
    });

    const aiparam = {
      searchQuery: inputValue,
      categories: selectedCategories,
      query: query,
      keyword: isKeyword,
    };

    const AiUrl = "/recommend";
    const AiSearch = async () => {
      try {
        const response = await instance_ai.post(AiUrl, aiparam, {
          headers: { "Content-Type": "application/json" },
        });
        const result = response.data;
        console.log(result);

        setAiList(result);
        console.log("Updated aiList:", result);
        setIsLoading(false);
      } catch (error) {
        if (error) {
          console.error("Error data:", error);
        }
      }
    };
    AiSearch();
  };

  const PersonalizeUrl = "/get-recommendations";
  
  const Personalize = async () => {
    const personalizeparam = {
      userId: userInfo ? userInfo.email : "사용자 이메일 주소",
    };
    setIsPersonalizeLoading(true);

    try {
      const response = await instance_ai.get(PersonalizeUrl, {
        params: { userId: userInfo ? userInfo.email : "" },
        headers: { "Content-Type": "application/json" },
      });
      const result = response.data["popularityRecommendations"];
      console.log(result);
      setPersonalizedRecommendations(result);
      console.log(isPersonalizeLoading);
      console.log('here', result)
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
    } finally {
      setIsPersonalizeLoading(false);
    }
  };

  const buttonVariants = {
    initial: { scale: 1, x: 0 },
    hover: { scale: 0.95, transition: { duration: 0.2 } },
    tap: { scaleX: 0.9, transition: { duration: 0.1 } },
    clicked: { x: "-10%", transition: { duration: 0.3 } }, // Move it further left
  };

  const containerVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "100%",
      opacity: 1,
      transition: {
        width: { type: "spring", stiffness: 100, damping: 15 },
        opacity: { duration: 0.3 },
      },
    },
    exit: {
      width: 0,
      opacity: 0,
      transition: {
        width: { duration: 0.3 },
        opacity: { duration: 0.3 },
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/bookstore.json");
        const data = await response.json();
        setBookstoreList(data);
      } catch (error) {
        console.error("Error fetching bookstore data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    Personalize();
  }, []);

  useEffect(() => {
    const fetchImage = async () => {
      const imageUrl = await getImage();
      setImageSrc(imageUrl);
    };
    fetchImage();
    
  }, []);


  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Ensure the video is loaded
      videoRef.current.play(); // Attempt to play the video automatically
    }
  }, []);



  return (
    <>
      <Script id="jennifer-inline-script" strategy="lazyOnload">
        {`
          (function(j, ennifer) {
              j['dmndata'] = [];
              j['jenniferFront'] = function(args) { window.dmndata.push(args); };
              j['dmnaid'] = ennifer;
              j['dmnatime'] = new Date();
              j['dmnanocookie'] = false;
              j['dmnajennifer'] = 'JENNIFER_FRONT@INTG';
          }(window, '402761ca'));
        `}
      </Script>
      <Script id="suppress-hydration-warning">
        {`
            (function() {
              var originalError = console.error;
              console.error = function() {
                if (arguments[0].includes('Extra attributes from the server')) return;
                originalError.apply(console, arguments);
              };
            })();
          `}
      </Script>
      <style jsx>{`
        .shining-text {
          background: linear-gradient(
            120deg,
            /* Tilted gradient */ #000000 0%,
            /* Black */ #2e8b57 25%,
            /* Darker Mint (Sea Green) */ #006b3c 50%,
            /* Even Darker Mint */ #2e8b57 75%,
            /* Darker Mint (Sea Green) */ #ffffff 100% /* White */
          );
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
        }
      `}</style>
      <main suppressHydrationWarning={true} className="relative">
        <div className="z-[999] fixed left-[10vw] right[10vw] justify-center w-full">
          <NavComponent
            className="mx-auto"
            isLoggedIn={isLoggedIn}
            username={userInfo ? userInfo.username : ""}
            logout={logout}
          />
        </div>
        <Gradient className="w-[full] blur-md brightness-150" />
        <div className="mt-[60px] h-full mx-auto">
          <div className="relative flex items-center justify-center w-screen ">
            <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full">
              <main className="relative w-screen h-screen">
                <div className="flex items-center justify-center w-full h-full ">
                  <div className="absolute flex items-center justify-center w-full h-full">
                    <div className="container flex gap-4 flex-col md:flex-row md:justify-between items-center mx-auto w-[90%] md:w-[80%]">
                      <div className="flex flex-col justify-center md:w-1/2 w-full md:text-left text-center">
                        <h1 className="pt-0.5 spacial-shadow ">오늘의 책방</h1>
                        <div className="pb-4 pr-2 font-light text-base hidden md:block">
                          <p className="pb-0">
                            당신의 일상에 새로움을 더하는 문화의 장
                          </p>
                          <p className="pb-2">AI를 통해 책방을 추천받으세요</p>
                        </div>
                        <div className="relative">
                          <AnimatePresence mode="wait">
                            {!aiClick ? (
                              <motion.button
                                className=" md:shadow-lg bookButton w-60 py-3 font-semibold text-xl md:left-0 ml-auto mr-auto left-0 right-0" // Ensure absolute positioning
                                onClick={() => setAiClick(true)}
                                variants={buttonVariants}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                                animate={aiClick ? "clicked" : "initial"}
                              >
                                AI 추천받기
                              </motion.button>
                            ) : null}
                          </AnimatePresence>
                          <AnimatePresence>
                            {aiClick && (
                              <motion.div
                                className="absolute left-0 top-0"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                              >
                                <div className="relative mx-auto rounded-2xl border-green max-w-full font-semibold aiSearch">
                                  <div
                                    onClick={handleSearch}
                                    className="absolute bg-white border p-1 rounded-lg bg-green text-2xl hover:drop-shadow-[2px] active:shadow-inner 	--tw-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06) hover:shadow-sm hover:shadow-green-600 right-0 top-1/2 transform -translate-x-1/3 -translate-y-1/2"
                                  >
                                    <BiSearch />
                                  </div>
                                  <input
                                    placeholder="편안한 분위기에 책 종류가 많은 책방을 추천해줘"
                                    className="w-full p-3 px-4 rounded-2xl text-[16px] font-[300] bg-transparent border-2 border-green-800 focus:border-green-800"
                                    value={inputValue}
                                    onChange={(e) =>
                                      setInputValue(e.target.value)
                                    }
                                  />
                                </div>
                                <motion.div
                                  className="flex flex-wrap gap-2 mt-2 max-h-[105px] overflow-y-auto"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  {categories.map((category, index) => (
                                    <motion.button
                                      key={category}
                                      onClick={() => toggleCategory(category)}
                                      className={`px-2 py-1 ${
                                        selectedCategories.includes(category)
                                          ? "bg-green-700 text-gray-100 special-shadow-button"
                                          : "bg-gray-100 text-gray-900 special-toggle"
                                      } rounded-lg text-[14px] z-10`}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.1 * (index + 1) }}
                                    >
                                      {category}
                                    </motion.button>
                                  ))}
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="relative w-full md:pt-0 mt-40 md:w-1/2 w-full h-auto pl-4 justify-center md:my-4 lg:my-12 flex rounded-2xl">
                        <div className="rounded-2xl">
                          {/* Bookstore List */}

                          <AnimatePresence>
                            {showBookstoreList && (
                              <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                              >
                                {isLoading ? (
                                  <BookstoreListSkeleton />
                                ) : (
                                  <ul className="z-[100] divide-y divide-white py-4 px-4 w-full rounded-2xl max-h-[600px] overflow-y-auto box-extrude">
                                    {aiList.map((datas, index) => (
                                      <React.Fragment key={datas.FCLTY_NM}>
                                        <li className="p-2 pb-4 my-2 relative special-shadow-button bg-white rounded-2xl overflow-hidden">
                                          <button
                                            className="flex"
                                            onClick={() => {}}
                                          >
                                            <div className="flex text-left pb-2 absolute right-4 top-[18px] hover:drop-shadow-[2px] active:shadow-inner hover:shadow-sm hover:shadow-green-600 px-4 rounded-2xl ml-auto text-bold text-green-600 hover:text-green-600 right-0 top-1/2">
                                              위치 보기
                                            </div>
                                          </button>
                                          <h3 className="font-semibold text-lg">
                                            {datas.FCLTY_NM ||
                                              "Unknown Facility"}
                                          </h3>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {datas.describe ||
                                              "No description available"}
                                          </p>
                                          <p className="text-sm text-gray-500 mt-1">
                                            {datas.FCLTY_ROAD_NM_ADDR ||
                                              "Address not available"}
                                          </p>
                                        </li>
                                      </React.Fragment>
                                    ))}
                                  </ul>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {!showBookstoreList && (
                          <div className="hidden md:block md:shadow-xl border-white rounded-2xl">
                            {/* <Image
                              src={book}
                              alt="Book recommendation"
                              width={500}
                              height={400}
                              className="relative aspect-auto w-[35vw] rounded-2xl z-[20]"
                            /> */}
                            <div>
                              <video
                              ref={videoRef}
                                suppressHydrationWarning={true}
                                src={
                                  "https://usingmethodvideo.s3.ap-northeast-2.amazonaws.com/HowTo.mp4"
                                }
                                width={500}
                                height={400}
                                // controls
                                loop
                                autoPlay
                                muted
                                preload="auto"
                                className="relative aspect-auto rounded-2xl z-[20]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div
            suppressHydrationWarning={true}
            className="mt-[100vh] flex items-center justify-center relative"
          >
            <div className="relative h-full flex justify-center pb-8 mb-28 bg-white bg-opacity-50">
              {/* {isLoggedIn && (
                <div className="w-full p-4 flex flex-col items-center">
                  {isPersonalizeLoading ? (
                    <p>추천 목록을 불러오는 중...</p>
                  ) : personalizedRecommendations ? (
                    <div className="text-center">
                      <h1 className="mb-4">개인화된 책방 추천</h1>

                      <ul className="flex overflow-x-auto w-full gap-4 mt-12">
                        {personalizedRecommendations.map(
                          (recommendation, index) => {
                            const facilityInfo =
                              getFacilityInfo(recommendation);

                            return (
                              <li
                                key={index}
                                className="pb-4 w-[300px] text-center"
                              >
                                {imageSrc ? (
                                  <Image
                                    src={imageSrc}
                                    alt="s3url"
                                    width="500"
                                    height="300"
                                    className="card-extrude rounded-2xl h-60"
                                  />
                                ) : (
                                  <p>Loading image...</p>
                                )}
                                <h3 className="text-lg font-semibold">
                                  {facilityInfo.name || "Unknown Facility"}
                                </h3>
                                <p className="text-sm text-gray-600 px-2">
                                  {facilityInfo.description ||
                                    "No description available"}
                                </p>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p>개인화된 추천 목록이 없습니다.</p>
                  )}
                
                
                
                

                </div>
              )} */}
                <NetflixStyleSlider personalizedRecommendations={personalizedRecommendations} imageSrc={imageSrc}/>



            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HomeClient;
