import { useEffect, useMemo, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import diaryHeartIcon from '@shared-assets/srg/diary_heart.svg'
import diaryDeleteActionIcon from '@shared-assets/srg/fi-rr-trash.svg'
import { API_BASE_URL } from '../../config/api'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function MediaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 7.5A2 2 0 0 1 6.5 5.5h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1.4" fill="currentColor" />
      <path
        d="m7.5 16 3.3-3 2.6 2.2 2.1-1.9 2 2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDiaryDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function normalizeUploadedImage(payload) {
  const root = payload?.data?.image ?? payload?.data ?? payload

  if (Array.isArray(root)) {
    return root[0] ?? null
  }

  if (root && typeof root === 'object') {
    return root
  }

  return null
}

function extractDiaryImageId(image) {
  return image?.diaryImageId ?? image?.imageId ?? image?.id ?? image?.diary_image_id ?? null
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

  return {
    title: item.title ?? '',
    content: item.content ?? item.diaryContent ?? item.body ?? '',
    diaryDate: item.diaryDate ?? '',
    imageUrl: images[0]?.url ?? item.thumbnailImageUrl ?? item.thumbnailImage?.imageUrl ?? '',
    thumbnailDiaryImageId: images[0]?.id ?? item.thumbnailDiaryImageId ?? item.thumbnailImageId ?? item.diaryImageId ?? null,
    images,
  }
}

function PregnancyDiaryWriteScreen({ userId, onBack, onSuccess, babyNickname, initialDiary }) {
  const isEditMode = Boolean(initialDiary?.id)
  const initialDiaryDate = initialDiary?.diaryDate || getDateKey(new Date())
  const [title, setTitle] = useState(initialDiary?.title || '')
  const [content, setContent] = useState(initialDiary?.content || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [deletingImageIds, setDeletingImageIds] = useState([])
  const diaryOwnerLabel = `${babyNickname || '아기'} 엄마`
  const diaryDate = useMemo(() => initialDiaryDate, [initialDiaryDate])
  const diaryDateLabel = useMemo(() => formatDiaryDate(new Date(`${initialDiaryDate}T00:00:00`)), [initialDiaryDate])

  const isSubmitDisabled = isSubmitting || !title.trim() || !content.trim() || !userId

  useEffect(() => {
    setTitle(initialDiary?.title || '')
    setContent(initialDiary?.content || '')
    setSelectedFile(null)
    setStatusMessage('')
    setExistingImages(Array.isArray(initialDiary?.images) ? initialDiary.images.map((image) => ({
      id: image?.id ?? image?.diaryImageId ?? image?.imageId ?? null,
      url: image?.url ?? image?.imageUrl ?? '',
    })).filter((image) => image.url) : [])
  }, [initialDiary])

  useEffect(() => {
    if (!isEditMode || !initialDiary?.id) {
      return undefined
    }

    let isMounted = true
    const controller = new AbortController()

    const fetchDiaryDetail = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/pregnancy-diaries/${initialDiary.id}?userId=${encodeURIComponent(String(userId))}`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          return
        }

        const payload = await response.json()
        const detail = normalizeDiaryDetail(payload)

        if (!isMounted || !detail) {
          return
        }

        setTitle(detail.title || '')
        setContent(detail.content || '')
        setExistingImages(detail.images)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error)
        }
      }
    }

    fetchDiaryDetail()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [initialDiary, isEditMode, userId])

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile)
    }

    return existingImages[0]?.url || initialDiary?.imageUrl || initialDiary?.thumbnailImageUrl || ''
  }, [existingImages, initialDiary, selectedFile])

  useEffect(() => {
    if (!selectedFile) {
      return undefined
    }

    const objectUrl = previewUrl

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [previewUrl, selectedFile])

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedFile(nextFile)
    setStatusMessage('')
  }

  const deleteDiaryImageById = async (diaryImageId) => {
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
  }

  const handleDeleteImage = async (diaryImageId) => {
    if (!isEditMode || !diaryImageId || !userId) {
      return
    }

    const isConfirmed = window.confirm('이 이미지만 삭제할까요?')

    if (!isConfirmed) {
      return
    }

    setDeletingImageIds((prev) => [...prev, diaryImageId])
    setStatusMessage('')

    try {
      await deleteDiaryImageById(diaryImageId)

      setExistingImages((prev) => prev.filter((image) => String(image.id) !== String(diaryImageId)))
      setStatusMessage('이미지를 삭제했어요.')
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : '이미지 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDeletingImageIds((prev) => prev.filter((id) => String(id) !== String(diaryImageId)))
    }
  }

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return
    }

    setIsSubmitting(true)
    setStatusMessage('')

    try {
      let uploadedImage = null

      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedFile)

        const uploadResponse = await fetch(
          `${API_BASE_URL}/api/pregnancy-diaries/images/upload?userId=${encodeURIComponent(String(userId))}`,
          {
            method: 'POST',
            body: uploadFormData,
          },
        )

        if (!uploadResponse.ok) {
          throw new Error(await getApiErrorMessage(uploadResponse, `Pregnancy diary image upload failed: ${uploadResponse.status}`))
        }

        const uploadPayload = await uploadResponse.json()

        if (uploadPayload?.success === false) {
          throw new Error(uploadPayload?.message || 'Pregnancy diary image upload failed')
        }

        uploadedImage = normalizeUploadedImage(uploadPayload)
      }

      const basePayload = {
        authorUserId: userId,
        title: title.trim(),
        content: content.trim(),
        diaryDate,
      }

      if (isEditMode) {
        const existingImageIdsToReplace = selectedFile
          ? existingImages
              .map((image) => image.id)
              .filter(Boolean)
          : []

        const updatePayload = {
          ...basePayload,
          addImages: uploadedImage ? [uploadedImage] : [],
          deleteImageIds: [],
        }

        const nextThumbnailDiaryImageId =
          extractDiaryImageId(uploadedImage) ??
          existingImages[0]?.id ??
          initialDiary?.thumbnailDiaryImageId ??
          null

        if (nextThumbnailDiaryImageId) {
          updatePayload.thumbnailDiaryImageId = nextThumbnailDiaryImageId
        }

        const updateResponse = await fetch(`${API_BASE_URL}/api/pregnancy-diaries/${initialDiary.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        })

        if (!updateResponse.ok) {
          throw new Error(await getApiErrorMessage(updateResponse, `Pregnancy diary update failed: ${updateResponse.status}`))
        }

        const updatePayloadResult = await updateResponse.json()

        if (updatePayloadResult?.success === false) {
          throw new Error(updatePayloadResult?.message || 'Pregnancy diary update failed')
        }

        for (const diaryImageId of existingImageIdsToReplace) {
          await deleteDiaryImageById(diaryImageId)
        }
      } else {
        const createPayload = { ...basePayload }

        if (uploadedImage) {
          createPayload.images = [uploadedImage]
        }

        const createResponse = await fetch(`${API_BASE_URL}/api/pregnancy-diaries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPayload),
        })

        if (!createResponse.ok) {
          throw new Error(await getApiErrorMessage(createResponse, `Pregnancy diary create failed: ${createResponse.status}`))
        }

        const createPayloadResult = await createResponse.json()

        if (createPayloadResult?.success === false) {
          throw new Error(createPayloadResult?.message || 'Pregnancy diary create failed')
        }
      }

      setStatusMessage(isEditMode ? '임신일기를 수정했어요.' : '임신일기를 등록했어요.')
      onSuccess?.()
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : '저장에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pregnancy-diary-write-screen">
      <div className="pregnancy-diary-write-body">
        <button type="button" className="pregnancy-diary-write-back" aria-label="뒤로가기" onClick={onBack}>
          <BackIcon />
        </button>

        <section className="pregnancy-diary-write-card">
          <div className="pregnancy-diary-write-top">
            <span className="pregnancy-diary-write-heart" aria-hidden="true">
              <img src={diaryHeartIcon} alt="" className="pregnancy-diary-write-heart-icon" />
            </span>
            <strong>{diaryOwnerLabel}</strong>
            <span className="pregnancy-diary-write-dot" aria-hidden="true" />
          </div>

          <label className="pregnancy-diary-write-media pregnancy-diary-write-media-button">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="pregnancy-diary-write-preview" />
            ) : (
              <>
                <MediaIcon />
                <span className="pregnancy-diary-write-media-text">이미지 추가</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="pregnancy-diary-write-media-input"
              onChange={handleFileChange}
            />
          </label>

          <div className="pregnancy-diary-write-copy">
            <input
              type="text"
              className="pregnancy-diary-write-title-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력하세요"
              aria-label="일기 제목"
            />
            <span>{diaryDateLabel}</span>
            <textarea
              className="pregnancy-diary-write-content-input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={'기록하고 싶은 오늘의 마음과 순간을 적어보세요.\n아기와 함께한 하루를 편하게 꺼내보세요.'}
              aria-label="일기 내용"
            />

            {isEditMode && existingImages.length && !selectedFile ? (
              <div className="pregnancy-diary-write-existing-images">
                {existingImages.map((image) => (
                  <div key={image.id || image.url} className="pregnancy-diary-write-existing-image-item">
                    <img src={image.url} alt="" className="pregnancy-diary-write-existing-image" />
                    {image.id ? (
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

            {statusMessage ? <p className="pregnancy-diary-write-status">{statusMessage}</p> : null}
          </div>

          <div className="pregnancy-diary-write-actions">
            <button type="button" className="pregnancy-diary-write-cancel" onClick={onBack} disabled={isSubmitting}>
              작성취소
            </button>
            <button
              type="button"
              className="pregnancy-diary-write-submit"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? (isEditMode ? '수정중' : '저장중') : isEditMode ? '수정하기' : '등록하기'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PregnancyDiaryWriteScreen
