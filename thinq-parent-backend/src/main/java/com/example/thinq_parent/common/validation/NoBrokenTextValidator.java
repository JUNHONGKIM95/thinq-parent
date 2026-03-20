package com.example.thinq_parent.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NoBrokenTextValidator implements ConstraintValidator<NoBrokenText, String> {

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if (value == null || value.isBlank()) {
			return true;
		}

		return !value.contains("\uFFFD") && !value.contains("???");
	}
}
