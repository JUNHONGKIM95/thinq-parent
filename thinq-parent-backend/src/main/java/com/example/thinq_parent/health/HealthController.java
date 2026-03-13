package com.example.thinq_parent.health;

import com.example.thinq_parent.common.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

	private final DatabaseHealthService databaseHealthService;

	public HealthController(DatabaseHealthService databaseHealthService) {
		this.databaseHealthService = databaseHealthService;
	}

	@GetMapping
	public ApiResponse<Map<String, String>> health() {
		return ApiResponse.success("Application is running",
				Map.of("status", "UP", "service", "thinq-parent-backend"));
	}

	@GetMapping("/db")
	public ApiResponse<Map<String, String>> databaseHealth() {
		return ApiResponse.success("Database connection is healthy", databaseHealthService.check());
	}
}
