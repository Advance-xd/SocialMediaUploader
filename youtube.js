const main = require('./main');


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
    login,
    upload
};

async function login(account) {
    console.log("youtube login: " + account.email)
    browser = await main.getBrowser();
    console.log("broswer", browser)

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

async function upload(id) {
    const fileInputSelector = 'input[type="file"]';
    await page.waitForSelector(fileInputSelector);
    const input = await page.$(fileInputSelector);
    const filePath = process.env.EMAIL + '/video_'+id+'.mp4'; // Update this to the path of your video file
    await input.uploadFile(filePath);

    //await page.waitForSelector('div[id="textbox"]')

    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.click('div[id="textbox"]');
    for (let i = 0; i < 13; i++) {
        await page.keyboard.press('Backspace');
    }

    await page.type('div[id="textbox"]', topVideoPosts[id].data.title + " u/" + topVideoPosts[id].data.author + " #shorts")

    await page.click('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]')

    await page.click('button[class="ytcp-button-shape-impl ytcp-button-shape-impl--filled ytcp-button-shape-impl--mono ytcp-button-shape-impl--size-m"]')
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.click('button[class="ytcp-button-shape-impl ytcp-button-shape-impl--filled ytcp-button-shape-impl--mono ytcp-button-shape-impl--size-m"]')
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.click('button[class="ytcp-button-shape-impl ytcp-button-shape-impl--filled ytcp-button-shape-impl--mono ytcp-button-shape-impl--size-m"]')
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.waitForSelector('ytcp-icon-button[id="second-container-expand-button"]')
    await page.click('ytcp-icon-button[id="second-container-expand-button"]')

    await page.waitForSelector('ytcp-text-dropdown-trigger[id="datepicker-trigger"]')
    await page.click('ytcp-text-dropdown-trigger[id="datepicker-trigger"]')

    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < 13; i++) {
        await page.keyboard.press('Backspace');
    }

    const date = await getDayAfterXDays(await getFormattedDate(), id + 2)

    for (let i = 0; i < date.length; i++){
        await page.keyboard.press(date[i])
    }

    await page.keyboard.press("Enter")

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.click('button[aria-label="Schemalägg"]')

    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.goto("https://www.youtube.com/upload")
    if (id != 6){
        upload(id+1)

    }

    
}

let accounts = []

async function loadaccounts() {
    const accountss = fs.readFileSync("accounts.json", 'utf8');
    accounts = await JSON.parse(accountss)["youtube"];
    console.log("youtube loading done")
    console.log(accounts)
    if (args[1] != "all"){
        commands[args[0]](accounts[args[1]]);
    }
    
}

loadaccounts()

// youtube login 0