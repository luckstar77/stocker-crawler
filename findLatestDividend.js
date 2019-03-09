const puppeteer = require('puppeteer');
const { request } = require('graphql-request');
const path = require('path');
var fs = require('fs');

const endpoint = process.env.GRAPHQL_ENDPOINT || 'http://localhost:7001/graphql'

async function upsertStocks(stocks) {
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

      console.log(query)

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

        await page.goto('https://stock.wespai.com/rate108');
        await page.waitFor('#example tbody tr', {visible:true});
        stocks = await page.$$eval('#example tbody tr', result=>result.map(stock=>{
            const [
                {innerText:symbol},
                {innerText:company},
                {innerText:_1},
                {innerText:_2},
                {innerText:_3},
                {innerText:_5},
                {innerText:price},
                {innerText:_4},
                {innerText:dividend},
            ] = stock.querySelectorAll("td");

            return {
                symbol,
                company,
                price,
                dividend:parseFloat(dividend),
            };
        }));

        await upsertStocks(stocks);

        browser.close();
    } catch (err) {
        console.error(err);
        return process.exit(1);
    }
})();