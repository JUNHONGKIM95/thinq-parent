package com.example.thinq_parent.todo.repository;

import com.example.thinq_parent.todo.domain.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Integer> {

	List<Todo> findByTargetWeekOrderByTodoIdAsc(Integer targetWeek);
}
