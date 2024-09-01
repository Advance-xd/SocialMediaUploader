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
    exec("node " + script + " " + args, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Script error: ${stderr}`);
            return;
        }

        console.log(`Child output: ${stdout}`);
    });

}
