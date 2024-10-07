import React, { useEffect, useState } from "react";
import { BiSolidUser } from "react-icons/bi";
import { NavComponent } from "../components/nav";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";

interface UserInfo {
  username: string;
  email: string;
}

interface UseMyPageReturn {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  logout: () => void;
  login: (username: string, password: string) => Promise<void>;
}

const useMyPage = (): UseMyPageReturn => {
  const { isLoggedIn, userInfo, logout, login } = useAuth() || {
    isLoggedIn: false,
    userInfo: null,
    logout: () => {},
    login: async () => {},
  };
  return {
    isLoggedIn,
    userInfo,
    logout,
    login,
  };
};

const instance_th = axios.create({
  baseURL: "https://www.taehyun35802.shop",
});

const MyPage: React.FC = () => {
  const { isLoggedIn, userInfo, logout } = useMyPage();

  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'payment' | 'reservations' | 'map'>('reservations');

  const MyPageFunction = async (myData: string) => {
    const myUrl = `/mypage`;
    try {
      const response = await instance_th.get(myUrl, {
        params: {
          customer: myData,
        },
        headers: { "Content-Type": "application/json" },
      });

      const result = response.data;
      console.log(result);
      setReservations(result);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  useEffect(() => {
    const myData = userInfo ? userInfo.email : "사용자 이메일 주소";
    MyPageFunction(myData);
  }, [userInfo]);

  const renderContent = () => {
    switch (activeTab) {
      case 'payment':
        return <p>결제내역 내용이 여기에 표시됩니다.</p>;
      case 'reservations':
        return (
          <div className="p-4 w-full">
            <h3 className="text-lg font-bold mt-0">예약 확인</h3>
            {reservations.length > 0 ? (
              <ul className="flex flex-wrap gap-1">
                {reservations.map((reservation, index) => (
                  <li
                    key={index}
                    className="flex flex-col border p-2 min-w-[200px] rounded-2xl"
                  >
                    <p>
                      <strong>Date:</strong> {reservation.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {reservation.time}
                    </p>
                    <p>
                      <strong>Bookstore:</strong> {reservation.bookstore}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>예약 정보가 없습니다.</p>
            )}
          </div>
        );
      case 'map':
        return <p>별지도 내용이 여기에 표시됩니다.</p>;
      default:
        return null;
    }
  };

  return (
    <>
      <main>
        <NavComponent
          isLoggedIn={isLoggedIn}
          logout={logout}
          username={userInfo ? userInfo.username : ""}
        />
        <main
          className="flex min-h-screen flex-col wrap items-center"
          style={{ padding: "56px 0 0 0" }}
        >
          <div className="flex w-11/12 md:w-10/12 flex gap-x-4 mt-16 flex-col gap-4">
            <div className="flex ml-4 gap-4">
              <BiSolidUser className="text-9xl rounded-full bg-white w-30 h-30" />
              <div className="flex-col items-top">
                <h2 style={{ fontSize: "clamp(2rem, 2.5vw, 3rem)" }}>{userInfo ? userInfo.username : "사용자 이름"}</h2>
                <h3 style={{ fontSize: "clamp(1rem, 1.7vw, 1.2rem)" }}>{userInfo ? userInfo.email : "정보 없음"}</h3>
              </div>
            </div>
            <div className="bg-white w-full min-h-80 rounded-2xl divide-x divide-gray-200 flex">
              <ul className="flex-col min-w-[15vw] md:w-[20vw]">
                <li>
                  <button 
                    className="py-2 text-center w-full h-full flex items-center justify-center rounded-2xl" 
                    onClick={() => setActiveTab('payment')}
                  >
                    <h2
                      className="flex"
                      style={{ fontSize: "clamp(1.2rem, 2vw, 1.4rem)" }}
                    >
                      결제내역
                    </h2>
                  </button>
                </li>
                <li>
                  <button 
                    className="py-2 text-center w-full h-full flex items-center justify-center rounded-2xl" 
                    onClick={() => setActiveTab('reservations')}
                  >
                    <h2
                      className="flex"
                      style={{ fontSize: "clamp(1.2rem, 2vw, 1.4rem)" }}
                    >
                      예약확인
                    </h2>
                  </button>
                </li>
                <li>
                  <button 
                    className="py-2 text-center w-full h-full flex items-center justify-center rounded-2xl bg-green-100" 
                    onClick={() => setActiveTab('map')}
                  >
                    <h2
                      className="flex"
                      style={{ fontSize: "clamp(1.2rem, 2vw, 1.4rem)" }}
                    >
                      별지도
                    </h2>
                  </button>
                </li>
              </ul>
              <div className="flex w-full ml-1 h-80 border overflow-y-auto rounded-2xl">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </main>
    </>
  );
};

export default MyPage;
