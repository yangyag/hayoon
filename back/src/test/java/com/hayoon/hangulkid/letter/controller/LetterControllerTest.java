package com.hayoon.hangulkid.letter.controller;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class LetterControllerTest {
	private static final String[] KEYS = {
		"ga", "na", "da", "ra", "ma", "ba", "sa", "a", "ja", "cha", "ka", "ta", "pa", "ha"
	};

	private static final String[] LABELS = {
		"가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하"
	};

	@Autowired
	private MockMvc mockMvc;

	@Test
	void getLettersShouldReturnAllLettersWithEnabledFlags() throws Exception {
		ResultActions response = mockMvc.perform(get("/api/v1/letters"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.items.length()").value(14));

		for (int index = 0; index < KEYS.length; index++) {
			response
				.andExpect(jsonPath("$.items[" + index + "].key").value(KEYS[index]))
				.andExpect(jsonPath("$.items[" + index + "].label").value(LABELS[index]))
				.andExpect(jsonPath("$.items[" + index + "].enabled").value(true));
		}
	}

	@Test
	void getWordsShouldReturnAllEnabledLetterWords() throws Exception {
		for (int index = 0; index < KEYS.length; index++) {
			String key = KEYS[index];
			String label = LABELS[index];
			mockMvc.perform(get("/api/v1/letters/{key}/words", key))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.key").value(key))
				.andExpect(jsonPath("$.label").value(label))
				.andExpect(jsonPath("$.items.length()").value(5))
				.andExpect(jsonPath("$.items[*].imageUrl", everyItem(startsWith("/assets/words/" + key + "/"))));
		}
	}

	@Test
	void getWordsShouldReturnNotFoundWhenKeyUnknown() throws Exception {
		mockMvc.perform(get("/api/v1/letters/unknown/words"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("CARD_NOT_FOUND"))
			.andExpect(jsonPath("$.path").value("/api/v1/letters/unknown/words"));
	}
}
