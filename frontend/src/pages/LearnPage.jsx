import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLetterWords } from "../api";
import { findLetterLabel } from "../data/letterCatalog";
import { shuffle } from "../utils/shuffle";

function LearnPage() {
  const { letterKey = "" } = useParams();
  const navigate = useNavigate();

  const letterLabel = useMemo(() => findLetterLabel(letterKey), [letterKey]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [cycle, setCycle] = useState({
    current: null,
    queue: []
  });

  useEffect(() => {
    let active = true;

    async function loadWords() {
      setLoading(true);
      setError("");
      setShowIntro(true);
      setCycle({ current: null, queue: [] });

      try {
        const items = await getLetterWords(letterKey);
        if (active) {
          setWords(items);
        }
      } catch (loadError) {
        if (active) {
          setWords([]);
          setError("단어를 불러오지 못했어요.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadWords();
    return () => {
      active = false;
    };
  }, [letterKey]);

  useEffect(() => {
    setImageFailed(false);
  }, [cycle.current?.id]);

  const drawNextWord = useCallback(() => {
    setCycle((previous) => {
      if (words.length === 0) {
        return previous;
      }

      let queue = previous.queue;
      if (queue.length === 0) {
        queue = shuffle(words);
        if (
          queue.length > 1 &&
          previous.current &&
          queue[0].id === previous.current.id
        ) {
          [queue[0], queue[1]] = [queue[1], queue[0]];
        }
      }

      const [nextWord, ...rest] = queue;
      return {
        current: nextWord ?? previous.current,
        queue: rest
      };
    });
  }, [words]);

  function handleNext() {
    if (showIntro) {
      setShowIntro(false);
      drawNextWord();
      return;
    }
    drawNextWord();
  }

  function renderWord(word) {
    if (!word) {
      return null;
    }

    return (
      <>
        <strong>{word.slice(0, 1)}</strong>
        {word.slice(1)}
      </>
    );
  }

  const currentWord = cycle.current;

  return (
    <main className="page learn-page">
      <header className="top-nav">
        <button type="button" className="btn ghost" onClick={() => navigate("/letters")}>
          뒤로
        </button>
        <button type="button" className="btn ghost" onClick={() => navigate("/")}>
          홈
        </button>
      </header>

      <section className="panel learn-panel">
        {loading ? <p className="status-text">학습 카드를 준비하는 중...</p> : null}
        {!loading && error ? <p className="status-text warning">{error}</p> : null}

        {!loading && !error && showIntro ? (
          <article className="intro-card">
            <p className="intro-label">오늘의 글자</p>
            <div className="intro-letter">{letterLabel}</div>
            <p className="section-subtitle">버튼을 눌러 단어 놀이를 시작해요.</p>
          </article>
        ) : null}

        {!loading && !error && !showIntro ? (
          <article className="word-card">
            <div className="image-frame">
              {currentWord?.imageUrl && !imageFailed ? (
                <img
                  src={currentWord.imageUrl}
                  alt={currentWord.word}
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="image-placeholder">이미지 준비 중</div>
              )}
            </div>
            <p className="word-text">{renderWord(currentWord?.word)}</p>
          </article>
        ) : null}

        {!loading && !error && words.length === 0 ? (
          <p className="status-text warning">아직 단어가 없어요.</p>
        ) : null}

        <button
          type="button"
          className="btn primary giant"
          onClick={handleNext}
          disabled={loading || Boolean(error) || words.length === 0}
        >
          다음
        </button>
      </section>
    </main>
  );
}

export default LearnPage;
