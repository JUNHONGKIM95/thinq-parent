package com.example.thinq_parent.appliance.repository;

import com.example.thinq_parent.appliance.domain.RoutineMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoutineMasterRepository extends JpaRepository<RoutineMaster, Long> {

	List<RoutineMaster> findAllByOrderByRoutineIdAsc();
}
