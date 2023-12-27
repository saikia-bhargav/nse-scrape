const fs = require("fs");
const puppeteer = require("puppeteer");

async function topCall() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.nseindia.com/reports-indices-historical-index-data"
    // "https://www.nseindia.com/api/historical/indicesHistory?indexType=NIFTY%2050&from=27-12-2022&to=27-12-2023"
  );

  //   await page.waitForSelector("pre");

  //   await page.$eval("pre",(el)=>{
  //     console.log(JSON.parse(el.textContent));
  //   })

  await page.waitForSelector("#hpReportIndexTypeSearchInput optgroup");

  const listOfAllIndices = await page.$$eval("optgroup", (els) => {
    let arr = [];
    els.forEach((el) => {
      const opts = Array.from(el.children);

      opts.forEach((opt) => {
        arr.push(opt.value);
      });
    });
    return arr;
  });

  

  console.log(listOfAllIndices[3]);

  const indexSelectEl = await page.waitForSelector(
    "#hpReportIndexTypeSearchInput"
  );
  //   listOfAllIndices.forEach(index=>{

  //   })

  await page.$eval("#hpReportIndexTypeSearchInput", (el, indicesList) => {
    el.value = indicesList[3];
  }, listOfAllIndices);

}

topCall();
