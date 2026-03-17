package com.example.thinq_parent.cheermessage.repository;

import com.example.thinq_parent.cheermessage.domain.CheerMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheerMessageRepository extends JpaRepository<CheerMessage, Integer> {

	Optional<CheerMessage> findFirstByGroupIdOrderByCreatedAtDesc(Integer groupId);
}
