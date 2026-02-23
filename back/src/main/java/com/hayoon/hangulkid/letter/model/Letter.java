package com.hayoon.hangulkid.letter.model;

import java.util.List;

public record Letter(
	String key,
	String label,
	boolean enabled,
	List<LetterWord> words
) {
}
