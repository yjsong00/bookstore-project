'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import "./../app/globals.css";

const LoginComponent: React.FC = () => {
  const { isLoggedIn, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      goToStart();
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('아이디 비밀번호를 다시 확인해 주세요'); // 에러 메시지 설정
    }
  };

  const goToStart = async () => {
    router.push('/login');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-green-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl ">
        <div>
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">BOOKSTORE FOR YOU</h1>
        </div>
        {!isLoggedIn ? (
          <>
            <form onSubmit={handleLogin} className="mt-8 space-y-6 p-4 ">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  />
                </div>
              </div>

              {/* 에러 메시지 출력 */}
              {errorMessage && (
                <div className="text-red-500 text-center">{errorMessage}</div>
              )}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Login
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out">
                Register
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl font-semibold mb-4">Welcome back!</p>
            <button
              onClick={logout}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginComponent;