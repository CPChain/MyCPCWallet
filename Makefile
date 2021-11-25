
all: build-image

prod:
	@npm run build

build-image:
	@docker build -t cpc-web-wallet:latest .

run-image:
	@echo "Preview on http://127.0.0.1:8090/"
	@docker run -it --rm -p 8090:80 cpc-web-wallet:latest
