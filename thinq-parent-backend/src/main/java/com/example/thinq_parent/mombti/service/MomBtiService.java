package com.example.thinq_parent.mombti.service;

import com.example.thinq_parent.mombti.dto.MomBtiAnswerSubmitRequest;
import com.example.thinq_parent.mombti.dto.MomBtiAnswerSubmitResponse;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptCreateRequest;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptCreateResponse;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptResponse;
import com.example.thinq_parent.mombti.dto.MomBtiQuestionResponse;
import com.example.thinq_parent.mombti.dto.MomBtiResultProfileResponse;

import java.util.List;

public interface MomBtiService {

	List<MomBtiQuestionResponse> getQuestions();

	MomBtiAttemptCreateResponse createAttempt(MomBtiAttemptCreateRequest request);

	MomBtiAnswerSubmitResponse submitAnswers(Integer attemptId, MomBtiAnswerSubmitRequest request);

	MomBtiAttemptResponse completeAttempt(Integer attemptId);

	MomBtiAttemptResponse getLatestAttempt(Integer userId);

	MomBtiAttemptResponse getAttempt(Integer attemptId);

	MomBtiResultProfileResponse getResultProfile(String resultType);
}
