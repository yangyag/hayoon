import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <main className="page welcome-page">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="bg-orb orb-c" />

      <section className="panel welcome-panel">
        <p className="eyebrow">한글 놀이 시간</p>
        <h1 className="hero-title">하윤이 환영해~</h1>
        <p className="hero-subtitle">반짝이는 책장에서 가나다 여행을 시작해요.</p>
        <button
          type="button"
          className="btn primary giant"
          onClick={() => navigate("/library")}
        >
          시작하기
        </button>
      </section>
    </main>
  );
}

export default WelcomePage;
