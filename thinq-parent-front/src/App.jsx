import { useEffect, useRef, useState } from 'react'
import './App.css'
import albumPhoto1 from './assets/album-photo-1.svg'
import albumPhoto2 from './assets/album-photo-2.svg'
import albumPhoto3 from './assets/album-photo-3.svg'
import albumPhoto4 from './assets/album-photo-4.svg'
import albumPhoto5 from './assets/album-photo-5.svg'

const albumCards = [
  { id: 1, image: albumPhoto1, alt: '아기 앨범 목업 사진 1' },
  { id: 2, image: albumPhoto2, alt: '아기 앨범 목업 사진 2' },
  { id: 3, image: albumPhoto3, alt: '아기 앨범 목업 사진 3' },
  { id: 4, image: albumPhoto4, alt: '아기 앨범 목업 사진 4' },
  { id: 5, image: albumPhoto5, alt: '아기 앨범 목업 사진 5' },
]

const diaryCards = [
  {
    title: '육아일기',
    body: '매일 기록하며 몸과 마음 변화를 정리해요.',
    action: '일기 쓰기',
    type: 'primary',
  },
  {
    title: '진단 기록',
    body: '태몽이가 어제 분유를 10ml 더 먹었어요.\n태몽이의 섭취시간은 일정해요.\n새벽이 4번 깼어요.',
    action: '기록 보기',
    type: 'secondary',
  },
]

const navItems = [
  { label: '홈', icon: 'home', active: true },
  { label: '가전육아', icon: 'baby' },
  { label: '타이머', icon: 'timer' },
  { label: '챗육피티', icon: 'chat' },
  { label: '커뮤니티', icon: 'pin' },
]

function App() {
  const albumRowRef = useRef(null)
  const [albumProgress, setAlbumProgress] = useState({ width: 42, left: 0 })

  useEffect(() => {
    const syncAlbumProgress = () => {
      const albumRow = albumRowRef.current

      if (!albumRow) {
        return
      }

      const maxScrollLeft = albumRow.scrollWidth - albumRow.clientWidth

      if (maxScrollLeft <= 0) {
        setAlbumProgress({ width: 100, left: 0 })
        return
      }

      const visibleRatio = albumRow.clientWidth / albumRow.scrollWidth
      const thumbWidth = Math.max(visibleRatio * 100, 18)
      const maxLeft = 100 - thumbWidth
      const thumbLeft = (albumRow.scrollLeft / maxScrollLeft) * maxLeft

      setAlbumProgress({ width: thumbWidth, left: thumbLeft })
    }

    const albumRow = albumRowRef.current

    syncAlbumProgress()

    if (!albumRow) {
      return undefined
    }

    albumRow.addEventListener('scroll', syncAlbumProgress, { passive: true })
    window.addEventListener('resize', syncAlbumProgress)

    return () => {
      albumRow.removeEventListener('scroll', syncAlbumProgress)
      window.removeEventListener('resize', syncAlbumProgress)
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Mom mode mobile mockup">
        <header className="status-bar">
          <span>2:54</span>
          <span className="status-pill" aria-hidden="true" />
        </header>

        <div className="screen">
          <section className="topbar">
            <button type="button" className="icon-button back-button" aria-label="뒤로가기">
              <span />
            </button>
            <h1>마미 모드</h1>
            <button type="button" className="icon-button menu-button" aria-label="더보기">
              <span />
              <span />
              <span />
            </button>
          </section>

          <section className="dday-card">
            <div>
              <p className="dday-label">태몽이와 함께한 지</p>
            </div>
            <div className="dday-count">
              <span className="heart" aria-hidden="true" />
              <strong>+ 112일 째</strong>
            </div>
          </section>

          <section className="section-block compact-block">
            <div className="section-head">
              <h2>우리 아이 앨범</h2>
              <button type="button" className="chevron-button" aria-label="앨범 더보기">
                <span />
              </button>
            </div>

            <div ref={albumRowRef} className="album-row" aria-label="우리 아이 앨범 가로 스크롤">
              {albumCards.map((card) => (
                <article key={card.id} className="album-card">
                  <img src={card.image} alt={card.alt} className="album-image" />
                </article>
              ))}
            </div>
            <div className="album-progress" aria-hidden="true">
              <span
                className="album-progress-thumb"
                style={{
                  width: `${albumProgress.width}%`,
                  left: `${albumProgress.left}%`,
                }}
              />
            </div>
          </section>

          <section className="diary-grid">
            {diaryCards.map((card) => (
              <article key={card.title} className={`diary-card ${card.type}`}>
                <div className="diary-header">
                  <h3>{card.title}</h3>
                  {card.type === 'secondary' ? <span className="mini-mark">ai</span> : null}
                </div>
                <p>{card.body}</p>
                <button type="button" className={`action-chip ${card.type}`}>
                  {card.type === 'primary' ? <span className="plus-mark">+</span> : null}
                  {card.action}
                </button>
              </article>
            ))}
          </section>

          <section className="section-block compact-block mode-section">
            <div className="section-head">
              <div>
                <h2>아기 취침 모드</h2>
                <p className="section-copy">울음으로 전환하고 알림을 시각적으로 보여줘요.</p>
              </div>
              <button type="button" className="chevron-button" aria-label="취침 모드 더보기">
                <span />
              </button>
            </div>

            <div className="sleep-toggle-row">
              <span className="toggle-label">취침 모드 켜기</span>
              <button type="button" className="sleep-toggle" aria-pressed="false">
                <span />
              </button>
            </div>
          </section>

          <section className="mbti-section">
            <h2>MomBTI 측정하기</h2>
            <article className="mbti-card">
              <p>나는 어떤 부모인지 확인해보세요.</p>
              <button type="button" className="measure-button">
                측정하기
              </button>
            </article>
          </section>
        </div>

        <nav className="bottom-nav" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${item.active ? 'active' : ''}`}
              aria-current={item.active ? 'page' : undefined}
            >
              <span className={`nav-icon ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </section>
    </main>
  )
}

export default App
