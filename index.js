const puppeteer = require('puppeteer');
var rp = require('request-promise');
var moment = require('moment');

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
        console.log(stocks);
        
        browser.close();
    } catch (err) {
        console.error(err);
        return process.exit(1);
    }
})();