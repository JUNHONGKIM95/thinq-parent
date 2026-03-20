package com.example.thinq_parent.mylist.repository;

import com.example.thinq_parent.mylist.domain.MyListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MyListRepository extends JpaRepository<MyListItem, Integer> {

	List<MyListItem> findByGroupIdOrderByCreatedAtDesc(Integer groupId);

	List<MyListItem> findByGroupIdAndMyListDateOrderByCreatedAtDesc(Integer groupId, LocalDate myListDate);
}
