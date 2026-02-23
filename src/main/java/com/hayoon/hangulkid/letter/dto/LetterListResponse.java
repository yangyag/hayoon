package com.hayoon.hangulkid.letter.dto;

import java.util.List;

public record LetterListResponse(
	List<LetterDto> items
) {
}
