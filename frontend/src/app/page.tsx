"use client";
// import { Html, Head, Main, NextScript } from 'next/document'
import Head from "next/head";
 import "./../app/globals.css";
import Script from "next/script";
import axios from "axios";
import { NavComponent } from "../components/nav";
import { useAuth } from "../hooks/useAuth";
import React, { useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { Bookstore } from "../pages/app";
import BookstoreListSkeleton from "../components/BookstoreListSkeleton";
import Gradient from "../components/gradient";
import NetflixStyleSlider from "../components/NetflixStyleSlider";
import BookstoreInfo from "../components/bookstorelist";
import ViewDetailPage from "../components/viewDetail";

const instance_ai = axios.create({
  baseURL: "https://www.linkedbook.shop",
});

const HomeClient: React.FC = () => {
  const [isBookstoreDataLoaded, setIsBookstoreDataLoaded] = useState(false);

  const [selectedBookstore, setSelectedBookstore] = useState<Bookstore | null>(
    null
  );
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
  // const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [imageSrc, setImageSrc] = useState<string[]>([]); // 배열로 변경

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };



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

  const getImages = async () => {
    const imageUrls = [
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-1.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-2.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-3.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-4.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-5.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-6.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-7.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-8.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-9.jpg",
      "https://bookstoreimage-bucket.s3.ap-northeast-2.amazonaws.com/bookstoreimage-10.jpg",

      // 추가 이미지
      // 필요한 만큼 추가
    ];

    try {
      const promises = imageUrls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      });
      const urls = await Promise.all(promises);
      return urls;
    } catch (error) {
      console.error("Error fetching images:", error);
      return [];
    }
  };

  const getFacilityInfo = (
    ID: string
  ): { FCLTY_NM: string | null; OPTN_DC: string | null } => {
    const foundBookstore = bookstoreList.find(
      (bookstore) => bookstore.ESNTL_ID === ID
    );
    return {
      FCLTY_NM: foundBookstore ? foundBookstore.FCLTY_NM : null,
      OPTN_DC: foundBookstore ? foundBookstore.OPTN_DC : null,
    };
  };

  const getBookInfo = (FCLTY_NM?: string): Bookstore | null => {
    console.log("Searching for FCLTY_NM:", FCLTY_NM);
    console.log("Current bookstoreList length:", bookstoreList.length);

    if (!FCLTY_NM) {
      console.log("No FCLTY_NM provided, returning null");
      return null;
    }

    const foundBookstore = bookstoreList.find(
      (bookstore) => bookstore.FCLTY_NM === FCLTY_NM
    );

    if (foundBookstore) {
      console.log("Found matching bookstore:", foundBookstore.FCLTY_NM);
    } else {
      console.log("No matching bookstore found for FCLTY_NM:", FCLTY_NM);
    }

    return foundBookstore || null;
  };

  useEffect(() => {}, [bookstoreList]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSearch = async () => {
    const prequery = inputValue + " " + selectedCategories.join(" ");
    const isKeyword = !inputValue && selectedCategories.length > 0;
    setShowBookstoreList(true);
    setIsLoading(true);
  
    // Default query when no input or categories
    const aiparam = {
      searchQuery: inputValue,
      categories: selectedCategories,
      query:
        prequery.trim() === ""
          ? "편안한 분위기에 책 종류가 많은 책방을 추천해줘"
          : prequery,
      keyword: isKeyword,
    };
    console.log("Sending to backend:", aiparam);
    const AiUrl = "/recommend";
  
    const AiSearch = async () => {
      try {
        // 사용자의 입력이 없고 선택된 카테고리도 없는 경우 예외 처리
        if (inputValue.trim() === "" && selectedCategories.length === 0) {
          alert("검색어 또는 카테고리를 입력해주세요.");
          setIsLoading(false);
          return;
        }
  
        const response = await instance_ai.post(AiUrl, aiparam, {
          headers: { "Content-Type": "application/json" },
        });
  
        const result = response.data;
        console.log(result);
  
        if (result.message === "null") {
          // 백엔드에서 잘못된 요청에 대한 응답 처리
          alert("잘못된 입력입니다.");
          setAiList([]); // 결과 목록 초기화
        } else {
          setAiList(result);
          console.log("Updated aiList:", result);
        }
      } catch (error) {
        console.error("Error data:", error);
        alert("올바른 추천키워드를 입력주세요.");
      } finally {
        setIsLoading(false);
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

      setPersonalizedRecommendations(result);
      console.log(isPersonalizeLoading);
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
        // console.log("Fetched bookstore data:", data);
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
    const fetchImages = async () => {
      const urls = await getImages();
      setImageSrc(urls); // 배열로 설정
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Ensure the video is loaded
      videoRef.current.play(); // Attempt to play the video automatically
    }
  }, []);

  useEffect(() => {
    // console.log("Updated bookstoreList:", bookstoreList);
  }, [bookstoreList]);

  return (
    <>
        <Head>
        <title>linkedbook</title>
        
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </Head>
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
                        <h1 className="pt-0.5">오늘의 책방</h1>
                        <div className="pb-4 pr-2 font-light text-base hidden md:block">
                          <p className="style={{paddingBottom: `clamp(3rem, 5vw, 4.2rem)`}}">
                            당신의 일상에 새로움을 더하는 문화의 장
                          </p>
                          <p className="pb-2">AI를 통해 책방을 추천받으세요</p>
                        </div>
                        <div className="relative">
                          <AnimatePresence mode="wait">
                            {!aiClick ? (
                              <motion.button
                                className=" md:shadow-lg bookButton w-60 py-3 font-semibold text-xl md:left-0 ml-auto mr-auto left-0 right-0 border-b border-gray-300 hover:border-gray-300 active:border-0 dark:border-gray-600" // Ensure absolute positioning
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
                                    className="w-full p-3 px-4 rounded-2xl text-[16px] font-[300] bg-transparent border-2 border-[#36823a] focus:border-[#36823a]"
                                    value={inputValue}
                                    onChange={(e) =>
                                      setInputValue(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
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
                                          ? "bg-[#36823a] text-gray-100 special-shadow-button"
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
                                    {aiList.map((datas, index) => {
                                      console.log(
                                        `Processing aiList item ${index}:`,
                                        datas
                                      );
                                      const bookstore2 = getBookInfo(
                                        datas.FCLTY_NM
                                      );
                                      console.log(
                                        `getBookInfo result for item ${index}:`,
                                        bookstore2
                                      );

                                      return (
                                        <React.Fragment key={datas.FCLTY_NM}>
                                          <li className="p-2 pb-4 my-2 relative special-shadow-button bg-white rounded-2xl overflow-hidden">
                                            <div className="flex flex-row">
                                              <h3 className="font-semibold text-lg">
                                                {datas.FCLTY_NM ||
                                                  "Unknown Facility"}
                                              </h3>
                                              <div className="ml-auto my-auto mr-4">
                                                {bookstore2 && (
                                                  <ViewDetailPage
                                                    bookstores={bookstore2}
                                                    className="dark:bg-black dark:text-white z-[9999]"
                                                  />
                                                )}
                                              </div>
                                            </div>
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
                                      );
                                    })}
                                  </ul>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {!showBookstoreList && (
                          <div
                            className="hidden md:block border-white rounded-2xl"
                            style={{
                              boxShadow:
                                "8px 8px 16px #bcbcbcb0, -8px -8px 16px #fffdf7",
                              width: "500px",
                            }}
                          >
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
            className="mt-[100vh] flex flex-col items-center justify-center relative"
          >
            <div className="mx-auto w-[90%] md:w-[80%] ">
              {isLoggedIn ? (
                <h1 className="mr-auto">개인화된 책방 추천</h1>
              ) : (
                <h1 className="mr-auto">실시간 추천</h1>
              )}
            </div>

            <div className="relative h-full flex justify-center pb-8 mb-28 bg-opacity-50">
              <NetflixStyleSlider
                personalizedRecommendations={personalizedRecommendations}
                imageSrc={imageSrc}
              />
            </div>
          </div>
        </div>
      </main>
      </>
  );
};

export default HomeClient;
