package com.example.thinq_parent.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class TimeConfig {

	@Bean
	public Clock applicationClock() {
		return Clock.system(ZoneId.of("Asia/Seoul"));
	}
}
