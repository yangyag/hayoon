package com.hayoon.hangulkid.card.service;

import com.hayoon.hangulkid.card.dto.CardDto;
import com.hayoon.hangulkid.card.dto.CardListResponse;
import com.hayoon.hangulkid.card.model.Card;
import com.hayoon.hangulkid.card.repository.CardRepository;
import com.hayoon.hangulkid.common.exception.CardNotFoundException;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class CardService {
	private final CardRepository cardRepository;

	public CardService(CardRepository cardRepository) {
		this.cardRepository = cardRepository;
	}

	public CardListResponse findCards(Integer level, int limit) {
		List<Card> filtered = cardRepository.findAll().stream()
			.filter(card -> level == null || card.level() == level)
			.sorted(Comparator.comparingInt(Card::level).thenComparing(Card::word))
			.toList();

		List<CardDto> items = filtered.stream()
			.limit(limit)
			.map(CardDto::from)
			.toList();

		return new CardListResponse(items, filtered.size());
	}

	public CardDto findCardById(String cardId) {
		Optional<Card> card = cardRepository.findAll().stream()
			.filter(item -> item.id().equals(cardId))
			.findFirst();

		return card.map(CardDto::from)
			.orElseThrow(() -> new CardNotFoundException(cardId));
	}
}
