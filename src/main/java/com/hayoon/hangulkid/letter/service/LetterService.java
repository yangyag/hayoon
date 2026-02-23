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
		new Letter(
			"na",
			"나",
			true,
			List.of(
				new LetterWord("나비", "/assets/words/na/na-bi.png"),
				new LetterWord("나무", "/assets/words/na/na-mu.png"),
				new LetterWord("나물", "/assets/words/na/na-mul.png"),
				new LetterWord("나팔", "/assets/words/na/na-pal.png"),
				new LetterWord("나침반", "/assets/words/na/na-chim-ban.png")
			)
		),
		new Letter(
			"da",
			"다",
			true,
			List.of(
				new LetterWord("다리", "/assets/words/da/da-ri.png"),
				new LetterWord("다람쥐", "/assets/words/da/da-ram-jwi.png"),
				new LetterWord("다리미", "/assets/words/da/da-ri-mi.png"),
				new LetterWord("다트", "/assets/words/da/da-teu.png"),
				new LetterWord("다이아몬드", "/assets/words/da/da-i-a-mon-deu.png")
			)
		),
		new Letter(
			"ra",
			"라",
			true,
			List.of(
				new LetterWord("라디오", "/assets/words/ra/ra-di-o.png"),
				new LetterWord("라면", "/assets/words/ra/ra-myeon.png"),
				new LetterWord("라켓", "/assets/words/ra/ra-ket.png"),
				new LetterWord("라마", "/assets/words/ra/ra-ma.png"),
				new LetterWord("라일락", "/assets/words/ra/ra-il-rak.png")
			)
		),
		new Letter(
			"ma",
			"마",
			true,
			List.of(
				new LetterWord("마차", "/assets/words/ma/ma-cha.png"),
				new LetterWord("마늘", "/assets/words/ma/ma-neul.png"),
				new LetterWord("마이크", "/assets/words/ma/ma-i-keu.png"),
				new LetterWord("마스크", "/assets/words/ma/ma-seu-keu.png"),
				new LetterWord("마술봉", "/assets/words/ma/ma-sul-bong.png")
			)
		),
		new Letter(
			"ba",
			"바",
			true,
			List.of(
				new LetterWord("바나나", "/assets/words/ba/ba-na-na.png"),
				new LetterWord("바위", "/assets/words/ba/ba-wi.png"),
				new LetterWord("바늘", "/assets/words/ba/ba-neul.png"),
				new LetterWord("바지", "/assets/words/ba/ba-ji.png"),
				new LetterWord("바이올린", "/assets/words/ba/ba-i-ol-lin.png")
			)
		),
		new Letter(
			"sa",
			"사",
			true,
			List.of(
				new LetterWord("사과", "/assets/words/sa/sa-gwa.png"),
				new LetterWord("사자", "/assets/words/sa/sa-ja.png"),
				new LetterWord("사탕", "/assets/words/sa/sa-tang.png"),
				new LetterWord("사슴", "/assets/words/sa/sa-seum.png"),
				new LetterWord("사다리", "/assets/words/sa/sa-da-ri.png")
			)
		),
		new Letter(
			"a",
			"아",
			true,
			List.of(
				new LetterWord("아기", "/assets/words/a/a-gi.png"),
				new LetterWord("악어", "/assets/words/a/ag-eo.png"),
				new LetterWord("안경", "/assets/words/a/an-gyeong.png"),
				new LetterWord("아파트", "/assets/words/a/a-pa-teu.png"),
				new LetterWord("아이스크림", "/assets/words/a/a-i-seu-keu-rim.png")
			)
		),
		new Letter(
			"ja",
			"자",
			true,
			List.of(
				new LetterWord("자동차", "/assets/words/ja/ja-dong-cha.png"),
				new LetterWord("자전거", "/assets/words/ja/ja-jeon-geo.png"),
				new LetterWord("자두", "/assets/words/ja/ja-du.png"),
				new LetterWord("자물쇠", "/assets/words/ja/ja-mul-soe.png"),
				new LetterWord("자석", "/assets/words/ja/ja-seok.png")
			)
		),
		new Letter(
			"cha",
			"차",
			true,
			List.of(
				new LetterWord("차", "/assets/words/cha/cha.png"),
				new LetterWord("차표", "/assets/words/cha/cha-pyo.png"),
				new LetterWord("차키", "/assets/words/cha/cha-ki.png"),
				new LetterWord("차창", "/assets/words/cha/cha-chang.png"),
				new LetterWord("차고", "/assets/words/cha/cha-go.png")
			)
		),
		new Letter(
			"ka",
			"카",
			true,
			List.of(
				new LetterWord("카메라", "/assets/words/ka/ka-me-ra.png"),
				new LetterWord("카드", "/assets/words/ka/ka-deu.png"),
				new LetterWord("카레", "/assets/words/ka/ka-re.png"),
				new LetterWord("카트", "/assets/words/ka/ka-teu.png"),
				new LetterWord("카네이션", "/assets/words/ka/ka-ne-i-syeon.png")
			)
		),
		new Letter(
			"ta",
			"타",
			true,
			List.of(
				new LetterWord("타조", "/assets/words/ta/ta-jo.png"),
				new LetterWord("타이어", "/assets/words/ta/ta-i-eo.png"),
				new LetterWord("타자기", "/assets/words/ta/ta-ja-gi.png"),
				new LetterWord("타일", "/assets/words/ta/ta-il.png"),
				new LetterWord("타워", "/assets/words/ta/ta-wo.png")
			)
		),
		new Letter(
			"pa",
			"파",
			true,
			List.of(
				new LetterWord("파도", "/assets/words/pa/pa-do.png"),
				new LetterWord("파리", "/assets/words/pa/pa-ri.png"),
				new LetterWord("파인애플", "/assets/words/pa/pa-in-ae-peul.png"),
				new LetterWord("파프리카", "/assets/words/pa/pa-peu-ri-ka.png"),
				new LetterWord("파랑새", "/assets/words/pa/pa-rang-sae.png")
			)
		),
		new Letter(
			"ha",
			"하",
			true,
			List.of(
				new LetterWord("하마", "/assets/words/ha/ha-ma.png"),
				new LetterWord("하늘", "/assets/words/ha/ha-neul.png"),
				new LetterWord("하트", "/assets/words/ha/ha-teu.png"),
				new LetterWord("하프", "/assets/words/ha/ha-peu.png"),
				new LetterWord("하모니카", "/assets/words/ha/ha-mo-ni-ka.png")
			)
		)
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
