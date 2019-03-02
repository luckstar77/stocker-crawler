const puppeteer = require('puppeteer');
const { request } = require('graphql-request');
const cheerio = require('cheerio');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');
var fs = require('fs');

async function upsertStocks(stocks) {
  const endpoint = 'http://localhost:7001/graphql'

  return await Promise.all(stocks.map(async stock => {
    stock.dividends = `[${stock.dividends.map(dividend=>`{${Object
        .keys(dividend)
        .map(key => `${key}:${key !== 'date' ? dividend[key] : JSON.stringify(dividend[key])}`)
        .join(",")}}`).join(',')}]`;
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
    console.log(query);

    return await request(endpoint, query)
  }));
}

async function getStocks() {
  const endpoint = 'http://localhost:7001/graphql'

  const query = /* GraphQL */ `
    query {
        stocks {
            symbol
            company
            price
            dividendCount
            dividendSuccessCount
            dividendSuccessPercent
        }
    }
    `;

    return await request(endpoint, query);
}

(async() => {
    try {
        const { stocks } = await getStocks();
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
    
        const page = await browser.newPage();
        // const stock = (_.filter(stocks, {dividendCount: null}))[0];
        const stock = stocks[process.argv[2]];
        const {symbol} = stock;
        let stocksWithDividend = [];

        console.log(`https://stock-ai.com/tw-Dly-8-${symbol}`);
        await page.goto(`https://stock-ai.com/tw-Dly-8-${symbol}`, {timeout: 0});
        
        let dividendTable = await page.evaluate((symbolCode) => {
            return $.ajax(`https://stock-ai.com/lazyLoad?pType=tZ&symbolCode=${symbolCode}&md5ChkSum=${document.body.innerHTML.match(/md5ChkSum='([a-z0-9]+)'/)[1]}&_=${Date.now()}`);
        }, symbol);
        dividendTable = eval(dividendTable);
        const $ = cheerio.load(dividendTable);
        const DividendTr = $('.table.table-striped.table-bordered.table-hover tbody tr');
        let dividends = [];
        let dividendCount = DividendTr.length;
        let dividendSuccessCount = 0;
        for(i = 0; i < dividendCount; i++) {
            const success = DividendTr.eq(i).find('td').eq(7).find('i').hasClass('fa-thumbs-o-up');

            if(success)
                dividendSuccessCount++;
            
            dividends.push({
                date: DividendTr.eq(i).find('td').eq(0).text().replace(/(\d{4}).{1}(\d{2}).{1}(\d{2}).{1}/g,'$1-$2-$3'),
                dividend: parseFloat(DividendTr.eq(i).find('td').eq(1).text()),
                priceOfLastDay: parseFloat(DividendTr.eq(i).find('td').eq(2).text()),
                openingPrice: parseFloat(DividendTr.eq(i).find('td').eq(3).text()),
                yield: parseFloat(DividendTr.eq(i).find('td').eq(4).text()) || null,
                per: parseFloat(DividendTr.eq(i).find('td').eq(5).text()) || null,
                pbr: parseFloat(DividendTr.eq(i).find('td').eq(6).text()) || null,
                success,
                successDay: parseInt(DividendTr.eq(i).find('td').eq(8).text()),
            })
        }
        let dividendSuccessPercent = Math.floor(dividendSuccessCount / dividendCount * 100);

        try {
            stocksWithDividend.push({
                ...stock,
                dividends: dividends,
                dividendCount,
                dividendSuccessCount,
                dividendSuccessPercent,
            });

            // console.log(stocksWithDividend);

            let result = await upsertStocks(stocksWithDividend).catch(error => console.error(error));
        } catch (error) {
            console.error(error)
        }

        browser.close();
    } catch (err) {
        console.error(err);
    }
    return process.exit(1);
})();