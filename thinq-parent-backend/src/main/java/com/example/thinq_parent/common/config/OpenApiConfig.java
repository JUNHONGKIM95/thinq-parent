package com.example.thinq_parent.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI thinqParentOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("thinq-parent Backend API")
						.description("thinq-parent REST API documentation")
						.version("v1")
						.contact(new Contact()
								.name("thinq-parent")
								.email("dev@thinq-parent.local"))
						.license(new License()
								.name("Internal Use")
								.url("https://example.com/internal")));
	}

	@Bean
	public GroupedOpenApi publicApi() {
		return GroupedOpenApi.builder()
				.group("v1")
				.pathsToMatch("/api/v1/**")
				.build();
	}

	@Bean
	public GroupedOpenApi applianceControlApi() {
		return GroupedOpenApi.builder()
				.group("appliance-control")
				.pathsToMatch("/api/appliance-controls/**")
				.build();
	}
}
