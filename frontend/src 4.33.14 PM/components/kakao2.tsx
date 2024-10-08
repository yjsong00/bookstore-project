import React, { useEffect, useRef, useState } from "react";
import { Bookstore } from '../pages/app';
import { BiCurrentLocation, BiChevronUp, BiChevronDown } from "react-icons/bi";
import "./../app/globals.css";
import Search from "./../components/Search";
import BookstoreInfo2 from "./../components/bookstorelist2";

declare global {
  interface Window {
    kakao: any;
  }
}


interface Place {
  title: string;
  latlng: any; // Using 'any' for kakao.maps.LatLng type
  address: string;
}

type KakaoMapProps = {
  className?: string;
  latitude: number;
  longitude: number;
  name: string;
  bookstore: any;
};

type OrderBy = "asc" | "desc";

export const KakaoMap: React.FC<KakaoMapProps> = ({ className, latitude, longitude, name, bookstore }) => {
    const [query, setQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<keyof Bookstore>("FCLTY_NM");
    const [orderBy, setOrderBy] = useState<OrderBy>("asc");
    const [viewDetailToggle, setViewDetailToggle] = useState<Boolean>(false);
    const [showBookstoreList, setShowBookstoreList] = useState<Boolean>(true);  // Toggle state for bookstore list
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [level, setLevel] = useState<number>(3);
    const [clusterer, setClusterer] = useState<any>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [keyword, setKeyword] = useState<string>("");
    const [bookstoreList, setBookstoreList] = useState<Bookstore[]>([]);
    const [userPosition, setUserPosition] = useState<any>(null);
    const [overlay, setOverlay] = useState<any>(null);
    const [activeOverlay, setActiveOverlay] = useState<any>(null);
    const [hoverOverlay, setHoverOverlay] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]); // markers 상태 추가

    const safeToLowerCase = (value: any): string => {
      if (typeof value === 'string') {
        return value.toLowerCase();
      }
      return '';
    };

    const filteredbookstores = bookstoreList.filter(
      stores => {
        return (
          safeToLowerCase(stores.FCLTY_NM).includes(query.toLowerCase()) ||
          safeToLowerCase(stores.FCLTY_ROAD_NM_ADDR).includes(query.toLowerCase()) ||
          safeToLowerCase(stores.TEL_NO).includes(query.toLowerCase())
        )
      }
    ).sort((a, b) => {
      let order = (orderBy === 'asc') ? 1 : -1;
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.toLowerCase() < bValue.toLowerCase() ? -1 * order : 1 * order;
      } else {
        return aValue < bValue ? -1 * order : 1 * order;
      }
    });

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('/data/bookstore.json');
          const data = await response.json();
          setBookstoreList(data);
        } catch (error) {
          console.error('Error fetching bookstore data:', error);
        }
      };

      fetchData();
    }, []);

    useEffect(() => {
      const loadKakaoMap = () => {
        const kakaoMapScript = document.createElement("script");
        kakaoMapScript.async = false;
        kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=c4e6698263a1f6e60d1a4d9ca06fc98a&libraries=services,clusterer&autoload=false`;
        document.head.appendChild(kakaoMapScript);
      
        const onLoadKakaoAPI = () => {
          window.kakao.maps.load(() => {
            const container = mapRef.current;
            const options = {
              center: new window.kakao.maps.LatLng(latitude || 37.5652, longitude || 126.9774),
              level: level,
            };
            const newMap = new window.kakao.maps.Map(container, options);
            console.log(newMap);  // Check if this logs the map object

            setMap(newMap);
    
            const newClusterer = new window.kakao.maps.MarkerClusterer({
              map: newMap,
              averageCenter: true,
              minLevel: 6,
            });
            setClusterer(newClusterer);
    
            const createOverlay = (position: any, content: string, isPersistent: boolean) => {
              const overlayContent = document.createElement('div');
              overlayContent.innerHTML = `
                <div class="custom-overlay" style="padding:5px; background-color:rgba(255,255,255,0.7); backdrop-filter: blur(10px); border:1px solid white; border-radius:8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                  ${content}
                  ${isPersistent ? '<div style="text-align:right;"><button class="close-btn" style="padding:2px 5px; background-color:#f0f0f0; border:1px solid rgb(200,200,200); border-radius:8px; cursor:pointer;">Close</button></div>' : ''}
                </div>
              `;
              
              const newOverlay = new window.kakao.maps.CustomOverlay({
                position: position,
                content: overlayContent,
                yAnchor: 1.3,
                zIndex: isPersistent ? 2 : 1,
              });
    
              if (isPersistent) {
                const closeButton = overlayContent.querySelector('.close-btn');
                if (closeButton) {
                  closeButton.addEventListener('click', () => {
                    newOverlay.setMap(null);
                    setActiveOverlay(null);
                  });
                }
              }
              return newOverlay;
            };
    
            const newMarkers = bookstoreList.map(data => {
              const markerPosition = new window.kakao.maps.LatLng(data.FCLTY_LA, data.FCLTY_LO);
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                title: data.FCLTY_NM,
              });
    
              const showHoverOverlay = () => {
                if (hoverOverlay) {
                  hoverOverlay.setMap(null);
                }
                const newHoverOverlay = createOverlay(markerPosition, `
                  <h3>${data.FCLTY_NM}</h3>
                  <p>${data.FCLTY_ROAD_NM_ADDR}</p>
                `, false);
                newHoverOverlay.setMap(newMap);
                setHoverOverlay(newHoverOverlay);
              };
    
              const hideHoverOverlay = () => {
                if (hoverOverlay) {
                  hoverOverlay.setMap(null);
                  setHoverOverlay(null);
                }
              };
    
              // Add mouseover event listener to the marker
              // window.kakao.maps.event.addListener(marker, 'mouseover', () => {
              //   if (!activeOverlay) {
              //     showHoverOverlay();
              //   }
              // });
    
              // Add mouseout event listener to the marker
              window.kakao.maps.event.addListener(marker, 'mouseout', () => {
                if (activeOverlay) {
                  activeOverlay.setMap(null);
                }
              });
    
              // Add click event listener to the marker
              window.kakao.maps.event.addListener(marker, 'click', () => {
                // Remove any existing active overlay
                if (activeOverlay) {
                  activeOverlay.setMap(null);
                  setActiveOverlay(null);
                }
                // Optionally remove hover overlay as well
                if (hoverOverlay) {
                  hoverOverlay.setMap(null);
                  setHoverOverlay(null);
                }

                const clickedOverlay = createOverlay(markerPosition, `
                  <h3>${data.FCLTY_NM}</h3>
                  <p>${data.FCLTY_ROAD_NM_ADDR}</p>
                  <p>Tel: ${data.TEL_NO}</p>
                `, true);
                clickedOverlay.setMap(newMap);
                setActiveOverlay(clickedOverlay);
              });
    
              return { marker, data };
            });
            setMarkers(newMarkers); // 상태 업데이트
    
            newClusterer.addMarkers(newMarkers.map(m => m.marker));
    
            // addCustomControls(newMap);
            window.kakao.maps.event.addListener(newMap, 'click', () => {
              if (hoverOverlay) {
                hoverOverlay.setMap(null);
                setHoverOverlay(null);
              }
              // Optionally remove active overlay when clicking on the map
              if (activeOverlay) {
                activeOverlay.setMap(null);
                setActiveOverlay(null);
              }
            });
          });
        };
    
        kakaoMapScript.addEventListener("load", onLoadKakaoAPI);
        return () => kakaoMapScript.removeEventListener("load", onLoadKakaoAPI);
      };
    
      loadKakaoMap();
    }, [level, bookstoreList, latitude, longitude]);
    
    // Function to trigger marker click programmatically
    const handleListItemClick = (bookstore: Bookstore) => {
      // Remove any existing active overlay before triggering a new one
      if (activeOverlay) {
        activeOverlay.setMap(null);
        setActiveOverlay(null);
      }

      const marker = markers.find(m => m.data.ESNTL_ID === bookstore.ESNTL_ID)?.marker;
      if (marker) {
        window.kakao.maps.event.trigger(marker, 'click');
      }

      // Pan to the selected bookstore's location
      const bookstorePosition = new window.kakao.maps.LatLng(bookstore.FCLTY_LA, bookstore.FCLTY_LO);
      map.setLevel(3);
      map.panTo(bookstorePosition);
    };

    const goToUserLocation = () => {
      if (map && userPosition) {
        map.setLevel(3);
        map.panTo(userPosition);
      } else {
        alert("위치 정보를 가져올 수 없습니다.");
      }
    };

    return (
      <div>
      <main className="w-full flex flex-col items-left z-10">
        <button
          onClick={goToUserLocation}
          className="absolute bottom-40 right-4 px-2 py-2 bg-blue-500 hover:bg-blue-400 z-50 text-white rounded text-2xl"
        >
          <BiCurrentLocation />
        </button>
        <div ref={mapRef} className={className}></div>
    
        <div className="absolute container flex flex-col mx-auto ml-3 mt-3 font-thin z-10">
          <div className="flex"> 
            <Search
              query={query}
              onQueryChange={(myQuery: string) => setQuery(myQuery)}
              orderBy={orderBy}
              onOrderByChange={(myOrder: OrderBy) => setOrderBy(myOrder)}
              sortBy={sortBy}
              onSortByChange={(mySort: keyof Bookstore) => setSortBy(mySort)}
              className="w-[400px] z-100 "
              toggleShow={false}
            />
    
            {/* Toggle Button */}
            <button
              onClick={() => setShowBookstoreList(!showBookstoreList)}
              className="flex special-shadow p-2 max-h-[32px] items-center my-auto rounded-2xl text-gray-700"
            >
              {showBookstoreList ? (
                <div className="whitespace-nowrap flex">
                  Hide List <BiChevronUp className="my-auto"/>
                </div>
              ) : (
                <div className="whitespace-nowrap flex">
                  Show List <BiChevronDown className="my-auto"/>
                  </div>
              )}
            </button>
          </div>
    
          <div className="rounded-2xl overflow-hidden">
            {/* Bookstore List */}
            {showBookstoreList && (
              <ul className="z-[-10] divide-y divide-blue-100 absolute py-4 px-4 w-[500px] rounded-2xl special-shadow max-h-[600px] overflow-y-auto">
                {filteredbookstores.map(bookstore => (
                  <React.Fragment key={bookstore.ESNTL_ID}>
                    <button
                      className="flex text-left"
                      onClick={() => handleListItemClick(bookstore)} // Call the function here
                    >
                      <BookstoreInfo2 key={bookstore.ESNTL_ID} bookstores={bookstore} />
                      <div className="ml-auto text-bold">위치 보기</div>
                    </button>
                  </React.Fragment>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      </div>
    );
};

export default KakaoMap;
