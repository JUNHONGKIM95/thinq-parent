package com.example.thinq_parent.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				// 개발 중 같은 PC와 같은 LAN 대역의 프론트에서 바로 API를 호출할 수 있게 허용한다.
				.allowedOriginPatterns(
						"http://localhost:*",
						"http://127.0.0.1:*",
						"http://192.168.0.*:*",
						"http://192.168.1.*:*",
						"http://10.*:*",
						"http://172.16.*:*",
						"http://172.17.*:*",
						"http://172.18.*:*",
						"http://172.19.*:*",
						"http://172.20.*:*",
						"http://172.21.*:*",
						"http://172.22.*:*",
						"http://172.23.*:*",
						"http://172.24.*:*",
						"http://172.25.*:*",
						"http://172.26.*:*",
						"http://172.27.*:*",
						"http://172.28.*:*",
						"http://172.29.*:*",
						"http://172.30.*:*",
						"http://172.31.*:*"
				)
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(false)
				.maxAge(3600);
	}
}
