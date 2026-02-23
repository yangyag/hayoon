import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLetters } from "../api";
import { LETTERS } from "../data/letterCatalog";

function LettersPage() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState(
    LETTERS.map((item) => ({ ...item, enabled: false }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const noticeTimeoutRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadLetters() {
      setLoading(true);
      setError("");

      try {
        const items = await getLetters();
        if (active) {
          setLetters(items);
        }
      } catch (loadError) {
        if (active) {
          setError("글자 목록을 불러오지 못했어요.");
          setLetters(LETTERS.map((item) => ({ ...item, enabled: false })));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLetters();

    return () => {
      active = false;
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  function showSoonMessage() {
    setNotice("곧 열려요");
    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => {
      setNotice("");
    }, 1400);
  }

  function handleLetterClick(letter) {
    if (letter.enabled) {
      navigate(`/learn/${letter.key}`);
      return;
    }
    showSoonMessage();
  }

  return (
    <main className="page letters-page">
      <header className="top-nav">
        <button type="button" className="btn ghost" onClick={() => navigate("/library")}>
          뒤로
        </button>
        <button type="button" className="btn ghost" onClick={() => navigate("/")}>
          홈
        </button>
      </header>

      <section className="panel letters-panel">
        <h1 className="section-title">어떤 글자를 배울까?</h1>
        <p className="section-subtitle">가~하 중에서 골라요.</p>

        {loading ? <p className="status-text">글자를 불러오는 중...</p> : null}
        {error ? <p className="status-text warning">{error}</p> : null}

        <div className="letters-grid">
          {letters.map((letter) => (
            <button
              key={letter.key}
              type="button"
              className={`letter-btn ${letter.enabled ? "enabled" : "locked"}`}
              onClick={() => handleLetterClick(letter)}
              aria-disabled={!letter.enabled}
            >
              {letter.label}
            </button>
          ))}
        </div>

        <p className="soon-message" aria-live="polite">
          {notice}
        </p>
      </section>
    </main>
  );
}

export default LettersPage;
