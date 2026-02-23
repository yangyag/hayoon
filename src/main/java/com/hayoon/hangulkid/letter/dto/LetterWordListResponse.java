package com.hayoon.hangulkid.letter.dto;

import java.util.List;

public record LetterWordListResponse(
	String key,
	String label,
	List<LetterWordDto> items
) {
}
