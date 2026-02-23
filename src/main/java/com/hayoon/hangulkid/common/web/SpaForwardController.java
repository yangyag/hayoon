package com.hayoon.hangulkid.common.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {
	@GetMapping({"/", "/library", "/letters", "/learn", "/learn/**"})
	public String forwardSpaRoutes() {
		return "forward:/index.html";
	}
}
