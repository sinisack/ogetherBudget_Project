import { useState, useEffect } from "react";
import http from "../api/http";
import { CATEGORY_COLORS } from "../utils/categoryColors";
import "./TransactionManageModal.css";

export default function TransactionManageModal({ transaction, onClose, onChanged }) {

    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
        type: transaction.type,
        category: transaction.category,
        customCategory: "",
        memo: transaction.memo,
        amount: transaction.amount,
    });

    const categories = CATEGORY_COLORS[form.type]
        ? Object.keys(CATEGORY_COLORS[form.type])
        : [];

    useEffect(() => {
        if (!categories.includes(form.category)) {
            setForm((f) => ({
                ...f,
                category: categories[0],
                customCategory: "",
            }));
        }
    }, [form.type]);

    const [memoList, setMemoList] = useState([]);
    const [showMemoList, setShowMemoList] = useState(false);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("recent-memos") || "[]");
        setMemoList(saved);
    }, []);

    const saveRecentMemo = (memo) => {
        const clean = memo.trim();
        if (!clean) return;

        let recent = JSON.parse(localStorage.getItem("recent-memos") || "[]");

        recent = [clean, ...recent.filter((m) => m !== clean)].slice(0, 10);

        localStorage.setItem("recent-memos", JSON.stringify(recent));
        setMemoList(recent);
    };

    const change = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const updateTx = async () => {
        const finalCategory =
            form.category === "기타"
                ? form.customCategory.trim() || "기타"
                : form.category;

        const payload = {
            ...form,
            category: finalCategory,
            memo: form.memo.trim() || "",
        };

        await http.put(`/transactions/${transaction.id}`, payload);

        saveRecentMemo(form.memo);

        onChanged?.();
        onClose();
    };

    const deleteTx = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        await http.delete(`/transactions/${transaction.id}`);

        onChanged?.();
        onClose();
    };

    return (
        <div className="tx-modal-backdrop">
            <div className="tx-modal">
                <h3>내역 관리</h3>

                {!editing ? (
                    <>
                        <p><b>{transaction.category}</b></p>
                        <p>{transaction.memo}</p>
                        <p>{transaction.amount}원</p>

                        <div className="modal-btn-wrap">
                            <button onClick={() => setEditing(true)}>수정</button>
                            <button onClick={deleteTx} className="danger">삭제</button>
                        </div>
                    </>
                ) : (
                    <div className="edit-form">

                        <label>유형</label>
                        <select name="type" value={form.type} onChange={change}>
                            <option value="INCOME">수입</option>
                            <option value="EXPENSE">지출</option>
                        </select>

                        <label>카테고리</label>
                        <select name="category" value={form.category} onChange={change}>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        {form.category === "기타" && (
                            <input
                                name="customCategory"
                                value={form.customCategory}
                                onChange={change}
                                placeholder="직접 입력"
                            />
                        )}

                        <label>메모</label>
                        <input
                            name="memo"
                            value={form.memo}
                            onChange={change}
                            onFocus={() => setShowMemoList(true)}
                            onBlur={() => setTimeout(() => setShowMemoList(false), 100)}
                            placeholder="메모 입력"
                            autoComplete="off"
                        />

                        {showMemoList && memoList.length > 0 && (
                            <div className="memo-suggest-box">
                                {memoList.map((m, i) => (
                                    <div
                                        key={i}
                                        className="memo-suggest-item"
                                        onMouseDown={() => {
                                            setForm((f) => ({ ...f, memo: m }));
                                        }}
                                    >
                                        {m}
                                    </div>
                                ))}
                            </div>
                        )}

                        <label>금액</label>
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={change}
                        />

                        <div className="modal-btn-wrap">
                            <button onClick={updateTx}>저장</button>
                            <button onClick={() => setEditing(false)}>취소</button>
                        </div>

                    </div>
                )}

                <button className="close-btn" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
}