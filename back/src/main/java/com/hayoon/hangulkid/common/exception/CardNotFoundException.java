package com.hayoon.hangulkid.common.exception;

public class CardNotFoundException extends RuntimeException {
	public CardNotFoundException(String cardId) {
		super("Card not found: " + cardId);
	}
}
