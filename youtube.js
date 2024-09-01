const args = process.argv.slice(2)[0].split(",");

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

let browser
let page


console.log("Youtube Script: " + args);


const commands = {
    login
};

async function login(account) {
    console("youtube login")

    
    browser = await puppeteer.launch({ headless: false, channel: "chrome", userDataDir: "./youtube/userDataDir/" });
    page = await browser.newPage();

    page.setDefaultTimeout(5000);

    await page.goto("https://studio.youtube.com/")

    try {
        await page.waitForSelector('input[id="identifierId"]')
        await page.type('input[id="identifierId"]', process.env.EMAIL)

        await page.click('button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc LQeN7 BqKGqe Jskylb TrZEUc lw1w4b"]')

        await new Promise(resolve => setTimeout(resolve, 4000));

        await page.waitForSelector('input[type="password"]')
        await page.type('input[type="password"]', process.env.PASSWORD)

        await page.click('button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc LQeN7 BqKGqe Jskylb TrZEUc lw1w4b"]')

    } catch {
        console.log("log in")
    }
}

let accounts = []

async function loadaccounts() {
    const accountss = fs.readFileSync("accounts.json", 'utf8');
    accounts = JSON.parse(accountss)["youtube"];
    if (args[1] != "all"){
        commands[args[0]](args[1]);
    }
}

loadaccounts()
