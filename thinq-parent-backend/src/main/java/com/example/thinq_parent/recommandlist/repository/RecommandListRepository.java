package com.example.thinq_parent.recommandlist.repository;

import com.example.thinq_parent.recommandlist.domain.RecommandList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommandListRepository extends JpaRepository<RecommandList, Integer> {

	List<RecommandList> findByGroupIdAndUserIdAndCurrentWeekOrderByRecommandListIdAsc(Integer groupId, Integer userId, Integer currentWeek);

	Optional<RecommandList> findByGroupIdAndUserIdAndTodoIdAndCurrentWeek(Integer groupId, Integer userId, Integer todoId, Integer currentWeek);
}
