package com.hayoon.hangulkid.card.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hayoon.hangulkid.card.model.Card;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

@Repository
public class CardRepository {
	private final List<Card> cards;

	public CardRepository(ObjectMapper objectMapper) {
		this.cards = loadCards(objectMapper);
	}

	public List<Card> findAll() {
		return cards;
	}

	private List<Card> loadCards(ObjectMapper objectMapper) {
		ClassPathResource resource = new ClassPathResource("cards/cards.json");

		try (InputStream inputStream = resource.getInputStream()) {
			List<Card> loaded = objectMapper.readValue(inputStream, new TypeReference<List<Card>>() {
			});
			return List.copyOf(loaded);
		} catch (IOException exception) {
			throw new IllegalStateException("Failed to load card data", exception);
		}
	}
}
