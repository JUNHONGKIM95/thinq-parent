package com.example.thinq_parent.mylist.service;

import com.example.thinq_parent.mylist.dto.MyListCreateRequest;
import com.example.thinq_parent.mylist.dto.MyListCheckYnUpdateRequest;
import com.example.thinq_parent.mylist.dto.MyListResponse;
import com.example.thinq_parent.mylist.dto.MyListTitleUpdateRequest;

import java.time.LocalDate;
import java.util.List;

public interface MyListService {

	MyListResponse create(Integer userId, MyListCreateRequest request);

	List<MyListResponse> findByGroupId(Integer groupId);

	List<MyListResponse> findByGroupIdAndDate(Integer groupId, LocalDate date);

	MyListResponse updateTitle(Integer myListId, MyListTitleUpdateRequest request);

	MyListResponse updateCheckYn(Integer myListId, MyListCheckYnUpdateRequest request);

	void delete(Integer myListId);
}
