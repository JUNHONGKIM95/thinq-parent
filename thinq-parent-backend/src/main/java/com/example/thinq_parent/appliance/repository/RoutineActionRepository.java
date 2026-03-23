package com.example.thinq_parent.appliance.repository;

import com.example.thinq_parent.appliance.domain.RoutineAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoutineActionRepository extends JpaRepository<RoutineAction, Long> {

	List<RoutineAction> findByRoutineIdOrderBySequenceNoAsc(Long routineId);
}
