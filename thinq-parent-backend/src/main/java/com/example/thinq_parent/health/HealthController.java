package com.example.thinq_parent.health;

import com.example.thinq_parent.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Application and database health check APIs")
public class HealthController {

	private final DatabaseHealthService databaseHealthService;

	public HealthController(DatabaseHealthService databaseHealthService) {
		this.databaseHealthService = databaseHealthService;
	}

	@GetMapping
	@Operation(summary = "Application health", description = "Checks whether the backend application is running")
	public ApiResponse<Map<String, String>> health() {
		return ApiResponse.success("Application is running",
				Map.of("status", "UP", "service", "thinq-parent-backend"));
	}

	@GetMapping("/db")
	@Operation(summary = "Database health", description = "Checks the MySQL connection status")
	public ApiResponse<Map<String, String>> databaseHealth() {
		return ApiResponse.success("Database connection is healthy", databaseHealthService.check());
	}
}
