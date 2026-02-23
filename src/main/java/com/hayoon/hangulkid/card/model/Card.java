package com.hayoon.hangulkid.card.model;

import java.util.List;

public record Card(
	String id,
	String word,
	String imageUrl,
	int level,
	List<String> tags
) {
}
