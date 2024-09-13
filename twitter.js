const args = process.argv.slice(2)[0].split(",");

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

let browser
let page


console.log("Twitter Script: " + args);

async function login(account) {
    console.log("twitter login: " + account["email"])
    browser = await puppeteer.launch({ headless: false, channel: "chrome", userDataDir: "./userDataDir/"});
    page = await browser.newPage();
    //page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.132 Safari/537.36')
    console.log("broswer", browser)
    page.setDefaultTimeout(15000);
    

    const cookiesFileExists = fs.existsSync("./" +account.email + "/twitter.json") && fs.statSync("./" +account.email + "/twitter.json").size > 0;
    
    if (cookiesFileExists) {
        
        const cookiesString = fs.readFileSync("./" +account.email + "/twitter.json", 'utf8');
        const cookies = JSON.parse(cookiesString);

        // Set cookies
        await page.setCookie(...cookies);
    } else {

    
    

        await page.goto("https://x.com/login")

        await page.waitForSelector('div[class="css-146c3p1 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-135wba7 r-16dba41 r-is05cd r-1inkyih r-95jzfe r-lrvibr r-13f91hp"]')
        await page.click('div[class="css-146c3p1 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-135wba7 r-16dba41 r-is05cd r-1inkyih r-95jzfe r-lrvibr r-13f91hp"]')


        for (let i = 0; i < account.email.length; i++){
            await page.keyboard.press(account.email[i])
        }

        await page.keyboard.press("Tab")
        await page.keyboard.press("Enter")

        await new Promise(resolve => setTimeout(resolve, 3000));

        for (let i = 0; i < account.password.length; i++){
            await page.keyboard.press(account.password[i])
        }

        await page.click('button[data-testid="LoginForm_Login_Button"]')


        await new Promise(resolve => setTimeout(resolve, 3000));

        
    }
    
    await page.goto("https://x.com/compose/post")


    await new Promise(resolve => setTimeout(resolve, 2000));


    if (!fs.existsSync(account.email)) {
        fs.mkdirSync(account.email);
    }
    const cookies = await page.cookies();

    // Save cookies to a file
    fs.writeFileSync("./" +account.email + "/twitter.json", JSON.stringify(cookies, null, 4));

    
}

async function upload() {
    
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
    console.log("twitter loading done")
    /*
    if (args[1] != "all"){
        commands[args[0]](accounts[args[1]]);
    }
    */
    console.log(accounts)
    await loadreddit();
    await login(accounts["Unexpected"]["youtube"])
}

loadaccounts()