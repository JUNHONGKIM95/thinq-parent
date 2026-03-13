package com.example.thinq_parent.parent.service;

import com.example.thinq_parent.parent.dto.ParentCreateRequest;
import com.example.thinq_parent.parent.dto.ParentResponse;
import com.example.thinq_parent.parent.dto.ParentUpdateRequest;

import java.util.List;

public interface ParentService {

	ParentResponse create(ParentCreateRequest request);

	List<ParentResponse> findAll();

	ParentResponse findById(Long id);

	ParentResponse update(Long id, ParentUpdateRequest request);

	void delete(Long id);
}
