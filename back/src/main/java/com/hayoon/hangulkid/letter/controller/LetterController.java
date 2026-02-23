package com.hayoon.hangulkid.letter.controller;

import com.hayoon.hangulkid.letter.dto.LetterListResponse;
import com.hayoon.hangulkid.letter.dto.LetterWordListResponse;
import com.hayoon.hangulkid.letter.service.LetterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/letters")
public class LetterController {
	private final LetterService letterService;

	public LetterController(LetterService letterService) {
		this.letterService = letterService;
	}

	@GetMapping
	public LetterListResponse getLetters() {
		return letterService.findLetters();
	}

	@GetMapping("/{key}/words")
	public LetterWordListResponse getWordsByLetter(@PathVariable("key") String key) {
		return letterService.findWordsByKey(key);
	}
}
