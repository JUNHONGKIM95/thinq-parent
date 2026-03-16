package com.example.thinq_parent.health;

import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

@Service
public class DatabaseHealthService {

	private final DataSource dataSource;

	public DatabaseHealthService(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	public Map<String, String> check() {
		try (Connection connection = dataSource.getConnection()) {
			String databaseName = connection.getCatalog();
			String productName = connection.getMetaData().getDatabaseProductName();

			// JDBC 메타데이터를 사용하면 MySQL/Postgres 전환 후에도 같은 헬스체크를 유지할 수 있다.
			return Map.of(
					"status", "UP",
					"database", databaseName == null ? "unknown" : databaseName,
					"product", productName == null ? "unknown" : productName
			);
		} catch (SQLException exception) {
			throw new IllegalStateException("Failed to check database connection", exception);
		}
	}
}
