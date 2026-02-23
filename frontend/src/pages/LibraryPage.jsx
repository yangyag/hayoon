import { useNavigate } from "react-router-dom";

function LibraryPage() {
  const navigate = useNavigate();

  return (
    <main className="page library-page">
      <header className="top-nav">
        <button type="button" className="btn ghost" onClick={() => navigate("/")}>
          홈
        </button>
      </header>

      <section className="panel library-panel">
        <h1 className="section-title">책장을 열어볼까?</h1>
        <p className="section-subtitle">오늘은 가나다 한글 책 한 권!</p>

        <button
          type="button"
          className="book-card"
          onClick={() => navigate("/letters")}
          aria-label="가나다 한글 책 열기"
        >
          <span className="book-spine">가나다</span>
          <span className="book-title">가나다 한글</span>
          <span className="book-hint">터치해서 시작</span>
        </button>
      </section>
    </main>
  );
}

export default LibraryPage;
