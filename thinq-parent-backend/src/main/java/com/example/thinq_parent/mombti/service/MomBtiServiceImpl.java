package com.example.thinq_parent.mombti.service;

import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.mombti.domain.MomBtiAnswer;
import com.example.thinq_parent.mombti.domain.MomBtiChoice;
import com.example.thinq_parent.mombti.domain.MomBtiQuestion;
import com.example.thinq_parent.mombti.domain.MomBtiResultProfile;
import com.example.thinq_parent.mombti.domain.MomBtiTestAttempt;
import com.example.thinq_parent.mombti.dto.MomBtiAnswerItemRequest;
import com.example.thinq_parent.mombti.dto.MomBtiAnswerSubmitRequest;
import com.example.thinq_parent.mombti.dto.MomBtiAnswerSubmitResponse;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptCreateRequest;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptCreateResponse;
import com.example.thinq_parent.mombti.dto.MomBtiAttemptResponse;
import com.example.thinq_parent.mombti.dto.MomBtiChoiceResponse;
import com.example.thinq_parent.mombti.dto.MomBtiQuestionResponse;
import com.example.thinq_parent.mombti.dto.MomBtiResultProfileResponse;
import com.example.thinq_parent.mombti.dto.MomBtiScoreResponse;
import com.example.thinq_parent.mombti.repository.MomBtiAnswerRepository;
import com.example.thinq_parent.mombti.repository.MomBtiChoiceRepository;
import com.example.thinq_parent.mombti.repository.MomBtiQuestionRepository;
import com.example.thinq_parent.mombti.repository.MomBtiResultProfileRepository;
import com.example.thinq_parent.mombti.repository.MomBtiTestAttemptRepository;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MomBtiServiceImpl implements MomBtiService {

	private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
	private static final Set<String> VALID_TRAITS = Set.of("P", "R", "T", "F", "I", "C", "E", "M");

	private final MomBtiQuestionRepository questionRepository;
	private final MomBtiChoiceRepository choiceRepository;
	private final MomBtiResultProfileRepository resultProfileRepository;
	private final MomBtiTestAttemptRepository testAttemptRepository;
	private final MomBtiAnswerRepository answerRepository;
	private final UserRepository userRepository;

	public MomBtiServiceImpl(
			MomBtiQuestionRepository questionRepository,
			MomBtiChoiceRepository choiceRepository,
			MomBtiResultProfileRepository resultProfileRepository,
			MomBtiTestAttemptRepository testAttemptRepository,
			MomBtiAnswerRepository answerRepository,
			UserRepository userRepository
	) {
		this.questionRepository = questionRepository;
		this.choiceRepository = choiceRepository;
		this.resultProfileRepository = resultProfileRepository;
		this.testAttemptRepository = testAttemptRepository;
		this.answerRepository = answerRepository;
		this.userRepository = userRepository;
	}

	@Override
	public List<MomBtiQuestionResponse> getQuestions() {
		List<MomBtiQuestion> questions = getActiveQuestions();
		Map<Integer, List<MomBtiChoiceResponse>> choicesByQuestionId = choiceRepository
				.findByQuestionIdInOrderByQuestionIdAscDisplayOrderAsc(
						questions.stream().map(MomBtiQuestion::getQuestionId).toList()
				).stream()
				.collect(Collectors.groupingBy(
						MomBtiChoice::getQuestionId,
						Collectors.mapping(
								choice -> new MomBtiChoiceResponse(
										choice.getChoiceId(),
										choice.getChoiceText(),
										choice.getDisplayOrder()
								),
								Collectors.toList()
						)
				));

		return questions.stream()
				.map(question -> new MomBtiQuestionResponse(
						question.getQuestionId(),
						question.getQuestionText(),
						question.getDimension(),
						question.getDisplayOrder(),
						choicesByQuestionId.getOrDefault(question.getQuestionId(), List.of())
				))
				.toList();
	}

	@Override
	@Transactional
	public MomBtiAttemptCreateResponse createAttempt(MomBtiAttemptCreateRequest request) {
		validateUser(request.userId());
		MomBtiTestAttempt attempt = testAttemptRepository.save(
				new MomBtiTestAttempt(request.userId(), STATUS_IN_PROGRESS, LocalDateTime.now())
		);
		return new MomBtiAttemptCreateResponse(
				attempt.getAttemptId(),
				attempt.getUserId(),
				attempt.getStatus(),
				attempt.getStartedAt()
		);
	}

	@Override
	@Transactional
	public MomBtiAnswerSubmitResponse submitAnswers(Integer attemptId, MomBtiAnswerSubmitRequest request) {
		MomBtiTestAttempt attempt = getAttemptEntity(attemptId);
		validateAttemptInProgress(attempt);
		validateNoDuplicateQuestions(request.answers());

		Map<Integer, MomBtiQuestion> questionMap = getActiveQuestions()
				.stream()
				.collect(Collectors.toMap(MomBtiQuestion::getQuestionId, Function.identity()));
		Map<Integer, MomBtiChoice> choiceMap = choiceRepository.findAllById(
				request.answers().stream().map(MomBtiAnswerItemRequest::choiceId).toList()
		).stream().collect(Collectors.toMap(MomBtiChoice::getChoiceId, Function.identity()));

		answerRepository.deleteByAttemptId(attemptId);

		List<MomBtiAnswer> answers = new ArrayList<>();
		for (MomBtiAnswerItemRequest item : request.answers()) {
			MomBtiQuestion question = questionMap.get(item.questionId());
			if (question == null) {
				throw new InvalidRequestException("Only active MomBTI questions can be answered. questionId=" + item.questionId());
			}
			MomBtiChoice choice = choiceMap.get(item.choiceId());
			if (choice == null) {
				throw new ResourceNotFoundException("Choice not found. choiceId=" + item.choiceId());
			}
			if (!choice.getQuestionId().equals(question.getQuestionId())) {
				throw new InvalidRequestException("choiceId does not belong to questionId. questionId=" + item.questionId());
			}
			answers.add(new MomBtiAnswer(
					attemptId,
					question.getQuestionId(),
					choice.getChoiceId(),
					choice.getTargetTrait() == null ? "" : choice.getTargetTrait(),
					choice.getScoreValue()
			));
		}

		answerRepository.saveAll(answers);
		return new MomBtiAnswerSubmitResponse(attemptId, answers.size(), attempt.getStatus());
	}

	@Override
	@Transactional
	public MomBtiAttemptResponse completeAttempt(Integer attemptId) {
		MomBtiTestAttempt attempt = getAttemptEntity(attemptId);
		validateAttemptInProgress(attempt);

		List<MomBtiQuestion> activeQuestions = getActiveQuestions();
		List<MomBtiAnswer> answers = answerRepository.findByAttemptIdOrderByAnswerIdAsc(attemptId);
		validateAllQuestionsAnswered(activeQuestions, answers);

		Map<String, Integer> scores = initializeScores();
		for (MomBtiAnswer answer : answers) {
			String trait = normalizeTrait(answer.getTargetTrait());
			if (trait != null) {
				scores.compute(trait, (key, value) -> value + answer.getScoreValue());
			}
		}

		String resultType = buildResultType(scores);
		resultProfileRepository.findById(resultType)
				.orElseThrow(() -> new ResourceNotFoundException("MomBTI result profile not found. resultType=" + resultType));

		attempt.complete(
				resultType,
				scores.get("P"),
				scores.get("R"),
				scores.get("T"),
				scores.get("F"),
				scores.get("I"),
				scores.get("C"),
				scores.get("E"),
				scores.get("M"),
				LocalDateTime.now()
		);

		return toAttemptResponse(attempt);
	}

	@Override
	public MomBtiAttemptResponse getLatestAttempt(Integer userId) {
		validateUser(userId);
		MomBtiTestAttempt attempt = testAttemptRepository
				.findFirstByUserIdAndStatusOrderByCompletedAtDescCreatedAtDesc(userId, "COMPLETED")
				.orElseThrow(() -> new ResourceNotFoundException("완료된 MomBTI 검사가 없습니다. userId=" + userId));
		return toAttemptResponse(attempt);
	}

	@Override
	public MomBtiAttemptResponse getAttempt(Integer attemptId) {
		return toAttemptResponse(getAttemptEntity(attemptId));
	}

	@Override
	public MomBtiResultProfileResponse getResultProfile(String resultType) {
		return toProfileResponse(resultProfileRepository.findById(resultType)
				.orElseThrow(() -> new ResourceNotFoundException("MomBTI result profile not found. resultType=" + resultType)));
	}

	private void validateUser(Integer userId) {
		if (!userRepository.existsById(userId)) {
			throw new ResourceNotFoundException("User not found. userId=" + userId);
		}
	}

	private MomBtiTestAttempt getAttemptEntity(Integer attemptId) {
		return testAttemptRepository.findById(attemptId)
				.orElseThrow(() -> new ResourceNotFoundException("MomBTI attempt not found. attemptId=" + attemptId));
	}

	private void validateAttemptInProgress(MomBtiTestAttempt attempt) {
		if (!STATUS_IN_PROGRESS.equals(attempt.getStatus())) {
			throw new InvalidRequestException("MomBTI attempt is already completed. attemptId=" + attempt.getAttemptId());
		}
	}

	private void validateNoDuplicateQuestions(List<MomBtiAnswerItemRequest> answers) {
		Set<Integer> seen = new HashSet<>();
		for (MomBtiAnswerItemRequest answer : answers) {
			if (!seen.add(answer.questionId())) {
				throw new InvalidRequestException("Duplicate answers for the same question are not allowed. questionId=" + answer.questionId());
			}
		}
	}

	private void validateAllQuestionsAnswered(List<MomBtiQuestion> activeQuestions, List<MomBtiAnswer> answers) {
		if (activeQuestions.isEmpty()) {
			throw new InvalidRequestException("No active MomBTI questions are configured.");
		}
		Set<Integer> answeredQuestionIds = answers.stream()
				.map(MomBtiAnswer::getQuestionId)
				.collect(Collectors.toSet());
		List<Integer> missingQuestionIds = activeQuestions.stream()
				.map(MomBtiQuestion::getQuestionId)
				.filter(questionId -> !answeredQuestionIds.contains(questionId))
				.toList();
		if (!missingQuestionIds.isEmpty()) {
			throw new InvalidRequestException("All active MomBTI questions must be answered before completion. missingQuestionIds=" + missingQuestionIds);
		}
	}

	private Map<String, Integer> initializeScores() {
		Map<String, Integer> scores = new HashMap<>();
		for (String trait : VALID_TRAITS) {
			scores.put(trait, 0);
		}
		return scores;
	}

	private String normalizeTrait(String trait) {
		if (trait == null) {
			return null;
		}
		String normalized = trait.trim().toUpperCase();
		if (normalized.isEmpty()) {
			return null;
		}
		if (!VALID_TRAITS.contains(normalized)) {
			throw new InvalidRequestException("Invalid target_trait stored in MomBTI answer: " + normalized);
		}
		return normalized;
	}

	private String buildResultType(Map<String, Integer> scores) {
		String pr = scores.get("P") >= scores.get("R") ? "P" : "R";
		String tf = scores.get("T") >= scores.get("F") ? "T" : "F";
		String ic = scores.get("I") >= scores.get("C") ? "I" : "C";
		String em = scores.get("E") >= scores.get("M") ? "E" : "M";
		return pr + tf + ic + em;
	}

	private MomBtiAttemptResponse toAttemptResponse(MomBtiTestAttempt attempt) {
		MomBtiResultProfileResponse profile = null;
		if (attempt.getResultType() != null) {
			profile = resultProfileRepository.findById(attempt.getResultType())
					.map(this::toProfileResponse)
					.orElse(null);
		}

		return new MomBtiAttemptResponse(
				attempt.getAttemptId(),
				attempt.getUserId(),
				attempt.getStatus(),
				attempt.getResultType(),
				attempt.getStartedAt(),
				attempt.getCompletedAt(),
				attempt.getCreatedAt(),
				new MomBtiScoreResponse(
						attempt.getScoreP(),
						attempt.getScoreR(),
						attempt.getScoreT(),
						attempt.getScoreF(),
						attempt.getScoreI(),
						attempt.getScoreC(),
						attempt.getScoreE(),
						attempt.getScoreM()
				),
				profile
		);
	}

	private MomBtiResultProfileResponse toProfileResponse(MomBtiResultProfile profile) {
		return new MomBtiResultProfileResponse(
				profile.getResultType(),
				profile.getTitle(),
				profile.getSubtitle(),
				profile.getSummary(),
				profile.getContent(),
				profile.getImageUrl()
		);
	}

	private List<MomBtiQuestion> getActiveQuestions() {
		return questionRepository.findAllByOrderByDisplayOrderAsc()
				.stream()
				.filter(this::isActiveQuestion)
				.toList();
	}

	private boolean isActiveQuestion(MomBtiQuestion question) {
		if (question.getIsActive() == null) {
			return false;
		}
		return question.getIsActive() == 'Y' || question.getIsActive() == '1';
	}
}
