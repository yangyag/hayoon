import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLetterWords } from "../api";
import { findLetterLabel } from "../data/letterCatalog";
import {
  readLetterProgress,
  saveLastLetterKey,
  saveLetterProgress,
  saveTtsSupport
} from "../utils/progressStorage";
import { shuffle } from "../utils/shuffle";
import { isTtsSupported, speakWord, stopSpeaking } from "../utils/tts";

const EMPTY_CYCLE = {
  order: [],
  cursor: 0,
  current: null,
  lastWordId: null,
  seenCount: 0
};

function createShuffledOrder(sourceWords, lastWordId) {
  if (sourceWords.length === 0) {
    return [];
  }

  const order = shuffle(sourceWords);
  if (order.length > 1 && lastWordId && order[0]?.id === lastWordId) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

function buildInitialCycle(words, savedProgress) {
  const hasLastWord = words.some((item) => item.id === savedProgress.lastWordId);
  const safeCount = Math.max(0, Math.min(savedProgress.seenCount, words.length));

  return {
    ...EMPTY_CYCLE,
    lastWordId: hasLastWord ? savedProgress.lastWordId : null,
    seenCount: hasLastWord ? safeCount : 0
  };
}

function LearnPage() {
  const { letterKey = "" } = useParams();
  const navigate = useNavigate();

  const letterLabel = useMemo(() => findLetterLabel(letterKey), [letterKey]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [cycle, setCycle] = useState(EMPTY_CYCLE);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsNotice, setTtsNotice] = useState("");

  useEffect(() => {
    const supported = isTtsSupported();
    setTtsSupported(supported);
    saveTtsSupport(supported);

    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const savedProgress = readLetterProgress(letterKey);
    saveLastLetterKey(letterKey);

    async function loadWords() {
      setLoading(true);
      setError("");
      setShowIntro(true);
      setCycle(EMPTY_CYCLE);
      setTtsNotice("");

      try {
        const items = await getLetterWords(letterKey);
        if (active) {
          setWords(items);
          setCycle(buildInitialCycle(items, savedProgress));
        }
      } catch (loadError) {
        if (active) {
          setWords([]);
          setError("단어를 불러오지 못했어요.");
          setCycle(EMPTY_CYCLE);
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

  useEffect(() => {
    if (showIntro || !cycle.current?.id || Boolean(error)) {
      return;
    }

    saveLetterProgress(letterKey, {
      lastWordId: cycle.lastWordId,
      seenCount: cycle.seenCount
    });
  }, [cycle.current?.id, cycle.lastWordId, cycle.seenCount, error, letterKey, showIntro]);

  const drawNextWord = useCallback(() => {
    setCycle((previous) => {
      if (words.length === 0) {
        return previous;
      }

      let order = previous.order;
      let cursor = previous.cursor;

      if (order.length === 0 || cursor >= order.length) {
        order = createShuffledOrder(words, previous.lastWordId);
        cursor = 0;
      }

      const nextWord = order[cursor] ?? previous.current;
      const nextCursor = cursor + 1;
      const nextSeenCount = ((previous.seenCount % words.length) + 1);

      return {
        order,
        cursor: nextCursor,
        current: nextWord,
        lastWordId: nextWord?.id ?? previous.lastWordId,
        seenCount: nextSeenCount
      };
    });
  }, [words]);

  function handleNext() {
    stopSpeaking();
    setTtsNotice("");

    if (showIntro) {
      setShowIntro(false);
      drawNextWord();
      return;
    }
    drawNextWord();
  }

  function handleSpeak() {
    const ok = speakWord(cycle.current?.word ?? "");
    if (!ok) {
      setTtsNotice("읽어주기를 사용할 수 없어요.");
      return;
    }
    setTtsNotice("");
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
            <div className="word-actions">
              <button
                type="button"
                className="btn ghost tts-btn"
                onClick={handleSpeak}
                disabled={!ttsSupported || !currentWord?.word}
              >
                읽어주기
              </button>
            </div>
            {!ttsSupported ? (
              <p className="tts-status warning">이 브라우저는 읽어주기를 지원하지 않아요.</p>
            ) : null}
            {ttsNotice ? <p className="tts-status warning">{ttsNotice}</p> : null}
            <p className="progress-text">
              {cycle.seenCount} / {words.length}
            </p>
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
