const args = process.argv.slice(2)[0].split(",");

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

let browser
let page


console.log("Intagram Script: " + args);


const commands = {
    login
};

async function login(account) {
    console.log("instagram login: " + account["email"])
    browser = await puppeteer.launch({ headless: false, channel: "chrome", userDataDir: "./userDataDir/"});
    page = await browser.newPage();
    await page.goto("https://www.instagram.com/")

    page.setDefaultTimeout(5000);
    const cookiesFileExists = fs.existsSync("./" +account.email + "/instagram.json") && fs.statSync("./" +account.email + "/instagram.json").size > 0;
    
    if (cookiesFileExists) {
        
        const cookiesString = fs.readFileSync("./" +account.email + "/instagram.json", 'utf8');
        const cookies = JSON.parse(cookiesString);

        // Set cookies
        await page.setCookie(...cookies);
    } else {
        try {
            await page.waitForSelector('button[class="_a9-- _ap36 _a9_0"]')
            await page.click('button[class="_a9-- _ap36 _a9_0"]')
            await page.waitForSelector('input[name="username"]')
            await page.type('input[name="username"]', account.email)

            await page.waitForSelector('input[name="password"]')
            await page.type('input[name="password"]', account.password)

            await page.click('button[type="submit"]')
    
        } catch {
            console.log("no cookies button")
        }

        
    }

    if (!fs.existsSync(account.email)) {
        fs.mkdirSync(account.email);
    }
    await page.waitForSelector('svg[aria-label="New post"]')


    const cookies = await page.cookies();

    // Save cookies to a file
    fs.writeFileSync("./" +account.email + "/instagram.json", JSON.stringify(cookies, null, 4));

    


    

}

async function upload(id) {
    await page.click('svg[aria-label="New post"]')

    await page.waitForSelector('svg[aria-label="Post"]')
    await page.click('svg[aria-label="Post"]')

    const fileInputSelector = 'input[type="file"]';
    await page.waitForSelector(fileInputSelector);
    const input = await page.$(fileInputSelector);
    const filePath = 'reddit/video_'+id+'.mp4'; // Update this to the path of your video file
    await input.uploadFile(filePath);

    await page.waitForSelector('div[class="x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x1ypdohk x1f6kntn xwhw2v2 xl56j7k x17ydfre x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye xjbqb8w xm3z3ea x1x8b98j x131883w x16mih1h x972fbf xcfux6l x1qhh985 xm0m39n xt0psk2 xt7dq6l xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1n5bzlp x173jzuc x1yc6y37"]')
    await page.click('div[class="x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x1ypdohk x1f6kntn xwhw2v2 xl56j7k x17ydfre x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye xjbqb8w xm3z3ea x1x8b98j x131883w x16mih1h x972fbf xcfux6l x1qhh985 xm0m39n xt0psk2 xt7dq6l xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1n5bzlp x173jzuc x1yc6y37"]')
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForSelector('div[class="x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x1ypdohk x1f6kntn xwhw2v2 xl56j7k x17ydfre x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye xjbqb8w xm3z3ea x1x8b98j x131883w x16mih1h x972fbf xcfux6l x1qhh985 xm0m39n xt0psk2 xt7dq6l xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1n5bzlp x173jzuc x1yc6y37"]')
    await page.click('div[class="x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x1ypdohk x1f6kntn xwhw2v2 xl56j7k x17ydfre x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye xjbqb8w xm3z3ea x1x8b98j x131883w x16mih1h x972fbf xcfux6l x1qhh985 xm0m39n xt0psk2 xt7dq6l xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1n5bzlp x173jzuc x1yc6y37"]')
    await new Promise(resolve => setTimeout(resolve, 2000));


    await page.waitForSelector('div[aria-label="Write a caption..."]')
    await page.type('div[aria-label="Write a caption..."]', redditvideos[id].data.title + " u/" + redditvideos[id].data.author)
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForSelector('div[class="x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x1ypdohk x1f6kntn xwhw2v2 xl56j7k x17ydfre x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye xjbqb8w xm3z3ea x1x8b98j x131883w x16mih1h x972fbf xcfux6l x1qhh985 xm0m39n xt0psk2 xt7dq6l xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1n5bzlp x173jzuc x1yc6y37"]')
    await page.click('div[class="x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x1ypdohk x1f6kntn xwhw2v2 xl56j7k x17ydfre x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye xjbqb8w xm3z3ea x1x8b98j x131883w x16mih1h x972fbf xcfux6l x1qhh985 xm0m39n xt0psk2 xt7dq6l xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1n5bzlp x173jzuc x1yc6y37"]')

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
    console.log("instagram loading done")

    console.log(accounts)
    await loadreddit();
    await login(accounts["warthundermemes"]["instagram"])
    await upload(0)
}

loadaccounts()