import chalk from "chalk";
import http from "http";
import https from "https";
import { writeFileSync } from "fs";
import { createInterface } from "readline";
import { parse } from "url";

let html = "";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(chalk.yellow.bold("HTML Downloader"));
rl.question("\n\nEnter the URL: ", (url) => {
  console.log(`\nURL to search: ${url}`);
  const parseUrl = parse(url, true);
  if (!parseUrl.protocol) {
    console.error(
      chalk.red.bold(
        "URL invalid, please, consider input the protocol [https or http]"
      )
    );
    process.exit(1);
  }
  const port = parseUrl.protocol === "https:" ? 443 : 80;
  const get = port === 443 ? https.get : http.get;
  const hostname = parseUrl.hostname;

  get(url, (res) => {
    console.log(
      chalk.green.bold(`URL loaded -> ${res.statusCode}: ${res.statusMessage}`)
    );
    if (res.statusCode > 399) {
      console.log(chalk.red.bold(`Can't download HTML source`));
      process.exit(1);
    }
    res.on("data", (data) => {
      console.log(chalk.yellow.bold("Capturing HTML source..."));
      html += data.toString();
    });
    res.on("end", () => {
      const output = `out/${hostname}.html`;
      try {
        writeFileSync(output, html);
        console.log(chalk.green.bold(`\nHTML saved on out/${hostname}.html`));
      } catch (err) {
        console.error(chalk.red.bold("Can't save the HTML source to file"));
        console.error(chalk.red.bold(err));
        process.exit(1);
      }
    });
  }).on("error", (err) => {
    console.error(chalk.red.bold(`${hostname} not found`));
    process.exit(1);
  });
  rl.close();
});
