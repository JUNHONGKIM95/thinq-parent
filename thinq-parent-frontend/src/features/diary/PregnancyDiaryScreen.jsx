import { useEffect, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import diaryExampleImage from '@shared-assets/srg/diary_example.svg'
import diaryEditActionIcon from '@shared-assets/srg/fi-rr-pencil.svg'
import diaryDeleteActionIcon from '@shared-assets/srg/fi-rr-trash.svg'
import { API_BASE_URL } from '../../config/api'
import { readCachedDiaryList, removeDiaryFromCache, writeCachedDiaryDetail, writeCachedDiaryList } from './diaryCache'

const DIARY_PAGE_SIZE = 10

async function getApiErrorMessage(response, fallbackMessage) {
  try {
    const payload = await response.json()
    return payload?.message || payload?.error || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function PencilIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="m4 20 4.2-.8L19 8.4a1.4 1.4 0 0 0 0-2l-1.4-1.4a1.4 1.4 0 0 0-2 0L4.8 15.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m13.5 6.5 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PaginationIcon({ direction, double = false }) {
  const path = direction === 'left' ? 'M14 7 9 12l5 5' : 'M10 7l5 5-5 5'

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {double ? (
        <path
          d={direction === 'left' ? 'M9 7 4 12l5 5' : 'M15 7l5 5-5 5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  )
}

function formatDiaryDate(value) {
  if (!value) {
    return '-'
  }

  return String(value).replaceAll('-', '/')
}

function mapDiaryItem(item) {
  const diaryId = item.diaryId ?? item.id ?? item.diary_id ?? item.pregnancyDiaryId ?? null

  return {
    id: diaryId,
    image: item.thumbnailImageUrl || diaryExampleImage,
    imageUrl: item.thumbnailImageUrl || '',
    date: formatDiaryDate(item.diaryDate),
    diaryDate: item.diaryDate || '',
    author: item.authorName || '작성자',
    title: item.title || '제목 없음',
    content: item.content ?? item.diaryContent ?? item.body ?? '',
    isMine: Boolean(item.isMine),
    thumbnailDiaryImageId: item.thumbnailDiaryImageId ?? item.thumbnailImageId ?? item.diaryImageId ?? null,
  }
}

function buildDetailCacheValue(item, userId) {
  if (!item?.id) {
    return null
  }

  const images = item.imageUrl
    ? [
        {
          id: item.thumbnailDiaryImageId ?? null,
          url: item.imageUrl,
        },
      ]
    : []

  return {
    id: item.id,
    title: item.title,
    content: item.content,
    diaryDate: item.diaryDate,
    authorName: item.author,
    authorUserId: item.isMine ? userId : null,
    isMine: item.isMine,
    thumbnailImageUrl: item.imageUrl,
    imageUrl: item.imageUrl,
    thumbnailDiaryImageId: item.thumbnailDiaryImageId ?? null,
    images,
  }
}

function PregnancyDiaryScreen({ userId, onBack, onOpenWrite, onEdit, onOpenDetail }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [diaryItems, setDiaryItems] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!userId) {
      setDiaryItems([])
      setTotalPages(1)
      return undefined
    }

    let isMounted = true
    const controller = new AbortController()
    const cachedValue = readCachedDiaryList(userId, currentPage, DIARY_PAGE_SIZE)

    if (cachedValue?.items?.length) {
      setDiaryItems(cachedValue.items)
      setTotalPages(Math.max(1, Number(cachedValue?.pagination?.totalPages) || 1))
    }

    const fetchDiaries = async () => {
      setIsLoading(!cachedValue?.items?.length)
      setErrorMessage('')

      try {
        const query = new URLSearchParams({
          userId: String(userId),
          page: String(currentPage),
          limit: String(DIARY_PAGE_SIZE),
        })

        const response = await fetch(`${API_BASE_URL}/api/pregnancy-diaries?${query.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Pregnancy diaries request failed: ${response.status}`)
        }

        const payload = await response.json()
        const items = Array.isArray(payload?.data?.items) ? payload.data.items : []
        const pagination = payload?.data?.pagination

        if (!isMounted) {
          return
        }

        const mappedItems = items.map(mapDiaryItem)
        const nextTotalPages = Math.max(1, Number(pagination?.totalPages) || 1)

        setDiaryItems(mappedItems)
        setTotalPages(nextTotalPages)

        writeCachedDiaryList(userId, currentPage, DIARY_PAGE_SIZE, {
          items: mappedItems,
          pagination: {
            page: Number(pagination?.page) || currentPage,
            limit: Number(pagination?.limit) || DIARY_PAGE_SIZE,
            totalCount: Number(pagination?.totalCount) || mappedItems.length,
            totalPages: nextTotalPages,
          },
        })
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        console.error(error)

        if (!isMounted) {
          return
        }

        if (!cachedValue?.items?.length) {
          setDiaryItems([])
          setTotalPages(1)
          setErrorMessage('임신일기 목록을 불러오지 못했어요.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDiaries()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [currentPage, reloadToken, userId])

  const handleDelete = async (event, diaryId) => {
    event.stopPropagation()

    if (!diaryId || !userId) {
      return
    }

    const isConfirmed = window.confirm('이 임신일기를 삭제할까요?')

    if (!isConfirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pregnancy-diaries/${diaryId}?authorUserId=${encodeURIComponent(String(userId))}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, `Pregnancy diary delete failed: ${response.status}`))
      }

      const payload = await response.json()

      if (payload?.success === false) {
        throw new Error(payload?.message || 'Pregnancy diary delete failed')
      }

      removeDiaryFromCache(userId, diaryId)
      setReloadToken((prev) => prev + 1)
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <div className="pregnancy-diary-screen">
      <header className="pregnancy-diary-header">
        <button type="button" className="my-icon-button" aria-label="뒤로가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>임신 일기</h1>
        <button type="button" className="my-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="pregnancy-diary-content">
        <div className="pregnancy-diary-list">
          {isLoading ? <p className="pregnancy-diary-status">일기 목록을 불러오는 중이에요...</p> : null}
          {!isLoading && errorMessage ? <p className="pregnancy-diary-status">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && !diaryItems.length ? (
            <p className="pregnancy-diary-status">아직 등록된 임신일기가 없어요.</p>
          ) : null}

          {diaryItems.map((item) => (
            <article
              key={item.id}
              className="pregnancy-diary-card pregnancy-diary-card--interactive"
            >
              <button
                type="button"
                className="pregnancy-diary-card-link"
                aria-label={`${item.title} 상세 보기`}
                onClick={() => {
                  const detailCacheValue = buildDetailCacheValue(item, userId)

                  if (detailCacheValue) {
                    writeCachedDiaryDetail(userId, item.id, detailCacheValue)
                  }

                  onOpenDetail?.(item.id)
                }}
              />
              <div className="pregnancy-diary-image-frame">
                <img src={item.image} alt="" className="pregnancy-diary-image" />
              </div>

              <div className="pregnancy-diary-meta-row">
                <span className="pregnancy-diary-date">{item.date}</span>
                <span className="pregnancy-diary-author">{item.author}</span>
              </div>

              <div className="pregnancy-diary-title-row">
                <h2>{item.title}</h2>
                {item.isMine ? (
                  <div className="pregnancy-diary-actions">
                    <button
                      type="button"
                      className="pregnancy-diary-action pregnancy-diary-action--edit"
                      aria-label="일기 수정"
                      onClick={(event) => {
                        event.stopPropagation()
                        const detailCacheValue = buildDetailCacheValue(item, userId)

                        if (detailCacheValue) {
                          writeCachedDiaryDetail(userId, item.id, detailCacheValue)
                        }

                        onEdit?.(item)
                      }}
                    >
                      <img src={diaryEditActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="pregnancy-diary-action pregnancy-diary-action--delete"
                      aria-label="일기 삭제"
                      onClick={(event) => handleDelete(event, item.id)}
                    >
                      <img src={diaryDeleteActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div className="pregnancy-diary-pagination">
          <button type="button" className="pregnancy-diary-pagination-button" aria-label="첫 페이지" onClick={() => setCurrentPage(1)}>
            <PaginationIcon direction="left" double />
          </button>
          <button
            type="button"
            className="pregnancy-diary-pagination-button"
            aria-label="이전 페이지"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            <PaginationIcon direction="left" />
          </button>
          <span className="pregnancy-diary-pagination-current">{currentPage}</span>
          <button
            type="button"
            className="pregnancy-diary-pagination-button"
            aria-label="다음 페이지"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <PaginationIcon direction="right" />
          </button>
          <button
            type="button"
            className="pregnancy-diary-pagination-button"
            aria-label="마지막 페이지"
            onClick={() => setCurrentPage(totalPages)}
          >
            <PaginationIcon direction="right" double />
          </button>
        </div>
      </div>

      <div className="pregnancy-diary-bottom-bar">
        <button type="button" className="pregnancy-diary-write-button" aria-label="일기 쓰기" onClick={onOpenWrite}>
          <PencilIcon className="pregnancy-diary-write-icon" />
        </button>
      </div>
    </div>
  )
}

export default PregnancyDiaryScreen
