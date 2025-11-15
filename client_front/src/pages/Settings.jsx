import { useEffect, useState } from "react";
import "./Settings.css";

export default function Settings() {
    const [defaultBudget, setDefaultBudget] = useState("");
    const [autoApplyBudget, setAutoApplyBudget] = useState(false);
    const [numberFormat, setNumberFormat] = useState("comma");
    const [dateFormat, setDateFormat] = useState("YYYY.MM.DD");
    const [themeMode, setThemeMode] = useState("system");

    useEffect(() => {
        const savedDefault = localStorage.getItem("settings-defaultBudget");
        const savedAuto = localStorage.getItem("settings-autoApplyBudget");
        const savedNum = localStorage.getItem("settings-numberFormat");
        const savedDate = localStorage.getItem("settings-dateFormat");
        const savedTheme = localStorage.getItem("settings-themeMode");

        if (savedDefault) setDefaultBudget(savedDefault);
        if (savedAuto) setAutoApplyBudget(savedAuto === "true");
        if (savedNum) setNumberFormat(savedNum);
        if (savedDate) setDateFormat(savedDate);
        if (savedTheme) setThemeMode(savedTheme);
    }, []);

    useEffect(() => {
        applyTheme(themeMode);
    }, [themeMode]);

    const applyTheme = (mode) => {
        const root = document.documentElement;

        if (mode === "light") {
            root.setAttribute("data-theme", "light");
        } else if (mode === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.setAttribute("data-theme", systemDark ? "dark" : "light");
        }
    };

    const saveThemeMode = (value) => {
        setThemeMode(value);
        localStorage.setItem("settings-themeMode", value);
        applyTheme(value);
    };

    const saveDefaultBudget = () => {
        if (!defaultBudget || Number(defaultBudget) < 0) {
            alert("유효한 예산을 입력해주세요.");
            return;
        }
        localStorage.setItem("settings-defaultBudget", defaultBudget);
        alert("기본 예산이 저장되었습니다.");
    };

    const toggleAutoBudget = () => {
        const value = !autoApplyBudget;
        setAutoApplyBudget(value);
        localStorage.setItem("settings-autoApplyBudget", String(value));
    };

    const saveNumberFormat = (value) => {
        setNumberFormat(value);
        localStorage.setItem("settings-numberFormat", value);
    };

    const saveDateFormat = (value) => {
        setDateFormat(value);
        localStorage.setItem("settings-dateFormat", value);
    };

    const handleResetData = () => {
        const yes = window.confirm(
            "예산 설정과 사용자 환경설정(숫자/날짜 표현 방식 등)을 초기화합니다.\n" +
            "저장된 예산 및 설정 데이터가 모두 삭제됩니다.\n\n" +
            "⚠ 거래 내역은 삭제되지 않습니다.\n\n" +
            "초기화하시겠습니까?"
        );

        if (!yes) return;
        localStorage.clear();

        alert("예산 및 설정 데이터가 초기화되었습니다.");
        window.location.reload();
    };

    return (
        <div className="settings-page">
            <h2 className="settings-title">설정</h2>

            <div className="settings-card">
                <h3>기본 월 예산</h3>
                <p className="desc">매월 자동 적용될 기본 예산입니다.</p>

                <div className="input-group">
                    <input
                        type="number"
                        placeholder="예: 1500000"
                        value={defaultBudget}
                        onChange={(e) => setDefaultBudget(e.target.value)}
                    />
                    <button onClick={saveDefaultBudget}>저장</button>
                </div>
            </div>

            <div className="settings-card">
                <h3>예산 자동 적용</h3>
                <label className="toggle">
                    <input
                        type="checkbox"
                        checked={autoApplyBudget}
                        onChange={toggleAutoBudget}
                    />
                    <span>다음 달에 기본 예산 자동 적용</span>
                </label>
            </div>

            <div className="settings-card">
                <h3>숫자 표현 방식</h3>
                <select
                    value={numberFormat}
                    onChange={(e) => saveNumberFormat(e.target.value)}
                >
                    <option value="comma">1,234,567</option>
                    <option value="dot">1.234.567</option>
                    <option value="plain">1234567</option>
                </select>
            </div>

            <div className="settings-card">
                <h3>날짜 표기 방식</h3>
                <select
                    value={dateFormat}
                    onChange={(e) => saveDateFormat(e.target.value)}
                >
                    <option value="YYYY.MM.DD">2025.01.31</option>
                    <option value="YYYY-MM-DD">2025-01-31</option>
                    <option value="MM/DD/YYYY">01/31/2025</option>
                </select>
            </div>

            <div className="settings-card">
                <h3>테마 모드</h3>
                <select
                    value={themeMode}
                    onChange={(e) => saveThemeMode(e.target.value)}
                >
                    <option value="light">라이트 모드</option>
                    <option value="dark">다크 모드</option>
                    <option value="system">시스템 설정 따르기</option>
                </select>
            </div>

            <div className="settings-card danger-zone">
                <h3>로컬 데이터 초기화</h3>
                <p className="desc danger-text">모든 로컬 데이터가 삭제됩니다.</p>
                <button className="danger" onClick={handleResetData}>
                    로컬 데이터 초기화
                </button>
            </div>
        </div>
    );
}