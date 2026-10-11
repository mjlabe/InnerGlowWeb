WEB_PORT ?= 4173

.PHONY: web
web:
	@echo "Website available at http://127.0.0.1:$(WEB_PORT)/"
	@python3 -m http.server $(WEB_PORT) --bind 127.0.0.1 --directory "$(CURDIR)"
