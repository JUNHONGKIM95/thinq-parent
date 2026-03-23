import { useEffect, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import diaryExampleImage from '@shared-assets/srg/diary_example.svg'
import diaryEditActionIcon from '@shared-assets/srg/fi-rr-pencil.svg'
import diaryDeleteActionIcon from '@shared-assets/srg/fi-rr-trash.svg'
import { API_BASE_URL } from '../../config/api'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function formatDiaryDate(value) {
  if (!value) {
    return '-'
  }

  return String(value).replaceAll('-', '/')
}

async function getApiErrorMessage(response, fallbackMessage) {
  try {
    const payload = await response.json()
    return payload?.message || payload?.error || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

function getImageId(image) {
  return image?.diaryImageId ?? image?.imageId ?? image?.id ?? image?.diary_image_id ?? null
}

function getImageUrl(image) {
  return image?.imageUrl ?? image?.publicImageUrl ?? image?.thumbnailImageUrl ?? image?.url ?? ''
}

function normalizeImageEntries(item) {
  const candidates = [item?.images, item?.diaryImages, item?.imageList, item?.attachments]
  const rawImages = candidates.find(Array.isArray) ?? []

  const normalizedImages = rawImages
    .map((image) => ({
      id: getImageId(image),
      url: getImageUrl(image),
    }))
    .filter((image) => image.url)

  const thumbnailImage = item?.thumbnailImage
    ? {
        id: getImageId(item.thumbnailImage) ?? item?.thumbnailDiaryImageId ?? item?.thumbnailImageId ?? item?.diaryImageId ?? null,
        url:
          getImageUrl(item.thumbnailImage) ??
          item?.thumbnailImageUrl ??
          '',
      }
    : item?.thumbnailImageUrl
      ? {
          id: item?.thumbnailDiaryImageId ?? item?.thumbnailImageId ?? item?.diaryImageId ?? null,
          url: item.thumbnailImageUrl,
        }
      : null

  const images = thumbnailImage?.url ? [thumbnailImage, ...normalizedImages] : normalizedImages

  return images.filter((image, index, list) => {
    const key = image.id ? `id:${image.id}` : `url:${image.url}`
    return list.findIndex((candidate) => (candidate.id ? `id:${candidate.id}` : `url:${candidate.url}`) === key) === index
  })
}

function normalizeDiaryDetail(payload) {
  const item = payload?.data?.item ?? payload?.data ?? payload

  if (!item || typeof item !== 'object') {
    return null
  }

  const images = normalizeImageEntries(item)
  const primaryImage = images[0]?.url ?? ''

  return {
    id: item.diaryId ?? item.id ?? item.diary_id ?? null,
    title: item.title ?? '제목 없음',
    content: item.content ?? item.diaryContent ?? item.body ?? '',
    diaryDate: item.diaryDate ?? '',
    authorName: item.authorName ?? '작성자',
    authorUserId: item.authorUserId ?? item.userId ?? item.author_id ?? null,
    isMine: Boolean(item.isMine ?? item.mine ?? false),
    thumbnailImageUrl: primaryImage,
    imageUrl: primaryImage,
    thumbnailDiaryImageId: images[0]?.id ?? item.thumbnailDiaryImageId ?? item.thumbnailImageId ?? item.diaryImageId ?? null,
    images,
  }
}

function PregnancyDiaryDetailScreen({ diaryId, userId, onBack, onEdit, onDeleted }) {
  const [detail, setDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingImageIds, setDeletingImageIds] = useState([])

  useEffect(() => {
    if (!diaryId || !userId) {
      setDetail(null)
      setErrorMessage('조회할 임신일기 정보가 없어요.')
      return undefined
    }

    let isMounted = true
    const controller = new AbortController()

    const fetchDiaryDetail = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const query = new URLSearchParams({
          userId: String(userId),
        })

        const response = await fetch(`${API_BASE_URL}/api/pregnancy-diaries/${diaryId}?${query.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Pregnancy diary detail request failed: ${response.status}`)
        }

        const payload = await response.json()
        const nextDetail = normalizeDiaryDetail(payload)

        if (!isMounted) {
          return
        }

        if (!nextDetail) {
          setDetail(null)
          setErrorMessage('임신일기 상세 정보를 불러오지 못했어요.')
          return
        }

        if (!nextDetail.isMine && nextDetail.authorUserId && String(nextDetail.authorUserId) === String(userId)) {
          nextDetail.isMine = true
        }

        setDetail(nextDetail)
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        console.error(error)

        if (!isMounted) {
          return
        }

        setDetail(null)
        setErrorMessage('임신일기 상세 정보를 불러오지 못했어요.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDiaryDetail()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [diaryId, userId])

  const handleDeleteDiary = async () => {
    if (!detail?.id || !detail?.isMine) {
      return
    }

    const isConfirmed = window.confirm('이 임신일기를 삭제할까요?')

    if (!isConfirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pregnancy-diaries/${detail.id}?authorUserId=${encodeURIComponent(String(userId))}`,
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

      onDeleted?.()
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  const handleDeleteImage = async (diaryImageId) => {
    if (!detail?.isMine || !diaryImageId) {
      return
    }

    const isConfirmed = window.confirm('이 이미지만 삭제할까요?')

    if (!isConfirmed) {
      return
    }

    setDeletingImageIds((prev) => [...prev, diaryImageId])

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pregnancy-diaries/images/${diaryImageId}?authorUserId=${encodeURIComponent(String(userId))}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, `Pregnancy diary image delete failed: ${response.status}`))
      }

      const payload = await response.json()

      if (payload?.success === false) {
        throw new Error(payload?.message || 'Pregnancy diary image delete failed')
      }

      setDetail((prev) => {
        if (!prev) {
          return prev
        }

        const nextImages = prev.images.filter((image) => String(image.id) !== String(diaryImageId))
        const nextPrimaryImage = nextImages[0]?.url ?? ''

        return {
          ...prev,
          images: nextImages,
          thumbnailImageUrl: nextPrimaryImage,
          imageUrl: nextPrimaryImage,
          thumbnailDiaryImageId: nextImages[0]?.id ?? null,
        }
      })
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '이미지 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDeletingImageIds((prev) => prev.filter((id) => String(id) !== String(diaryImageId)))
    }
  }

  const mainImage = detail?.images?.[0] ?? null
  const galleryImages = detail?.images?.slice(1) ?? []

  return (
    <div className="pregnancy-diary-screen pregnancy-diary-detail-screen">
      <header className="pregnancy-diary-header">
        <button type="button" className="my-icon-button" aria-label="뒤로가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>임신 일기</h1>
        <button type="button" className="my-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="pregnancy-diary-content pregnancy-diary-detail-content">
        {isLoading ? <p className="pregnancy-diary-status">일기 상세를 불러오는 중이에요...</p> : null}
        {!isLoading && errorMessage ? <p className="pregnancy-diary-status">{errorMessage}</p> : null}

        {!isLoading && !errorMessage && detail ? (
          <article className="pregnancy-diary-detail-card">
            <div className="pregnancy-diary-detail-image-frame">
              <img
                src={mainImage?.url || detail.thumbnailImageUrl || diaryExampleImage}
                alt=""
                className="pregnancy-diary-detail-image"
              />
              {detail.isMine && mainImage?.id ? (
                <button
                  type="button"
                  className="pregnancy-diary-image-delete-button"
                  aria-label="대표 이미지 삭제"
                  onClick={() => handleDeleteImage(mainImage.id)}
                  disabled={deletingImageIds.some((id) => String(id) === String(mainImage.id))}
                >
                  <img src={diaryDeleteActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="pregnancy-diary-meta-row pregnancy-diary-detail-meta-row">
              <span className="pregnancy-diary-date">{formatDiaryDate(detail.diaryDate)}</span>
              <span className="pregnancy-diary-author">{detail.authorName}</span>
            </div>

            <div className="pregnancy-diary-title-row pregnancy-diary-detail-title-row">
              <h2 className="pregnancy-diary-detail-title">{detail.title}</h2>
              {detail.isMine ? (
                <div className="pregnancy-diary-actions">
                  <button
                    type="button"
                    className="pregnancy-diary-action pregnancy-diary-action--edit"
                    aria-label="일기 수정"
                    onClick={() => onEdit?.(detail)}
                  >
                    <img src={diaryEditActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="pregnancy-diary-action pregnancy-diary-action--delete"
                    aria-label="일기 삭제"
                    onClick={handleDeleteDiary}
                  >
                    <img src={diaryDeleteActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>

            <p className="pregnancy-diary-detail-body">{detail.content || '내용이 없어요.'}</p>

            {galleryImages.length ? (
              <div className="pregnancy-diary-detail-gallery">
                {galleryImages.map((image) => (
                  <div key={image.id || image.url} className="pregnancy-diary-detail-gallery-item">
                    <img src={image.url} alt="" className="pregnancy-diary-detail-gallery-image" />
                    {detail.isMine && image.id ? (
                      <button
                        type="button"
                        className="pregnancy-diary-image-delete-button pregnancy-diary-image-delete-button--gallery"
                        aria-label="이미지 삭제"
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deletingImageIds.some((id) => String(id) === String(image.id))}
                      >
                        <img src={diaryDeleteActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ) : null}
      </div>
    </div>
  )
}

export default PregnancyDiaryDetailScreen
