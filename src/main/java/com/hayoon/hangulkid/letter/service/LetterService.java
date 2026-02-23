package com.hayoon.hangulkid.letter.service;

import com.hayoon.hangulkid.common.exception.CardNotFoundException;
import com.hayoon.hangulkid.letter.dto.LetterDto;
import com.hayoon.hangulkid.letter.dto.LetterListResponse;
import com.hayoon.hangulkid.letter.dto.LetterWordDto;
import com.hayoon.hangulkid.letter.dto.LetterWordListResponse;
import com.hayoon.hangulkid.letter.model.Letter;
import com.hayoon.hangulkid.letter.model.LetterWord;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class LetterService {
	private static final List<Letter> LETTERS = List.of(
		new Letter(
			"ga",
			"가",
			true,
			List.of(
				new LetterWord("가방", "/assets/words/ga/ga-bang.png"),
				new LetterWord("가위", "/assets/words/ga/ga-wi.png"),
				new LetterWord("가면", "/assets/words/ga/ga-myeon.png"),
				new LetterWord("가구", "/assets/words/ga/ga-gu.png"),
				new LetterWord("가지", "/assets/words/ga/ga-ji.png")
			)
		),
		new Letter("na", "나", false, List.of()),
		new Letter("da", "다", false, List.of()),
		new Letter("ra", "라", false, List.of()),
		new Letter("ma", "마", false, List.of()),
		new Letter("ba", "바", false, List.of()),
		new Letter("sa", "사", false, List.of()),
		new Letter("a", "아", false, List.of()),
		new Letter("ja", "자", false, List.of()),
		new Letter("cha", "차", false, List.of()),
		new Letter("ka", "카", false, List.of()),
		new Letter("ta", "타", false, List.of()),
		new Letter("pa", "파", false, List.of()),
		new Letter("ha", "하", false, List.of())
	);

	public LetterListResponse findLetters() {
		List<LetterDto> items = LETTERS.stream()
			.map(LetterDto::from)
			.toList();

		return new LetterListResponse(items);
	}

	public LetterWordListResponse findWordsByKey(String key) {
		Optional<Letter> letter = LETTERS.stream()
			.filter(item -> item.key().equals(key))
			.filter(Letter::enabled)
			.findFirst();

		Letter enabledLetter = letter.orElseThrow(() -> new CardNotFoundException(key));

		List<LetterWordDto> items = enabledLetter.words().stream()
			.map(LetterWordDto::from)
			.toList();

		return new LetterWordListResponse(
			enabledLetter.key(),
			enabledLetter.label(),
			items
		);
	}
}
