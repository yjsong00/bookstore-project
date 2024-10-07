import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import styles from '../app/register.module.css'; // CSS 모듈 가져오기
import { useRouter } from 'next/router';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // 이전 에러 메시지 초기화

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // 이메일 형식 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    const poolData = {
      UserPoolId: 'ap-northeast-2_MOp2LBaMU',
      ClientId: '4hhqgfj55n7spi2rmm4svb7d3n'
    };

    const userPool = new CognitoUserPool(poolData);

    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email
      })
    ];

    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        setErrorMessage(err.message || JSON.stringify(err));
        return;
      }
      alert('Registration successful. Please check your email for the confirmation code.');
      if (result && isClient) {
        router.push("/confirm"); // Next.js 라우팅을 사용한 리디렉션
      }
    });
  };

  if (!isClient) {
    return null; // 클라이언트에서만 렌더링
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BOOKSTORE FOR YOU</h1>
      <h2 className={styles.subtitle}>Register!</h2>
      {errorMessage && <div className={styles.error}>{errorMessage}</div>} {/* 에러 메시지 표시 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="username" className={styles.label}>
          Username:
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label htmlFor="email" className={styles.label}>
          Email:
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label htmlFor="password" className={styles.label}>
          Password:
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm Password:
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <button type="submit" className={styles.button}>Register</button>
      </form>
      <p className={styles.link}>
        Already have an account? <Link href="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default Register;