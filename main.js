// parentScript.js
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n' // This sets the prompt
});

rl.prompt();

function unknownCommand(command) {
    console.log(`Unknown command: ${command}`);
}

function youtube(args){
    runScript("youtube", args)
}

// Map of available commands
const commands = {
    youtube
};

// Event listener for line input
rl.on('line', (input) => {
    // Split the input into the command and its arguments
    const [command, ...args] = input.trim().split(/\s+/);

    // Execute the command if it exists in the commands map
    if (commands[command]) {
        commands[command](args);
    } else {
        unknownCommand(command);
    }

    // Display the prompt again for the next command
    rl.prompt();
});

// Event listener for closing the interface (Ctrl+C or 'exit' command)
rl.on('close', () => {
    console.log('Exiting command runner...');
    process.exit(0);
});

// Path to the child script

function runScript(script, args){
    // Run the child script
    let child = exec("node " + script + " " + args, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Script error: ${stderr}`);
            return;
        }
    });

    child.stdout.on('data', function(data) {
        console.log(data.toString()); 
    });

}

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

let browser; // Declare the browser variable

// Export the variable so other modules can access it
module.exports = {
    
    getBrowser: () => {
        console.log(browser);
        return browser;
    },
    setBrowser: (value) => {
        browser = value;
        console.log(browser)
    }
};

async function main() {
    browser = await puppeteer.launch({ headless: false, channel: "chrome" });
    let page = await browser.newPage();
    console.log(__dirname + "/index.html")
    await page.goto("file:///" + __dirname + "/index.html")
    console.log("done")
}

main();
