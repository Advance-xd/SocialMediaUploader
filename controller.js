const args = process.argv.slice(2);

console.log(args)

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '------------\n' // This sets the prompt
});

rl.prompt();

rl.on('line', (input) => {
    // Split the input into the command and its arguments
    const [command, ...args] = input.trim().split(/\s+/);

    console.log(command)

    // Display the prompt again for the next command
    rl.prompt();
});


// Start download from reddit
let redditscript = exec("node reddit " + args[0], (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`Script error: ${stderr}`);
        return;
    }
});

redditscript.stdout.on('data', function(data) {
    console.log(data.toString()); 
});

redditscript.on('exit', (code) => {
    console.log(`redditscript process exited with code ${code}`);
    startupload()
});

async function startupload(){
    let youtubescript = exec("node youtubeapi", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }
    
        if (stderr) {
            console.error(`Script error: ${stderr}`);
            return;
        }
    });
    
    youtubescript.stdout.on('data', function(data) {
        console.log(data.toString()); 
    });
    
    youtubescript.on('exit', (code) => {
        console.log(`youtubescript process exited with code ${code}`);
    });
}