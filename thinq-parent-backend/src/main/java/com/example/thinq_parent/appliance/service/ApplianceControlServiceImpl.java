package com.example.thinq_parent.appliance.service;

import com.example.thinq_parent.appliance.domain.ApplianceMaster;
import com.example.thinq_parent.appliance.domain.RoutineAction;
import com.example.thinq_parent.appliance.domain.RoutineMaster;
import com.example.thinq_parent.appliance.domain.UserApplianceControl;
import com.example.thinq_parent.appliance.dto.AlertSoundUpdateRequest;
import com.example.thinq_parent.appliance.dto.ApplianceControlResponse;
import com.example.thinq_parent.appliance.dto.ApplianceControlSetupRequest;
import com.example.thinq_parent.appliance.dto.RoutineActivationRequest;
import com.example.thinq_parent.appliance.dto.RoutineResponse;
import com.example.thinq_parent.appliance.repository.ApplianceMasterRepository;
import com.example.thinq_parent.appliance.repository.RoutineActionRepository;
import com.example.thinq_parent.appliance.repository.RoutineMasterRepository;
import com.example.thinq_parent.appliance.repository.UserApplianceControlRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ApplianceControlServiceImpl implements ApplianceControlService {

	private final ApplianceMasterRepository applianceMasterRepository;
	private final RoutineMasterRepository routineMasterRepository;
	private final RoutineActionRepository routineActionRepository;
	private final UserApplianceControlRepository userApplianceControlRepository;

	public ApplianceControlServiceImpl(
			ApplianceMasterRepository applianceMasterRepository,
			RoutineMasterRepository routineMasterRepository,
			RoutineActionRepository routineActionRepository,
			UserApplianceControlRepository userApplianceControlRepository
	) {
		this.applianceMasterRepository = applianceMasterRepository;
		this.routineMasterRepository = routineMasterRepository;
		this.routineActionRepository = routineActionRepository;
		this.userApplianceControlRepository = userApplianceControlRepository;
	}

	@Override
	@Transactional
	public List<ApplianceControlResponse> setupControls(Integer userId, ApplianceControlSetupRequest request) {
		RoutineMaster routine = routineMasterRepository.findById(request.routineId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 루틴입니다: " + request.routineId()));

		List<ApplianceMaster> appliances = applianceMasterRepository.findAll();
		if (appliances.isEmpty()) {
			throw new IllegalStateException("등록된 가전 마스터가 없습니다.");
		}

		// 이미 등록된 사용자면 에러 (루틴 변경은 PATCH /routine 사용)
		List<UserApplianceControl> existing = userApplianceControlRepository.findByUserIdOrderByApplianceMasterIdAsc(userId);
		if (!existing.isEmpty()) {
			throw new IllegalStateException("이미 가전 제어가 등록되어 있습니다. 루틴 변경은 PATCH /routine을 사용하세요.");
		}

		// 신규: 4개 가전에 대해 제어 레코드 생성 (루틴 활성화 상태로)
		List<UserApplianceControl> controls = new ArrayList<>();
		for (ApplianceMaster appliance : appliances) {
			UserApplianceControl control = new UserApplianceControl(
					userId, appliance.getApplianceMasterId(), routine.getRoutineId()
			);
			controls.add(control);
		}
		userApplianceControlRepository.saveAll(controls);

		return buildResponses(controls);
	}

	@Override
	@Transactional
	public List<ApplianceControlResponse> changeRoutine(Integer userId, ApplianceControlSetupRequest request) {
		RoutineMaster routine = routineMasterRepository.findById(request.routineId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 루틴입니다: " + request.routineId()));

		List<UserApplianceControl> controls = userApplianceControlRepository.findByUserIdOrderByApplianceMasterIdAsc(userId);
		if (controls.isEmpty()) {
			throw new IllegalArgumentException("등록된 가전 제어 정보가 없습니다. 먼저 POST로 초기 설정을 해주세요.");
		}

		for (UserApplianceControl control : controls) {
			control.updateRoutine(routine.getRoutineId());
			control.updateRoutineActivated(true);
		}

		return buildResponses(controls);
	}

	@Override
	public List<ApplianceControlResponse> getControls(Integer userId) {
		List<UserApplianceControl> controls = userApplianceControlRepository.findByUserIdOrderByApplianceMasterIdAsc(userId);
		if (controls.isEmpty()) {
			return List.of();
		}
		return buildResponses(controls);
	}

	@Override
	public ApplianceControlResponse getControl(Integer userId, Long userApplianceControlId) {
		UserApplianceControl control = userApplianceControlRepository
				.findByUserApplianceControlIdAndUserId(userApplianceControlId, userId)
				.orElseThrow(() -> new IllegalArgumentException("해당 가전 제어 정보를 찾을 수 없습니다."));

		return buildResponse(control);
	}

	@Override
	@Transactional
	public ApplianceControlResponse updateAlertSound(Integer userId, Long userApplianceControlId, AlertSoundUpdateRequest request) {
		UserApplianceControl control = userApplianceControlRepository
				.findByUserApplianceControlIdAndUserId(userApplianceControlId, userId)
				.orElseThrow(() -> new IllegalArgumentException("해당 가전 제어 정보를 찾을 수 없습니다."));

		control.updateAlertSound(request.enabled());

		return buildResponse(control);
	}

	@Override
	@Transactional
	public List<ApplianceControlResponse> updateAlertSoundAll(Integer userId, AlertSoundUpdateRequest request) {
		List<UserApplianceControl> controls = userApplianceControlRepository.findByUserIdOrderByApplianceMasterIdAsc(userId);
		if (controls.isEmpty()) {
			throw new IllegalArgumentException("등록된 가전 제어 정보가 없습니다. 먼저 루틴을 선택해주세요.");
		}

		for (UserApplianceControl control : controls) {
			control.updateAlertSound(request.enabled());
		}

		return buildResponses(controls);
	}

	@Override
	@Transactional
	public List<ApplianceControlResponse> updateRoutineActivation(Integer userId, RoutineActivationRequest request) {
		List<UserApplianceControl> controls = userApplianceControlRepository.findByUserIdOrderByApplianceMasterIdAsc(userId);
		if (controls.isEmpty()) {
			throw new IllegalArgumentException("등록된 가전 제어 정보가 없습니다. 먼저 루틴을 선택해주세요.");
		}

		for (UserApplianceControl control : controls) {
			control.updateRoutineActivated(request.activated());
		}

		return buildResponses(controls);
	}

	@Override
	public List<RoutineResponse> getRoutines() {
		List<RoutineMaster> routines = routineMasterRepository.findAllByOrderByRoutineIdAsc();
		Map<Long, ApplianceMaster> applianceMap = applianceMasterRepository.findAll().stream()
				.collect(Collectors.toMap(ApplianceMaster::getApplianceMasterId, Function.identity()));

		return routines.stream().map(routine -> {
			List<RoutineAction> actions = routineActionRepository.findByRoutineIdOrderBySequenceNoAsc(routine.getRoutineId());

			List<RoutineResponse.ActionItem> actionItems = actions.stream().map(action -> {
				ApplianceMaster appliance = applianceMap.get(action.getApplianceMasterId());
				return new RoutineResponse.ActionItem(
						action.getRoutineActionId(),
						action.getSequenceNo(),
						appliance != null ? appliance.getApplianceCode() : null,
						appliance != null ? appliance.getApplianceName() : null,
						action.getActionTitle(),
						action.getActionDescription(),
						action.getTargetPowerState(),
						action.getTargetMode(),
						action.getTargetAlertSound()
				);
			}).toList();

			return new RoutineResponse(
					routine.getRoutineId(),
					routine.getRoutineCode(),
					routine.getPregnancyStage(),
					routine.getRoutineName(),
					routine.getRoutineSubtitle(),
					routine.getRoutineDescription(),
					routine.getRoutineDetailDescription(),
					actionItems
			);
		}).toList();
	}

	private List<ApplianceControlResponse> buildResponses(List<UserApplianceControl> controls) {
		return controls.stream().map(this::buildResponse).toList();
	}

	private ApplianceControlResponse buildResponse(UserApplianceControl control) {
		ApplianceMaster appliance = applianceMasterRepository.findById(control.getApplianceMasterId())
				.orElse(null);
		RoutineMaster routine = routineMasterRepository.findById(control.getRoutineId())
				.orElse(null);

		ApplianceControlResponse.RoutineActionInfo actionInfo = null;
		if (routine != null) {
			List<RoutineAction> actions = routineActionRepository.findByRoutineIdOrderBySequenceNoAsc(routine.getRoutineId());
			RoutineAction matchingAction = actions.stream()
					.filter(a -> a.getApplianceMasterId().equals(control.getApplianceMasterId()))
					.findFirst()
					.orElse(null);

			if (matchingAction != null) {
				actionInfo = new ApplianceControlResponse.RoutineActionInfo(
						matchingAction.getRoutineActionId(),
						matchingAction.getSequenceNo(),
						matchingAction.getActionTitle(),
						matchingAction.getActionDescription(),
						matchingAction.getTargetPowerState(),
						matchingAction.getTargetMode(),
						matchingAction.getTargetAlertSound()
				);
			}
		}

		return new ApplianceControlResponse(
				control.getUserApplianceControlId(),
				control.getApplianceMasterId(),
				appliance != null ? appliance.getApplianceCode() : null,
				appliance != null ? appliance.getApplianceName() : null,
				appliance != null ? appliance.getApplianceDescription() : null,
				control.getRoutineId(),
				routine != null ? routine.getRoutineCode() : null,
				routine != null ? routine.getPregnancyStage() : null,
				routine != null ? routine.getRoutineName() : null,
				control.getRoutineActivated(),
				control.getAlertSoundEnabled(),
				actionInfo,
				control.getCreatedAt(),
				control.getUpdatedAt()
		);
	}
}
