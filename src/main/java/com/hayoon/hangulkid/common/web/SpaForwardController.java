package com.hayoon.hangulkid.common.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {
	@GetMapping("/")
	public String forwardToWelcome() {
		return "forward:/index.html";
	}

	@GetMapping("/library")
	public String forwardToLibrary() {
		return "forward:/library.html";
	}
}
