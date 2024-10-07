'use client';

import React, { useState } from 'react';
import { CognitoUserPool, CognitoUser, ICognitoUserData } from 'amazon-cognito-identity-js';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import styles from '../app/confirm.module.css'; // CSS 모듈 가져오기

const Confirm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  const poolData = {
    UserPoolId: 'ap-northeast-2_MOp2LBaMU',
    ClientId: '4hhqgfj55n7spi2rmm4svb7d3n'
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userPool = new CognitoUserPool(poolData);
    const userData: ICognitoUserData = {
      Username: username.toLowerCase(),
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    try {
      await new Promise<void>((resolve, reject) => {
        cognitoUser.confirmRegistration(code, true, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });

      alert('Confirmation successful. You can now login.');
      router.push('/login');
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'ExpiredCodeException') {
          setErrorMessage('Confirmation code has expired. Please request a new one.');
        } else {
          setErrorMessage(`Confirmation failed: ${err.message}`);
        }
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    }
  };

  const handleResendCode = () => {
    const userPool = new CognitoUserPool(poolData);
    const userData: ICognitoUserData = {
      Username: username.toLowerCase(),
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);
  
    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        alert(`Error requesting new code: ${err.message}`); // 오류 메시지 추가
      } else {
        alert('A new confirmation code has been sent to your email.');
      }
    });
  };
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Confirm Registration</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className={styles.label}>Username or Email:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="code" className={styles.label}>Confirmation Code:</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        <button type="submit" className={styles.button}>Confirm</button>
        <button type="button" onClick={handleResendCode} className={styles.button}>Resend Confirmation Code</button>
      </form>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Confirm), { ssr: false });