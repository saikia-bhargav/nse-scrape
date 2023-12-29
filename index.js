const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const readline = require("readline");
const asyncIteratorWithDelay = require("./utils.js");
const { SITE_URL, INDICES_ITERATION_DELAY } = require("./constants.js");

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

  await page.goto(SITE_URL);

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

  const indicesIterator = asyncIteratorWithDelay(
    [...listOfAllIndices.slice(0,3)],
    INDICES_ITERATION_DELAY
  );

  for await (const index of indicesIterator) {
    console.log("downloading for:", index);
    await page.type("#hpReportIndexTypeSearchInput", index);

    for (let i = START_YEAR; i <= END_YEAR; i++) {
      await srtDtEl.evaluate((el, yr) => {
        el.value = `01-01-${yr}`;
      }, i);
      await endDtEl.evaluate(async (el, yr) => {
        el.value = `30-12-${yr}`;
      }, i);

      await page.click("#CFanncEquity-download");
    }

    // Resetting values
    await srtDtEl.evaluate((el, yr) => {
      el.value = `01-01-${yr}`;
    }, START_YEAR);
    await endDtEl.evaluate(async (el, yr) => {
      el.value = `30-12-${yr}`;
    }, START_YEAR);
  }

  await customFilterEl.dispose();
  await srtDtEl.dispose();
  await endDtEl.dispose();
  await indexSelectEl.dispose();
}
