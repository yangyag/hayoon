package com.hayoon.hangulkid.letter.dto;

import com.hayoon.hangulkid.letter.model.Letter;

public record LetterDto(
	String key,
	String label,
	boolean enabled
) {
	public static LetterDto from(Letter letter) {
		return new LetterDto(
			letter.key(),
			letter.label(),
			letter.enabled()
		);
	}
}
