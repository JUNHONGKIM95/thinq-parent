package com.example.thinq_parent.pregnancydiary.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record PregnancyDiaryCreateRequest(
		@NotNull(message = "authorUserId is required")
		Integer authorUserId,
		@NotBlank(message = "title is required")
		@Size(max = 200, message = "title must be 200 characters or fewer")
		@NoBrokenText
		String title,
		@NotBlank(message = "content is required")
		@NoBrokenText
		String content,
		@NotNull(message = "diaryDate is required")
		LocalDate diaryDate,
		@Valid
		List<PregnancyDiaryImageRequest> images
) {
}
