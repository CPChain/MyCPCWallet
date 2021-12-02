
all: prod build-image

prod:
	@npm run build

build-builder-image:
	@docker build -t cpc-web-wallet-builder:latest builder-docker

build-in-container:
	@docker run -it --rm -v `pwd`:/home -v `pwd`/builder-docker/node_modules:/home/node_modules cpc-web-wallet-builder:latest npm i
	@docker run -it --rm -v `pwd`:/home -v `pwd`/builder-docker/node_modules:/home/node_modules cpc-web-wallet-builder:latest npm run build

build-image:
	@docker build -t cpc-web-wallet:latest .

run-image:
	@echo "Preview on http://127.0.0.1:8090/"
	@docker run -it --rm -p 8090:80 cpc-web-wallet:latest

push-image:
	@docker tag cpc-web-wallet liaojl/cpc-web-wallet
	@docker push liaojl/cpc-web-wallet
