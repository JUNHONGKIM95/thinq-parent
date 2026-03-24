package com.example.thinq_parent.appliance.repository;

import com.example.thinq_parent.appliance.domain.ApplianceMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplianceMasterRepository extends JpaRepository<ApplianceMaster, Long> {
}
