import { useEffect, useMemo, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import diaryExampleImage from '@shared-assets/srg/diary_example.svg'
import diaryHeartIcon from '@shared-assets/srg/diary_heart.svg'
import diaryDeleteActionIcon from '@shared-assets/srg/fi-rr-trash.svg'
import diaryMediaIcon from '@shared-assets/srg/in_image.svg'
import { API_BASE_URL } from '../../config/api'
import {
  readCachedDiaryDetail,
  updateCachedDiaryDetail,
  upsertDiaryInCachedLists,
  writeCachedDiaryDetail,
} from './diaryCache'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
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

function extractDiaryId(payload, fallbackId = null) {
  const item = payload?.data?.item ?? payload?.data ?? payload

  if (!item || typeof item !== 'object') {
    return fallbackId
  }

  return item.diaryId ?? item.id ?? item.diary_id ?? fallbackId
}

function normalizeImageForCache(image) {
  const url = getImageUrl(image)

  if (!url) {
    return null
  }

  return {
    id: getImageId(image),
    url,
  }
}

function buildDiaryCacheValue({
  diaryId,
  title,
  content,
  diaryDate,
  authorName,
  authorUserId,
  images,
  isMine = true,
}) {
  if (!diaryId) {
    return null
  }

  const normalizedImages = (Array.isArray(images) ? images : [])
    .map((image) => normalizeImageForCache(image) ?? image)
    .filter((image) => image?.url)

  const primaryImage = normalizedImages[0]?.url ?? ''

  return {
    id: diaryId,
    title,
    content,
    diaryDate,
    authorName: authorName || '',
    authorUserId: authorUserId ?? null,
    isMine: Boolean(isMine),
    thumbnailImageUrl: primaryImage,
    imageUrl: primaryImage,
    thumbnailDiaryImageId: normalizedImages[0]?.id ?? null,
    images: normalizedImages,
  }
}

function buildDiaryListItem(detail) {
  if (!detail?.id) {
    return null
  }

  return {
    id: detail.id,
    image: detail.thumbnailImageUrl || diaryExampleImage,
    imageUrl: detail.thumbnailImageUrl || '',
    date: detail.diaryDate ? detail.diaryDate.replaceAll('-', '/') : '-',
    diaryDate: detail.diaryDate || '',
    author: detail.authorName || '',
    title: detail.title || '',
    content: detail.content || '',
    isMine: Boolean(detail.isMine),
    thumbnailDiaryImageId: detail.thumbnailDiaryImageId ?? null,
  }
}

function PregnancyDiaryWriteScreen({ userId, onBack, onSuccess, babyNickname, role, initialDiary }) {
  const isEditMode = Boolean(initialDiary?.id)
  const initialDiaryDate = initialDiary?.diaryDate || getDateKey(new Date())
  const [title, setTitle] = useState(initialDiary?.title || '')
  const [content, setContent] = useState(initialDiary?.content || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [deletingImageIds, setDeletingImageIds] = useState([])
  const diaryOwnerRoleLabel = role === 'FAMILY' ? '아빠' : '엄마'
  const diaryOwnerLabel = `${babyNickname || '아기'} ${diaryOwnerRoleLabel}`
  const diaryDate = useMemo(() => initialDiaryDate, [initialDiaryDate])
  const diaryDateLabel = useMemo(() => formatDiaryDate(new Date(`${initialDiaryDate}T00:00:00`)), [initialDiaryDate])

  const isSubmitDisabled = isSubmitting || !title.trim() || !content.trim() || !userId

  useEffect(() => {
    const cachedDetail = isEditMode && initialDiary?.id ? readCachedDiaryDetail(userId, initialDiary.id) : null
    const sourceDiary = cachedDetail || initialDiary

    setTitle(sourceDiary?.title || '')
    setContent(sourceDiary?.content || '')
    setSelectedFile(null)
    setStatusMessage('')
    setExistingImages(Array.isArray(sourceDiary?.images) ? sourceDiary.images.map((image) => ({
      id: image?.id ?? image?.diaryImageId ?? image?.imageId ?? null,
      url: image?.url ?? image?.imageUrl ?? '',
    })).filter((image) => image.url) : [])
  }, [initialDiary, isEditMode, userId])

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
        writeCachedDiaryDetail(userId, initialDiary.id, {
          id: initialDiary.id,
          ...detail,
          authorName: initialDiary?.authorName ?? initialDiary?.author ?? '',
          authorUserId: userId,
          isMine: true,
        })
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

      let nextImagesSnapshot = []

      setExistingImages((prev) => {
        nextImagesSnapshot = prev.filter((image) => String(image.id) !== String(diaryImageId))
        return nextImagesSnapshot
      })

      if (initialDiary?.id) {
        updateCachedDiaryDetail(userId, initialDiary.id, (prev) => {
          if (!prev) {
            return prev
          }

          const nextPrimaryImage = nextImagesSnapshot[0]?.url ?? ''

          return {
            ...prev,
            images: nextImagesSnapshot,
            thumbnailImageUrl: nextPrimaryImage,
            imageUrl: nextPrimaryImage,
            thumbnailDiaryImageId: nextImagesSnapshot[0]?.id ?? null,
          }
        })

        const nextDetail = buildDiaryCacheValue({
          diaryId: initialDiary.id,
          title: initialDiary?.title || '',
          content: initialDiary?.content || '',
          diaryDate: initialDiary?.diaryDate || diaryDate,
          authorName: initialDiary?.authorName ?? initialDiary?.author ?? '',
          authorUserId: userId,
          images: nextImagesSnapshot,
        })

        const listItem = buildDiaryListItem(nextDetail)

        if (listItem) {
          upsertDiaryInCachedLists(userId, listItem)
        }
      }
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

      const committedTitle = title.trim()
      const committedContent = content.trim()
      const persistedAuthorName = initialDiary?.authorName ?? initialDiary?.author ?? ''
      const basePayload = {
        authorUserId: userId,
        title: committedTitle,
        content: committedContent,
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

        const nextImages = uploadedImage
          ? [uploadedImage]
          : existingImages

        const nextDetail = buildDiaryCacheValue({
          diaryId: initialDiary.id,
          title: committedTitle,
          content: committedContent,
          diaryDate,
          authorName: persistedAuthorName,
          authorUserId: userId,
          images: nextImages,
        })

        if (nextDetail) {
          writeCachedDiaryDetail(userId, initialDiary.id, nextDetail)

          const listItem = buildDiaryListItem(nextDetail)

          if (listItem) {
            upsertDiaryInCachedLists(userId, listItem)
          }
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

        const createdDiaryId = extractDiaryId(createPayloadResult)
        const nextImages = uploadedImage ? [uploadedImage] : []
        const nextDetail = buildDiaryCacheValue({
          diaryId: createdDiaryId,
          title: committedTitle,
          content: committedContent,
          diaryDate,
          authorName: persistedAuthorName,
          authorUserId: userId,
          images: nextImages,
        })

        if (nextDetail) {
          writeCachedDiaryDetail(userId, createdDiaryId, nextDetail)

          const listItem = buildDiaryListItem(nextDetail)

          if (listItem) {
            upsertDiaryInCachedLists(userId, listItem, { prepend: true })
          }
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

          <label className="pregnancy-diary-write-media">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="pregnancy-diary-write-preview" />
            ) : (
              <>
                <img src={diaryMediaIcon} alt="" className="pregnancy-diary-write-media-icon" aria-hidden="true" />
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
