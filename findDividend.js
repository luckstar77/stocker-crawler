const puppeteer = require('puppeteer');
const { request } = require('graphql-request');
const path = require('path');
var fs = require('fs');

async function upsertStocks(stocks) {
  const endpoint = 'http://node:7001/graphql'

  return await Promise.all(stocks.map(async stock => {
    const query = /* GraphQL */ `
        mutation {
            upsertStock(${Object
            .keys(stock)
            .map(key => `${key}:${key !== 'symbol' && key !== 'company' ? stock[key] : JSON.stringify(stock[key])}`)
            .join(",")}) {
                symbol
                company
            }
        }
      `;
    // console.log(query);

    return await request(endpoint, query)
  }));
}

(async() => {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
    
        const page = await browser.newPage();
        const stock = {
            symbol: process.argv[2],
        };
        let stocksWithDividend = [];

        console.log(`https://stock-ai.com/tw-Dly-8-${stock.symbol}`);
        await page.goto(`https://stock-ai.com/tw-Dly-8-${stock.symbol}`);
        
        // var dir = path.join(process.cwd(), 'screenshots', stock.symbol);
        // if (!fs.existsSync(dir)){
        //     fs.mkdirSync(dir);
        // }

        await page.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page.waitFor(1000);

        await page.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page.waitFor(1000);

        await page.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page.waitFor(1000);

        await page.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page.waitFor(1000);

        await page.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page.waitFor(4000);

        await page.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page.waitFor(4000);
        
        try {
            const dividends = await page.$$eval('.table.table-striped.table-bordered.table-hover', async table=>{
                const dividendTrs = [].slice.call(document.querySelectorAll("table.table.table-striped.table-bordered.table-hover")[2].querySelectorAll("tbody tr"));
                const dividendSuccessCount = dividendTrs.reduce((prev, dividend)=>dividend.querySelectorAll("td")[8].innerText !== '0' ? prev + 1 : prev, 0);
                // const dividendSuccessCount = dividendTrs.reduce((prev, dividend)=>dividend.querySelectorAll("td")[8].innerText !== '0' ? prev++ : prev, 0);
                return {
                    dividendCount: dividendTrs.length,
                    dividendSuccessCount,
                    dividendSuccessPercent: Math.floor(dividendSuccessCount / dividendTrs.length * 100),
                };
            });

            if(!dividends.dividendCount)
                throw `No dividend data. ${dividends.toString()}`;

            stocksWithDividend.push({
                ...stock,
                ...dividends,
            });

            console.log(stocksWithDividend);

            let result = await upsertStocks(stocksWithDividend).catch(error => console.error(error));
        } catch (error) {
            console.error(error)
        }

        browser.close();
    } catch (err) {
        console.error(err);
        return process.exit(1);
    }
})();