package com.hayoon.hangulkid.card.dto;

import java.util.List;

public record CardListResponse(
	List<CardDto> items,
	int total
) {
}
