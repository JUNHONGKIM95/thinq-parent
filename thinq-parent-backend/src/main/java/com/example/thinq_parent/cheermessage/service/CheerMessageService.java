package com.example.thinq_parent.cheermessage.service;

import com.example.thinq_parent.cheermessage.dto.CheerMessageCreateRequest;
import com.example.thinq_parent.cheermessage.dto.CheerMessageResponse;

public interface CheerMessageService {

	CheerMessageResponse create(CheerMessageCreateRequest request);

	CheerMessageResponse findLatestByGroupId(Integer groupId);

	CheerMessageResponse findLatestByUserId(Integer userId);
}
