package com.hayoon.hangulkid.letter.dto;

import com.hayoon.hangulkid.letter.model.LetterWord;

public record LetterWordDto(
	String word,
	String imageUrl
) {
	public static LetterWordDto from(LetterWord letterWord) {
		return new LetterWordDto(
			letterWord.word(),
			letterWord.imageUrl()
		);
	}
}
