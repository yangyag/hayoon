package com.hayoon.hangulkid.card.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class CardControllerTest {
	@Autowired
	private MockMvc mockMvc;

	@Test
	void getCardsShouldReturnDefaultCardsWhenNoQueryProvided() throws Exception {
		mockMvc.perform(get("/api/v1/cards"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.items.length()").value(24))
			.andExpect(jsonPath("$.total").value(24));
	}

	@Test
	void getCardsShouldReturnFilteredCards() throws Exception {
		mockMvc.perform(get("/api/v1/cards").param("level", "1").param("limit", "5"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.items.length()").value(5))
			.andExpect(jsonPath("$.total").value(8))
			.andExpect(jsonPath("$.items[0].level").value(1));
	}

	@Test
	void getCardShouldReturnCardWhenExists() throws Exception {
		mockMvc.perform(get("/api/v1/cards/card-apple"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value("card-apple"))
			.andExpect(jsonPath("$.word").value("사과"))
			.andExpect(jsonPath("$.level").value(1));
	}

	@Test
	void getCardShouldReturnNotFoundWhenMissing() throws Exception {
		mockMvc.perform(get("/api/v1/cards/unknown-card"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("CARD_NOT_FOUND"))
			.andExpect(jsonPath("$.path").value("/api/v1/cards/unknown-card"));
	}

	@Test
	void getCardsShouldValidateLevel() throws Exception {
		mockMvc.perform(get("/api/v1/cards").param("level", "9"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
	}

	@ParameterizedTest
	@ValueSource(strings = {"0", "51"})
	void getCardsShouldValidateLimitRange(String limit) throws Exception {
		mockMvc.perform(get("/api/v1/cards").param("limit", limit))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
	}
}
