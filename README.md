## build
docker build -f docker/node/Dockfile --rm -t puppeteer-chrome-linux .

### findDividend
```
docker run --rm -i --cap-add=SYS_ADMIN -v $PWD/findDividend.js:/index.js --net=stocker-server_backend --name puppeteer-chrome puppeteer-chrome-linux node index.js $symbol
```

## dev
```
docker run --rm -i --cap-add=SYS_ADMIN -v $PWD/index.js:/index.js --net=stocker-server_backend --name puppeteer-chrome puppeteer-chrome-linux node -e "`cat index.js`"
```