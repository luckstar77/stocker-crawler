## build
docker build -f docker/node/Dockfile --rm -t puppeteer-chrome-linux .

## dev
```
docker run --rm -i --cap-add=SYS_ADMIN -v $PWD/index.js:/index.js --name puppeteer-chrome puppeteer-chrome-linux node -e "`cat index.js`"
```