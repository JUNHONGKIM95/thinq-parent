package com.example.thinq_parent.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DatabaseHealthService {

	private final JdbcTemplate jdbcTemplate;

	public DatabaseHealthService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public Map<String, String> check() {
		String databaseName = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
		return Map.of(
				"status", "UP",
				"database", databaseName == null ? "unknown" : databaseName
		);
	}
}
