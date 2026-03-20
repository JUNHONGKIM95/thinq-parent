package com.example.thinq_parent.recommandlist.service;

import com.example.thinq_parent.recommandlist.dto.RecommandListCheckYnUpdateRequest;
import com.example.thinq_parent.recommandlist.dto.RecommandListResponse;

import java.util.List;

public interface RecommandListService {

	List<RecommandListResponse> findByUserId(Integer userId);

	RecommandListResponse updateCheckYn(Integer recommandListId, RecommandListCheckYnUpdateRequest request);
}
