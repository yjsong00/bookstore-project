import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bookstore } from "../pages/app";
import { KakaoMap } from "../components/kakao2";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../hooks/useAuth";

type ViewDetailPageProps = {
  bookstores: Bookstore;
  className?: string;
};

const instance_th = axios.create({
  baseURL:
    "https://www.taehyun35802.shop",
});

const ViewDetailPage: React.FC<ViewDetailPageProps> = ({
  bookstores,
  className,
}) => {
  const [isAvailabilityError, setIsAvailabilityError] =
    useState<boolean>(false);
  const { isLoggedIn, userInfo } = useAuth();
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"reservation" | "map">(
    "reservation"
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const [reservationTime, setReservationTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]); // Initialize as an array

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isModalOpen]);

  const openModal = (tab: "reservation" | "map") => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  const setDateFunction = async (date: string) => {
    setDate(date);
    setIsAvailabilityError(false);

    const apiUrl = `/reservation`;
    try {
      const response = await instance_th.get(apiUrl, {
        params: {
          bookstore: bookstores.FCLTY_NM,
          date: date,
        },
        headers: { "Content-Type": "application/json" },
      });

      const result = response.data;

      // Extract available times from the result
      const availability: string[] = result
        .filter(
          (timeSlot: { isReservation: boolean }) => !timeSlot.isReservation
        )
        .map((timeSlot: { time: string }) => timeSlot.time);

      setAvailableTimes(availability); // Set available times based on response
      setIsAvailabilityError(false);
    } catch (error) {
      console.error("Error occurred:", error);
      setIsAvailabilityError(true);
      setAvailableTimes([]); // Reset available times on error
    }
  };

  const handleTimeSelection = (time: string) => {
    if (availableTimes.includes(time)) {
      setReservationTime(time);
      alert(`${time} 예약이 선택되었습니다.`);
    } else {
      alert(`${time} 시간대는 예약할 수 없습니다.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reservationData = {
      bookstore: bookstores.FCLTY_NM,
      date: date,
      time: reservationTime,
      customer: userInfo ? userInfo.email : "사용자 이메일 주소",
    };

    try {
      const response = await instance_th.post("/reservation", reservationData, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage("예약이 완료되었습니다: " + JSON.stringify(response.data));
    } catch (error) {
      console.error("오류 발생:", error);
      if (axios.isAxiosError(error)) {
        setMessage(
          "오류가 발생했습니다: " + (error.response?.data || error.message)
        );
      } else {
        setMessage("오류가 발생했습니다: 알 수 없는 오류");
      }
    }
  };

  return (
    <>
      {isModalOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10 ${className} dark:bg-black dark:text-white`}
        >
          <div
            className="bg-white p-4 rounded-2xl w-full max-w-screen-lg"
            ref={modalRef}
          >
            <div className="flex">
              <div className="flex border border-gray-1 rounded-2xl">
                <button
                  className={`py-2 px-4 rounded-2xl ${
                    activeTab === "reservation"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("reservation")}
                >
                  예약
                </button>
                <button
                  className={`py-2 px-4 rounded-2xl ${
                    activeTab === "map"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("map")}
                >
                  지도
                </button>
              </div>
              <button
                className="ml-auto px-3 py-2 hover:bg-gray-200 hover:text-black rounded-2xl font-mono"
                onClick={() => setIsModalOpen(false)}
              >
                <AiOutlineClose />
              </button>
            </div>
            {activeTab === "reservation" ? (
              <div className="w-full h-[60vh] sm:h-[60vh] md:h-[70vh] lg:h-[70vh] z-[100]">
                <div>
                  <h2>{bookstores.FCLTY_NM}</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-2 justify-center mb-4">
                      <input
                        className="rounded-2xl border px-2"
                        type="date"
                        value={date}
                        onChange={(e) => setDateFunction(e.target.value)}
                        required
                      />
                      <input
                        className="text-right rounded-2xl border px-2 w-32"
                        type="text"
                        value={reservationTime || ""}
                        readOnly
                        required
                      />
                    </div>
                    {isAvailabilityError && (
                      <p className="text-yellow-500">
                        모든 시간대가 선택 가능합니다.
                      </p>
                    )}
                    {/* <div className="grid grid-cols-4 gap-4">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          className={`py-2 px-4 border rounded-2xl ${reservationTime === time ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                          onClick={() => handleTimeSelection(time)}
                          disabled={!availableTimes.includes(time)} // Disable if time is not available
                        >
                          {time}
                        </button>
                      ))}
                    </div> */}

                    <div className="grid grid-cols-4 gap-4">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          className={`py-2 px-4 border rounded-2xl ${
                            reservationTime === time
                              ? "bg-blue-500 text-white"
                              : availableTimes.includes(time)
                              ? "bg-gray-100 hover:bg-gray-200"
                              : "bg-gray-300 cursor-not-allowed" // Style for unavailable times
                          }`}
                          onClick={() => handleTimeSelection(time)}
                          // disabled={!availableTimes.includes(time)} // Keep the disabled logic for accessibility
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={!reservationTime}
                      className="p-4 border rounded-2xl mt-4 disabled:opacity-50"
                      aria-label="예약 제출"
                    >
                      예약하기
                    </button>
                  </form>
                  {message && <p>{message}</p>}
                </div>
              </div>
            ) : (
              <div>
                <KakaoMap
                  bookstore={bookstores}
                  className="w-full h-[60vh] sm:h-[60vh] md:h-[70vh] lg:h-[70vh]"
                  latitude={bookstores.FCLTY_LA}
                  longitude={bookstores.FCLTY_LO}
                  name={bookstores.FCLTY_NM}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => openModal("reservation")}
        className="p-2 border rounded-2xl whitespace-nowrap "
      >
        예약하기
      </button>
      <button
        onClick={() => openModal("map")}
        className="p-2 border rounded-2xl whitespace-nowrap"
      >
        지도보기
      </button>
    </>
  );
};

export default ViewDetailPage;
