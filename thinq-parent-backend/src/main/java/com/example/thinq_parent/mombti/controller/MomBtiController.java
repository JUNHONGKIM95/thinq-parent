package com.example.thinq_parent.mombti.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.mombti.dto.MomBtiAnswerSubmitRequest;
import com.example.thinq_parent.mombti.dto.MomBtiAnswerSubmitResponse;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptCreateRequest;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptCreateResponse;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptResponse;
import com.example.thinq_parent.mombti.dto.MomBtiQuestionResponse;
import com.example.thinq_parent.mombti.dto.MomBtiResultProfileResponse;
import com.example.thinq_parent.mombti.service.MomBtiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mombti")
@Tag(name = "MomBTI", description = "MomBTI question, answer, and result APIs")
public class MomBtiController {

	private final MomBtiService momBtiService;

	public MomBtiController(MomBtiService momBtiService) {
		this.momBtiService = momBtiService;
	}

	@GetMapping("/questions")
	@Operation(summary = "Get MomBTI questions", description = "Returns active MomBTI questions with their choices ordered for rendering the test screen")
	public ApiResponse<List<MomBtiQuestionResponse>> getQuestions() {
		return ApiResponse.success("MomBTI questions fetched successfully", momBtiService.getQuestions());
	}

	@PostMapping("/attempts")
	@Operation(summary = "Create MomBTI attempt", description = "Creates one IN_PROGRESS MomBTI test attempt for a user")
	@RequestBody(
			description = "Attempt create payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Create attempt",
							value = """
									{
									  "userId": 3
									}
									"""
					)
			)
	)
	public ResponseEntity<ApiResponse<MomBtiAttemptCreateResponse>> createAttempt(
			@Valid @org.springframework.web.bind.annotation.RequestBody MomBtiAttemptCreateRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("MomBTI attempt created successfully", momBtiService.createAttempt(request)));
	}

	@PostMapping("/attempts/{attemptId}/answers")
	@Operation(summary = "Submit MomBTI answers", description = "Replaces all answers for an IN_PROGRESS attempt with the submitted list")
	@RequestBody(
			description = "Answer submit payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Submit answers",
							value = """
									{
									  "answers": [
									    { "questionId": 1, "choiceId": 4 },
									    { "questionId": 2, "choiceId": 8 }
									  ]
									}
									"""
					)
			)
	)
	public ApiResponse<MomBtiAnswerSubmitResponse> submitAnswers(
			@PathVariable Integer attemptId,
			@Valid @org.springframework.web.bind.annotation.RequestBody MomBtiAnswerSubmitRequest request
	) {
		return ApiResponse.success("MomBTI answers submitted successfully", momBtiService.submitAnswers(attemptId, request));
	}

	@PostMapping("/attempts/{attemptId}/complete")
	@Operation(summary = "Complete MomBTI attempt", description = "Validates all active questions are answered, calculates the result, and marks the attempt COMPLETED")
	public ApiResponse<MomBtiAttemptResponse> completeAttempt(@PathVariable Integer attemptId) {
		return ApiResponse.success("MomBTI attempt completed successfully", momBtiService.completeAttempt(attemptId));
	}

	@GetMapping("/attempts/latest")
	@Operation(summary = "Get latest MomBTI attempt", description = "Returns the latest MomBTI attempt for a user")
	public ApiResponse<MomBtiAttemptResponse> getLatestAttempt(@RequestParam Integer userId) {
		return ApiResponse.success("Latest MomBTI attempt fetched successfully", momBtiService.getLatestAttempt(userId));
	}

	@GetMapping("/attempts/{attemptId}")
	@Operation(summary = "Get MomBTI attempt by id", description = "Returns one MomBTI attempt with score fields and result profile if completed")
	public ApiResponse<MomBtiAttemptResponse> getAttempt(@PathVariable Integer attemptId) {
		return ApiResponse.success("MomBTI attempt fetched successfully", momBtiService.getAttempt(attemptId));
	}

	@GetMapping("/result-profiles/{resultType}")
	@Operation(summary = "Get MomBTI result profile", description = "Returns one MomBTI result profile by resultType")
	public ApiResponse<MomBtiResultProfileResponse> getResultProfile(@PathVariable String resultType) {
		return ApiResponse.success("MomBTI result profile fetched successfully", momBtiService.getResultProfile(resultType));
	}
}
