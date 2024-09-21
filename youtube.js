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
    console.log("youtube login: " + account["email"])
    browser = await puppeteer.launch({ headless: false, channel: "chrome", userDataDir: "./userDataDir/"});
    page = await browser.newPage();
    //page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.132 Safari/537.36')
    console.log("broswer", browser)
    page.setDefaultTimeout(5000);
    

    const cookiesFileExists = fs.existsSync("./" +account.email + "/youtube.json") && fs.statSync("./" +account.email + "/youtube.json").size > 0;
    
    if (cookiesFileExists) {
        
        const cookiesString = fs.readFileSync("./" +account.email + "/youtube.json", 'utf8');
        const cookies = JSON.parse(cookiesString);

        // Set cookies
        await page.setCookie(...cookies);
    } else {

    
    

        await page.goto("https://studio.youtube.com/")

        try {
            await page.waitForSelector('input[id="identifierId"]')
            await page.type('input[id="identifierId"]', account["email"])

            await page.click('button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc LQeN7 BqKGqe Jskylb TrZEUc lw1w4b"]')

            await new Promise(resolve => setTimeout(resolve, 4000));

            await page.waitForSelector('input[type="password"]')
            await page.type('input[type="password"]', account["password"])

            await page.click('button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc LQeN7 BqKGqe Jskylb TrZEUc lw1w4b"]')

        } catch {
            console.log("log in")
        }
    }
    
    await page.goto("https://www.youtube.com/upload")


    await new Promise(resolve => setTimeout(resolve, 2000));


    if (!fs.existsSync(account.email)) {
        fs.mkdirSync(account.email);
    }
    const cookies = await page.cookies();

    // Save cookies to a file
    fs.writeFileSync("./" +account.email + "/youtube.json", JSON.stringify(cookies, null, 4));

    
}

async function upload(id) {

    const date = await getDayAfterXDays(await getFormattedDate(), id + 1)

    const fileInputSelector = 'input[type="file"]';
    await page.waitForSelector(fileInputSelector);
    const input = await page.$(fileInputSelector);
    const filePath = 'reddit/video_'+id+'.mp4'; // Update this to the path of your video file
    await input.uploadFile(filePath);

    //await page.waitForSelector('div[id="textbox"]')

    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.click('div[id="textbox"]');
    for (let i = 0; i < 13; i++) {
        await page.keyboard.press('Backspace');
    }

    await page.type('div[id="textbox"]', redditvideos[id].data.title + " u/" + redditvideos[id].data.author + " #shorts")

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

    for (let i = 0; i < 14; i++) {
        await page.keyboard.press('Backspace');
    }


    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log(date)

    await new Promise(resolve => setTimeout(resolve, 5000));

    /*
    for (let i = 0; i < date.length; i++){
        await page.keyboard.press(date[i])
    }
    */
    await page.waitForSelector('tp-yt-paper-input[aria-label="Enter date"]')

    await page.type('tp-yt-paper-input[aria-label="Enter date"]', date)
    
    //await page.type('input[aria-labelledby="paper-input-label-12"]',date)

    //await page.click('input[id="paper-input-label-8"]')

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("ENTER")
    await page.keyboard.press("Enter")

    
    await new Promise(resolve => setTimeout(resolve, 2000));

    //await page.click('div[class"guidelines-section style-scope ytcp-uploads-review"]')


    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.click('button[aria-label="Schemalägg"]')

    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.goto("https://www.youtube.com/upload")
    if (id != 5){
        upload(id+1)

    }
    
    
}

async function getFormattedDate() {
    const today = new Date();

    
    // Get the year, month, and day from the date
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    
    // Format the date as YYYY-MM-DD
    return `${year}-${month}-${day}`;
}

async function getDayAfterXDays(currentDateString, x) {
    // Parse the current date from the input string (assumes YYYY-MM-DD format)
    const [year, month, day] = currentDateString.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day); // Months are zero-based in JavaScript Date
  
    // Increment the date by x days
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + x);
  
    // Extract the day number from the future date
    //const futureDay = futureDate.getDate();

    const newyear = futureDate.getFullYear();
    const newmonth = String(futureDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const newday = String(futureDate.getDate()).padStart(2, '0');
  
    return `${newyear}-${newmonth}-${newday}`;
}

let accounts = []
let redditvideos = []

async function loadreddit() {
    const redditss = fs.readFileSync("./reddit/videosdata.json", 'utf8');
    redditvideos = await JSON.parse(redditss);
    console.log("redditvideos loading done")
}

async function loadaccounts() {
    const accountss = fs.readFileSync("accounts.json", 'utf8');
    accounts = await JSON.parse(accountss);
    console.log("youtube loading done")
    /*
    if (args[1] != "all"){
        commands[args[0]](accounts[args[1]]);
    }
    */
    console.log(accounts)
    await loadreddit();
    await login(accounts["youtube"][0])
    await upload(0)
}

loadaccounts()

// youtube login 0