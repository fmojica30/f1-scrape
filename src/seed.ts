import axios from 'axios';
import cheerio from 'cheerio';
import mysql from 'mysql';
import puppeteer from 'puppeteer';

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection(connectionString);
connection.connect();

const getDriversInfo = async () => {
  const baseUrl = "https://www.statsf1.com/en/pilotes-";
  const browser = await puppeteer.launch();
  for (let i = 0; i < 26; i++) {
    // No drivers with X as a last name so skip
    if (i === 23) {
      continue;
    }

    var chr = String.fromCharCode(97 + i); // where n is 0, 1, 2 ...
    const page = await browser.newPage();
    await page.goto(baseUrl + chr + '.aspx');
    
    //Letter Q does not use a table to display the data since ther is only 1 entry
    if (i === 16) {
      await page.waitForSelector('#content > div.SimpleBar');
      const data = await page.evaluate(() => document.querySelector('*').outerHTML);
      const $ = cheerio.load(data);
      console.log($('#ctl00_CPH_Main_GV_Pilote > tbody > tr > td:nth-child(1) > a').text());
      console.log(i);
    } else {
      await page.waitForSelector('#ctl00_CPH_Main_GV_Pilote');
      const data = await page.evaluate(() => document.querySelector('*').outerHTML);
      const $ = cheerio.load(data);
      console.log($('#ctl00_CPH_Main_GV_Pilote > tbody > tr:nth-child(2) > td:nth-child(1) > a').text());
      console.log(i);
    }
    page.close();
  }
}

/*
const getCharacterPageNames = async () => {
  
  const {data} = await axios.get(url);
  const $ = cheerio.load(data);
  const categories = $('ul.category-page__members-for-char');

  const characterPageNames = ["name"];

  for (let i = 0; i < categories.length; i++) {
    const ul = categories[i];
    const characterLIs = $(ul).find('li.category-page__member');
    for (let j = 0; j < characterLIs.length; j++){
      const li = characterLIs[j];
      const path = $(li).find('a.category-page__member-link').attr('href') || "";
      const name = path.replace('/wiki/', "");
      characterPageNames.push(name);
      console.log(name);
    }
  }

  return characterPageNames;
} 
*/

getDriversInfo();