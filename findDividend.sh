#!/bin/sh
for i in {0..200};
do
	echo "docker run --rm -i --cap-add=SYS_ADMIN -v $PWD/findDividend.js:/index.js --net=stocker-server_backend --name puppeteer-chrome puppeteer-chrome-linux node index.js"
	docker run --rm -i --cap-add=SYS_ADMIN -v $PWD/findDividend.js:/index.js --net=stocker-server_backend --name puppeteer-chrome puppeteer-chrome-linux node index.js
done
