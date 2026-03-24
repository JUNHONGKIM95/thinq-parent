package com.example.thinq_parent.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NoBrokenTextValidator.class)
public @interface NoBrokenText {

	String message() default "text contains broken characters";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
