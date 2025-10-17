// 브라우저 전역에 Node의 global 대체
// 이미 설정돼 있으면 덮어쓰지 않음
window.global = window.global || window;
