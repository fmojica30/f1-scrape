import mysql from "mysql";
import { getDriversInfo } from "./getDriverInfo";

const connectionString = process.env.DATABASE_URL || "";
const connection = mysql.createConnection(connectionString);
connection.connect();

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
