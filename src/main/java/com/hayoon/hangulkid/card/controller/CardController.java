package com.hayoon.hangulkid.card.controller;

import com.hayoon.hangulkid.card.dto.CardDto;
import com.hayoon.hangulkid.card.dto.CardListResponse;
import com.hayoon.hangulkid.card.service.CardService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cards")
@Validated
public class CardController {
	private final CardService cardService;

	public CardController(CardService cardService) {
		this.cardService = cardService;
	}

	@GetMapping
	public CardListResponse getCards(
		@RequestParam(required = false) @Min(1) @Max(3) Integer level,
		@RequestParam(defaultValue = "24") @Min(1) @Max(50) Integer limit
	) {
		return cardService.findCards(level, limit);
	}

	@GetMapping("/{id}")
	public CardDto getCard(@PathVariable("id") String id) {
		return cardService.findCardById(id);
	}
}
