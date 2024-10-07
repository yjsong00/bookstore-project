import React from 'react';
import { BiTrash } from "react-icons/bi";
import ViewDetailPage from "./viewDetail";
import { Bookstore } from '../pages/app';
import "./../app/globals.css";

interface AppointmentInfoProps {
  bookstores: Bookstore;
  viewDetail: any
}

const BookstoreInfo: React.FC<AppointmentInfoProps> = ({ bookstores, viewDetail }) => {
  return (
    <>
      <li className="px-3 py-3 flex items-start dark:bg-black dark:text-white rounded-2xl">
        <div className="flex-grow relative">
        <div className='p-2 absolute right-0'>
      </div>
          <div><b className="font-bold text-green-500">대분류</b> {bookstores.LCLAS_NM}</div>
          <div className="leading-tight">중분류 {bookstores.MLSFC_NM}</div>
          <div className="flex items-center">
            <span className="flex-none font-bold text-3xl text-gray-700">{bookstores.FCLTY_NM}</span>
          </div>
          <div className="flex-grow text-left">{bookstores.OPTN_DC}</div>
          <div className="flex-grow text-left">{bookstores.ADIT_DC}</div>
          <div className="flex-grow text-left">{bookstores.FCLTY_ROAD_NM_ADDR}</div>
          <div className="flex-grow text-left">{bookstores.RSTDE_GUID_CN}</div>
          <span className="flex-grow text-left">
            평일 문 여는 시간 {bookstores.WORKDAY_OPN_BSNS_TIME} - {bookstores.WORKDAY_CLOS_TIME}<br />
            토요일 문 여는 시간 {bookstores.SAT_OPN_BSNS_TIME} - {bookstores.SAT_CLOS_TIME}<br />
            일요일 문 여는 시간 {bookstores.SUN_OPN_BSNS_TIME} - {bookstores.SUN_CLOS_TIME}
          </span>
        </div>
        <ViewDetailPage bookstores={bookstores} className='dark:bg-black dark:text-white'/>
      </li>
    </>
  );
};

export default BookstoreInfo;
