import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from '../api/http';
import './AuthPages.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const response = await http.post('/auth/signup', {
        email,
        password,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (e) {
      console.error("회원가입 실패:", e);
      setError(
        e.response?.data?.message ||
        '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">WIZLET</h2>
        <p className="auth-subtitle">
          지금 입력하면, 구성원이 바로 본다. 반복 지출은 자동으로, 예산은 실시간으로
        </p>

        <h3 className="form-heading">회원가입</h3>

        <form onSubmit={handleRegister} className="auth-form">
          <label htmlFor="reg-email">이메일</label>
          <input
            id="reg-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="auth-input"
          />

          <label htmlFor="reg-password">비밀번호</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
            className="auth-input"
          />

          <label htmlFor="confirm-password">비밀번호 확인</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="password"
            required
            className="auth-input"
          />

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="link-area">
            <Link to="/login" className="auth-link">
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>

          <button type="submit" className="auth-button register-btn">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}