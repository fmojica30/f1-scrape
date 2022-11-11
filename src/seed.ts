import axios from "axios";
import cheerio from "cheerio";
import mysql from "mysql";
import puppeteer from "puppeteer";

const connectionString = process.env.DATABASE_URL || "";
const connection = mysql.createConnection(connectionString);
connection.connect();

const getDriversInfo = async () => {
  const baseUrl = "https://www.statsf1.com/en/pilotes-";
  const browser = await puppeteer.launch();
  let driver_out = [];
  for (let i = 0; i < 26; i++) {
    // No drivers with X last name so skip
    if (i === 23) {
      continue;
    }

    var chr = String.fromCharCode(97 + i); // where n is 0, 1, 2 ...
    const page = await browser.newPage();
    await page.goto(baseUrl + chr + ".aspx");

    var driver = {
      first_name: "",
      last_name: "",
      nation: "",
      start: "",
      winner: false,
      wc: false,
      active: false,
    };
    await page.waitForSelector("#content > div.SimpleBar");
    const data = await page.evaluate(
      () => document.querySelector("*").outerHTML
    );
    const $ = cheerio.load(data);
    //Letter Q does not use a table to display the data since ther is only 1 entry
    if (i === 16) {
      var driver = {
        first_name: "",
        last_name: "",
        nation: "",
        start: "",
        winner: false,
        wc: false,
        active: false,
      };

      let name_array = $(
        "#ctl00_CPH_Main_GV_Pilote > tbody > tr > td:nth-child(1) > a"
      )
        .text()
        .toLowerCase()
        .split(" ");
      driver.first_name = name_array[0];
      driver.last_name = name_array[1];

      // Setting Q driver active flag
      $("#ctl00_CPH_Main_GV_Pilote > tbody > tr > td:nth-child(1) > a")
        .find("a")
        .find("span")
        .attr("class") === "CurDriver"
        ? (driver.active = true)
        : (driver.active = false);

      //Setting driver nation
      let nation = $(
        "#ctl00_CPH_Main_GV_Pilote > tbody > tr > td:nth-child(2)"
      ).attr("sorttable_customkey");
      if (nation !== undefined) {
        driver.nation = nation;
      }

      //Setting driver start year
      driver.start = $(
        "#ctl00_CPH_Main_GV_Pilote > tbody > tr > td:nth-child(3) > a"
      ).text();

      //Setting driver winner flag
      $("#ctl00_CPH_Main_GV_Pilote > tbody > tr > td:nth-child(4)")
        .find("img")
        .attr("src") === "/images/spacer.gif"
        ? (driver.winner = false)
        : (driver.winner = true);

      //Setting driver world champion flag
      $("#ctl00_CPH_Main_GV_Pilote > tbody > tr > td:nth-child(5)")
        .find("img")
        .attr("src") === "/images/spacer.gif"
        ? (driver.wc = false)
        : (driver.wc = true);
      driver_out.push(driver);
    } else {
      //Iterating through table rows
      $(".sortable>tbody>tr").each((j, el) => {
        var driver = {
          first_name: "",
          last_name: "",
          nation: "",
          start: "",
          winner: false,
          wc: false,
          active: false,
        };
        $(el)
          .find("td")
          //Iterating through columns in row
          .each((i, el) => {
            if (i === 0) {
              //Getting name and active flag from first columns
              let name_array = $(el).text().toLowerCase().split(" ");
              driver.first_name = name_array[0];
              driver.last_name = name_array[1];
              $(el).find("a").find("span").attr("class") === "CurDriver"
                ? (driver.active = true)
                : (driver.active = false);
            } else if (i === 1) {
              // Setting nation from second driver column
              let nation = $(el).attr("sorttable_customkey");
              if (nation !== undefined) {
                driver.nation = nation;
              }
            } else if (i === 2) {
              //Getting driver start year from third column
              driver.start = $(el).text();
            } else if (i === 3) {
              //Getting driver winner flag from fourth column
              $(el).find("img").attr("src") === "/images/spacer.gif"
                ? (driver.winner = false)
                : (driver.winner = true);
            } else {
              //Getting driver world champion flag from fifth column
              $(el).find("img").attr("src") === "/images/spacer.gif"
                ? (driver.wc = false)
                : (driver.wc = true);
            }
          });
        driver_out.push(driver);
      });
    }
    page.close();
  }
  return driver_out;
};

const loadDriverInfo = async () => {
  const driverInfo = await getDriversInfo();
  const sql =
    "INSERT INTO driver (first_name, last_name, nation, start_year, winner, active, world_champion) VALUES ?";
  const values = driverInfo.map((driver) => [
    driver.first_name,
    driver.last_name,
    driver.nation,
    driver.start,
    driver.winner,
    driver.active,
    driver.wc,
  ]);
  connection.query(sql, [values], (err) => {
    if (err) {
      console.error("No dice");
      console.log(err);
    } else {
      console.log("Dice");
    }
  });
};

loadDriverInfo();
