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

        await page.goto('https://stock.wespai.com/p/50557');
        await page.waitFor('#example tbody tr', {visible:true});
        stocks = await page.$$eval('#example tbody tr', result=>result.map(stock=>{
            const [
                {innerText:symbol},
                {innerText:company},
                {innerText:price},
                {innerText:dividend},
                {innerText:epsOf4Seasons},
                {innerText:epsOfLastYear},
                {innerText:epsOf2YearsAgo},
                {innerText:epsOf3YearsAgo},
                {innerText:yoyOfLastMonth},
                {innerText:yoyOf2MonthAgo},
                {innerText:yoyOf3MonthAgo},
                {innerText:accumulatedYoyOfLastMonth},
                {innerText:opmOf4Seasons},
                {innerText:opmOfLastYear},
                {innerText:opmOf2YearsAgo},
                {innerText:opmOf3YearsAgo},
                {innerText:npmOf4Seasons},
                {innerText:npmOfLastYear},
                {innerText:npmOf2YearsAgo},
                {innerText:npmOf3YearsAgo},
                {innerText:casheOfLastSeason},
                {innerText:quickRatioOfLastSeason},
            ] = stock.querySelectorAll("td");

            return {
                symbol,
                company,
                price,
                dividend,
                epsOf4Seasons,
                epsOfLastYear,
                epsOf2YearsAgo,
                epsOf3YearsAgo,
                yoyOfLastMonth,
                yoyOf2MonthAgo,
                yoyOf3MonthAgo,
                accumulatedYoyOfLastMonth,
                opmOf4Seasons,
                opmOfLastYear,
                opmOf2YearsAgo,
                opmOf3YearsAgo,
                npmOf4Seasons,
                npmOfLastYear,
                npmOf2YearsAgo,
                npmOf3YearsAgo,
                casheOfLastSeason,
                quickRatioOfLastSeason,
            };
        }));

        let stocksWithDividend = [];

        for (let stock of stocks) {
            console.log(`https://stock-ai.com/tw-Dly-8-${stock.symbol}`);
            await page.goto(`https://stock-ai.com/tw-Dly-8-${stock.symbol}`);
            
            var dir = path.join(process.cwd(), 'screenshots', stock.symbol);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            await page.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            await page.waitFor(1000);
            page.screenshot({
                path:path.join(dir, '1.png')
            })

            await page.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            await page.waitFor(1000);
            page.screenshot({
                path:path.join(dir, '2.png')
            })

            await page.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            await page.waitFor(1000);
            page.screenshot({
                path:path.join(dir, '3.png')
            })

            await page.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            await page.waitFor(1000);
            page.screenshot({
                path:path.join(dir, '4.png')
            })

            await page.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            await page.waitFor(4000);
            page.screenshot({
                path:path.join(dir, '5.png')
            })

            await page.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            await page.waitFor(4000);
            page.screenshot({
                path:path.join(dir, '6.png')
            })
            
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
    
                stocksWithDividend.push({
                    ...stock,
                    ...dividends,
                });

                let result = await upsertStocks(stocksWithDividend).catch(error => console.error(error));
            } catch (error) {
                console.error(error)
            }
        }

        browser.close();
    } catch (err) {
        console.error(err);
        return process.exit(1);
    }
})();