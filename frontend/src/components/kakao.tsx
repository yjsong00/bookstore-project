import React, { useEffect, useRef, useState } from "react";
import "./../app/globals.css";
import { Bookstore } from '../pages/app';
import { BiCurrentLocation } from "react-icons/bi";

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
};

export const KakaoMap: React.FC<KakaoMapProps> = ({ className, latitude, longitude, name }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [level, setLevel] = useState<number>(3);
  const [clusterer, setClusterer] = useState<any>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [bookstoreList, setBookstoreList] = useState<Bookstore[]>([]);
  const [userPosition, setUserPosition] = useState<any>(null);
  const [overlay, setOverlay] = useState<any>(null); // overlay 상태 추가


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
          setMap(newMap);
          
          // 내 위치 표시
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const userLat = position.coords.latitude;
              const userLon = position.coords.longitude;
  
              const userPosition = new window.kakao.maps.LatLng(userLat, userLon);
              const userMarker = new window.kakao.maps.Marker({
                position: userPosition,
                title: '내 위치',
              });
              userMarker.setMap(newMap); // 지도에 마커 추가
              const userLatLng = new window.kakao.maps.LatLng(userLat, userLon);
              setUserPosition(userLatLng); // 사용자 위치 저장
              // 지도 중심을 내 위치로 설정
              newMap.setCenter(userPosition);
            }, (error) => {
              console.error("Geolocation error: ", error);
            });
          } else {
            console.error("Geolocation is not supported by this browser.");
          }
  
          const newClusterer = new window.kakao.maps.MarkerClusterer({
            map: newMap,
            averageCenter: true,
            minLevel: 6,
          });
          setClusterer(newClusterer);
        
          const newOverlay = new window.kakao.maps.CustomOverlay({
            map: newMap,
            position: new window.kakao.maps.LatLng(0, 0),
            content: '<div style="padding:5px; background-color:white; border:1px solid black; border-radius:5px;">Overlay</div>',
            yAnchor: 1,
            zIndex: 1,
          });
          setOverlay(newOverlay);


          const markers = bookstoreList.map(data => {
            const markerPosition = new window.kakao.maps.LatLng(data.FCLTY_LA, data.FCLTY_LO);
            return new window.kakao.maps.Marker({
              position: markerPosition,
              // title: data.title
            });
            // 마커에 mouseover 이벤트 추가
            window.kakao.maps.event.addListener(markerPosition, 'mouseover', () => {
              const position = markerPosition.getPosition();
              newOverlay.setPosition(position);
              newOverlay.setMap(newMap);
              newOverlay.setContent(`<div style="padding:5px;">${name}</div>`);
            });

            // 마커에 mouseout 이벤트 추가
            window.kakao.maps.event.addListener(markerPosition, 'mouseout', () => {
              newOverlay.setMap(null);
            });




          });
          
          newClusterer.addMarkers(markers);
          addCustomControls(newMap);
        });
      };
  
      kakaoMapScript.addEventListener("load", onLoadKakaoAPI);
      return () => kakaoMapScript.removeEventListener("load", onLoadKakaoAPI);
    };
  
    loadKakaoMap();
  }, [level, bookstoreList]);
  useEffect(() => {
    if (map) {
      map.setLevel(level);
    }
  }, [level, map]);

  const handleZoomIn = () => {
    setLevel((prevLevel) => Math.max(prevLevel - 1, 1));
  };

  const handleZoomOut = () => {
    setLevel((prevLevel) => Math.min(prevLevel + 1, 14));
  };

  const addCustomControls = (map: any) => {
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
  };

  const addMarkers = (places: Place[]) => {
    if (clusterer) {
      clusterer.clear(); // 기존 마커 제거
      const markers = places.map((place) => {
        const marker = new window.kakao.maps.Marker({
          position: place.latlng,
          title: place.title,
        });
        return marker;
      });
      clusterer.addMarkers(markers); // 새로운 마커 추가
    }
  };

  const searchPlaces = () => {
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data: any[], status: any, _pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const bounds = new window.kakao.maps.LatLngBounds();
        const newPlaces = data.map((place) => ({
          title: place.place_name,
          latlng: new window.kakao.maps.LatLng(place.y, place.x),
          address: place.road_address_name || place.address_name,
        }));
        setPlaces(newPlaces);
        addMarkers(newPlaces); // 마커 추가
        newPlaces.forEach((place) => {
          bounds.extend(place.latlng);
        });
        map.setBounds(bounds);
      } else {
        alert("검색 결과를 찾을 수 없습니다.");
      }
    });
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
    <main className="w-full flex flex-col items-left relative">
                <button
            onClick={goToUserLocation}
            className="absolute bottom-4 right-4 px-2 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded z-50 text-2xl"
          >
            <BiCurrentLocation />
            
            
          </button>
      <div className="absolute z-50 mb-4 pt-4 pl-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Search places"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-container"
          />
          <button
            onClick={searchPlaces}
            className="px-2 py-1 bg-blue-500 text-brown-800 rounded search-button"
          >
            검색
          </button>


        </div>
  
        {places.length > 0 && (
          <div className="w-full mt-4 absolute">
            <ul className="absolute py-4 px-4 rounded-2xl min-w-60 special-shadow max-h-[60] overflow-y-auto">
              {places.map((place, index) => (
                <li key={index} className="mb-4 ">
                  <button
                    onClick={() => {
                      map.setLevel(3);
                      map.panTo(place.latlng);
                    }}
                    className="special-shadow-button rounded-2xl py-1 px-2 text-blue-600"
                  >
                    {place.title}
                  </button>
                  <p className="text-gray-600">{place.address}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div
        ref={mapRef}
        className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]"
      ></div>
    </main>
  );
};

export default KakaoMap;