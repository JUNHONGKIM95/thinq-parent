export const SCHEDULE_TYPE_OPTIONS = [
  { key: 'baby', label: '아기', color: '#ff3b3b', textColor: '#ffffff' },
  { key: 'family', label: '가족', color: '#8fbc69', textColor: '#ffffff' },
  { key: 'work', label: '일', color: '#7478a8', textColor: '#ffffff' },
  { key: 'personal', label: '개인', color: '#fef19f', textColor: '#000000' },
  { key: 'important', label: '중요', color: '#2e2e2e', textColor: '#ffffff' },
  { key: 'etc', label: '기타', color: '#b285bb', textColor: '#ffffff' },
]

export const DEFAULT_SCHEDULE_FORM = {
  title: '',
  typeKey: 'baby',
  hour: '',
  minute: '',
  period: 'am',
  memo: '',
}

function normalizeTimePart(rawValue, maxValue) {
  const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 2)

  if (!digitsOnly) {
    return ''
  }

  const numericValue = Number(digitsOnly)
  return String(Math.min(numericValue, maxValue))
}

function ScheduleInputSheet({ open, form, onFormChange, onClose, onSave }) {
  if (!open) {
    return null
  }

  return (
    <div className="parent-schedule-action-overlay" role="presentation" onClick={onClose}>
      <section
        className="parent-schedule-schedule-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="일정 입력"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="parent-schedule-sheet-handle" aria-hidden="true" />

        <div className="parent-schedule-schedule-header">
          <label className="parent-schedule-schedule-title-input">
            <span className="sr-only">일정 제목 입력</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => onFormChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="일정제목입력"
              autoFocus
            />
          </label>
          <button type="button" className="parent-schedule-schedule-save" onClick={onSave}>
            저장
          </button>
        </div>

        <div className="parent-schedule-form-section">
          <span className="parent-schedule-form-label">일정 유형</span>
          <div className="parent-schedule-type-grid">
            {SCHEDULE_TYPE_OPTIONS.map((option) => {
              const isSelected = form.typeKey === option.key

              return (
                <button
                  key={option.key}
                  type="button"
                  className="parent-schedule-type-button"
                  style={{
                    background: option.color,
                    color: option.textColor,
                    opacity: form.typeKey && !isSelected ? 0.6 : 1,
                  }}
                  onClick={() => onFormChange((prev) => ({ ...prev, typeKey: option.key }))}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="parent-schedule-form-section">
          <span className="parent-schedule-form-label">일정 시간</span>
          <div className="parent-schedule-time-row">
            <div className="parent-schedule-time-box">
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={form.hour}
                placeholder="00"
                onChange={(event) => {
                  const normalizedHour = normalizeTimePart(event.target.value, 23)

                  onFormChange((prev) => ({
                    ...prev,
                    hour: normalizedHour,
                    period: normalizedHour && Number(normalizedHour) >= 12 ? 'pm' : 'am',
                  }))
                }}
                onBlur={() =>
                  onFormChange((prev) => ({
                    ...prev,
                    hour: prev.hour ? prev.hour.padStart(2, '0') : '',
                  }))
                }
                onFocus={(event) => event.target.select()}
                aria-label="시"
              />
              <span className="parent-schedule-time-divider" aria-hidden="true" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={form.minute}
                placeholder="00"
                onChange={(event) =>
                  onFormChange((prev) => ({
                    ...prev,
                    minute: normalizeTimePart(event.target.value, 59),
                  }))
                }
                onBlur={() =>
                  onFormChange((prev) => ({
                    ...prev,
                    minute: prev.minute ? prev.minute.padStart(2, '0') : '',
                  }))
                }
                onFocus={(event) => event.target.select()}
                aria-label="분"
              />
            </div>
            <div className="parent-schedule-period-buttons">
              <button
                type="button"
                className={`parent-schedule-period-button ${form.period === 'am' ? 'is-selected is-am' : ''}`}
                onClick={() => onFormChange((prev) => ({ ...prev, period: 'am' }))}
              >
                오전
              </button>
              <button
                type="button"
                className={`parent-schedule-period-button ${form.period === 'pm' ? 'is-selected is-pm' : ''}`}
                onClick={() => onFormChange((prev) => ({ ...prev, period: 'pm' }))}
              >
                오후
              </button>
            </div>
          </div>
        </div>

        <div className="parent-schedule-form-section is-memo">
          <span className="parent-schedule-form-label">메모</span>
          <textarea
            className="parent-schedule-memo-input"
            value={form.memo}
            onChange={(event) => onFormChange((prev) => ({ ...prev, memo: event.target.value }))}
          />
        </div>
      </section>
    </div>
  )
}

export default ScheduleInputSheet
