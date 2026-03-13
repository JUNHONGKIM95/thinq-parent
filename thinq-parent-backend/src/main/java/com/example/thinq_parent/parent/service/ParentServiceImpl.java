package com.example.thinq_parent.parent.service;

import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.parent.domain.ParentAccount;
import com.example.thinq_parent.parent.dto.ParentCreateRequest;
import com.example.thinq_parent.parent.dto.ParentResponse;
import com.example.thinq_parent.parent.dto.ParentUpdateRequest;
import com.example.thinq_parent.parent.repository.ParentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ParentServiceImpl implements ParentService {

	private final ParentRepository parentRepository;

	public ParentServiceImpl(ParentRepository parentRepository) {
		this.parentRepository = parentRepository;
	}

	@Override
	@Transactional
	public ParentResponse create(ParentCreateRequest request) {
		ParentAccount parentAccount = new ParentAccount(
				request.parentName(),
				request.email(),
				request.phoneNumber(),
				request.childName(),
				request.relationship()
		);

		return ParentResponse.from(parentRepository.save(parentAccount));
	}

	@Override
	public List<ParentResponse> findAll() {
		return parentRepository.findAll()
				.stream()
				.map(ParentResponse::from)
				.toList();
	}

	@Override
	public ParentResponse findById(Long id) {
		return ParentResponse.from(getParentById(id));
	}

	@Override
	@Transactional
	public ParentResponse update(Long id, ParentUpdateRequest request) {
		ParentAccount parentAccount = getParentById(id);
		parentAccount.update(
				request.parentName(),
				request.email(),
				request.phoneNumber(),
				request.childName(),
				request.relationship()
		);

		return ParentResponse.from(parentAccount);
	}

	@Override
	@Transactional
	public void delete(Long id) {
		ParentAccount parentAccount = getParentById(id);
		parentRepository.delete(parentAccount);
	}

	private ParentAccount getParentById(Long id) {
		return parentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Parent not found. id=" + id));
	}
}
