import React from 'react';
import { BiTrash } from "react-icons/bi";
import ViewDetailPage from "./viewDetail";
import { Bookstore } from '../pages/app';
// import "./../app/globals.css";


interface AppointmentInfoProps {
  bookstores: Bookstore;
  className?: string;
}

const BookstoreInfo2: React.FC<AppointmentInfoProps> = ({ bookstores, className}) => {
  return (
    <>
      <li className="px-3 py-3 flex items-start w-[400px]">
        <div className="flex-grow">
          <div className="flex items-center">
            <span className="flex-none font-bold text-2xl text-gray-700">{bookstores.FCLTY_NM}</span>
          </div>
          <span className="flex-grow text-right">{bookstores.FCLTY_ROAD_NM_ADDR}</span>
          <p className="flex text-right text-left">{bookstores.TEL_NO}</p>
        </div>
      </li>
    </>
  );
};

export default BookstoreInfo2;
