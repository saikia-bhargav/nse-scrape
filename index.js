const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const readline = require("readline");
const asyncIteratorWithDelay = require("./utils.js");

let START_YEAR;
let END_YEAR;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter start year: ", (st) => {
  rl.question("Enter end year: ", (end) => {
    START_YEAR = st;
    END_YEAR = end;

    topCall();

    rl.close();
  });
});

async function topCall() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-http2"],
  });

  const page = await browser.newPage();

  // console.log(START_YEAR, END_YEAR);

  await page.goto(
    "https://www.nseindia.com/reports-indices-historical-index-data"
  );

  const indexSelectEl = await page.waitForSelector(
    "#hpReportIndexTypeSearchInput"
  );
  await page.waitForSelector("#hpReportIndexTypeSearchInput optgroup");
  const customFilterEl = await page.waitForSelector("li.customFilter a");
  await customFilterEl.click();

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

  const srtDtEl = await page.waitForSelector("input#startDate");
  const endDtEl = await page.waitForSelector("input#endDate");

  const indicesIterator = asyncIteratorWithDelay(listOfAllIndices, 5000);

  for await (const index of indicesIterator) {
    console.log("current index:", index);
    await page.type("#hpReportIndexTypeSearchInput", index);

    for (let i = START_YEAR; i <= END_YEAR; i++) {
      await srtDtEl.evaluate((el, yr) => {
        el.value = `01-01-${yr}`;
      }, i);
      await endDtEl.evaluate(async (el, yr) => {
        el.value = `30-12-${yr}`;
      }, i);

      //await page.click("#CFanncEquity-download");
    }
  }

  await customFilterEl.dispose();
  await srtDtEl.dispose();
  await endDtEl.dispose();
  await indexSelectEl.dispose();
}
