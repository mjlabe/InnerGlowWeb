WEB_PORT ?= 4173

.PHONY: web
web:
	@if lsof -ti tcp:$(WEB_PORT) >/dev/null; then \
		echo "Stopping existing server on port $(WEB_PORT)..."; \
		lsof -ti tcp:$(WEB_PORT) | xargs kill; \
		while lsof -ti tcp:$(WEB_PORT) >/dev/null; do sleep 0.1; done; \
	fi
	@echo "Website available at http://127.0.0.1:$(WEB_PORT)/"
	@python3 -m http.server $(WEB_PORT) --bind 127.0.0.1 --directory "$(CURDIR)"
