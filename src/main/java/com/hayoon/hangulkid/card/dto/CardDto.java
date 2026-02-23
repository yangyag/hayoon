package com.hayoon.hangulkid.card.dto;

import com.hayoon.hangulkid.card.model.Card;
import java.util.List;

public record CardDto(
	String id,
	String word,
	String imageUrl,
	int level,
	List<String> tags
) {
	public static CardDto from(Card card) {
		return new CardDto(
			card.id(),
			card.word(),
			card.imageUrl(),
			card.level(),
			card.tags()
		);
	}
}
