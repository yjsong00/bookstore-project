"use client";
import { useRouter } from 'next/router'

import { KakaoMap } from "../components/kakao2";
import { NavComponent } from "../components/nav";

import React, { useState } from "react";
import { useAuth } from '../hooks/useAuth';



const Start: React.FC = () => {

  const router = useRouter()
  const { pid } = router.query
  const { isLoggedIn, userInfo, logout } = useAuth();

  const [level, setLevel] = useState<number>(3);

  return (
    <>
      <main className="w-full flex flex-col items-center justify-center mt-8 bg-white">
      <NavComponent className="fixed z-50" isLoggedIn={isLoggedIn} logout={logout} username={userInfo ? userInfo.username : ''}/>

      <KakaoMap className="w-[100vw] h-[97vh]" bookstore={null} latitude={0} longitude={0} name=""/>
      </main>
    </>
  );
};

export default Start;