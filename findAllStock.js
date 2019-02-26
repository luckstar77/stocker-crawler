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

        await page.goto('https://stock.wespai.com/p/51227');
        await page.waitFor('#example tbody tr', {visible:true});
        stocks = await page.$$eval('#example tbody tr', result=>result.map(stock=>{
            const [
                {innerText:symbol},
                {innerText:company},
                {innerText:price},
            ] = stock.querySelectorAll("td");

            return {
                symbol,
                company,
                price,
            };
        }));

        await upsertStocks(stocks);

        browser.close();
    } catch (err) {
        console.error(err);
        return process.exit(1);
    }
})();