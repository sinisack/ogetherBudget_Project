import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from '../api/http';
import './AuthPages.css';

export default function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await http.post('/auth/login', {
                email: email,
                password: password,
            });

            if (response.status === 200) {
                setTimeout(() => {
                    onLoginSuccess(true); 
                }, 100); 
            }

        } catch (e) {
            console.error("로그인 실패:", e);
            setError(e.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">WIZLET</h2>
                <p className="auth-subtitle">지금 입력하면, 구성원이 바로 본다. 반복 지출은 자동으로, 예산은 실시간으로</p>

                <h3 className="form-heading">로그인</h3>

                <form onSubmit={handleLogin} className="auth-form">
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        className="auth-input"
                    />

                    <label htmlFor="password">비밀번호</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        required
                        className="auth-input"
                    />

                    {error && <p className="error-message">{error}</p>}

                    <div className="link-area">
                        <Link to="/register" className="auth-link">아직 계정이 없으신가요? 회원가입하기</Link>
                    </div>

                    <button type="submit" className="auth-button login-btn">
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
}