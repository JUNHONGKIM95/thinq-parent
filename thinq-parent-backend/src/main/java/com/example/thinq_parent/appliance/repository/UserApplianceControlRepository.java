package com.example.thinq_parent.appliance.repository;

import com.example.thinq_parent.appliance.domain.UserApplianceControl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserApplianceControlRepository extends JpaRepository<UserApplianceControl, Long> {

	List<UserApplianceControl> findByUserIdOrderByApplianceMasterIdAsc(Integer userId);

	Optional<UserApplianceControl> findByUserApplianceControlIdAndUserId(Long userApplianceControlId, Integer userId);

	boolean existsByUserId(Integer userId);

	void deleteByUserId(Integer userId);
}
