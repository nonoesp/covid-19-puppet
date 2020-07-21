const puppeteer = require('puppeteer');
var player = require('play-sound')(opts = {})
const fs = require('fs');
const { exec } = require("child_process");

const verbosity = 0;

Object.defineProperty(Date.prototype, 'yymmdd_hhmmss', {
    value: function() {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

        return this.getFullYear().toString().substr(2,2) +
               pad2(this.getMonth() + 1) + 
               pad2(this.getDate()) +
               '_' +
								pad2(this.getHours()) +
               pad2(this.getMinutes()) +
               pad2(this.getSeconds());
    }
});

const URL = 'https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6';


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


let wait = 18000;
let waitFirst = 3000;
const sleepTime = 1000 * 60 * 5;
const filename = 'confirmed.txt';
let previouslyConfirmed = '0';

if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, previouslyConfirmed, { flag: 'wx' });
} else {
    previouslyConfirmed = fs.readFileSync(filename, 'utf-8');
    if (isNaN(parseInt(previouslyConfirmed.replace(',','')))) {
        previouslyConfirmed = '0';
    }
}

console.log(`Last known number of confirmed cases · ${previouslyConfirmed}`);
console.log(`-----------------------`);

(async () => {

    while(true) {

        if (verbosity > 0) console.log('Opening COVID-19 site..');
        const date = new Date().yymmdd_hhmmss();

        const browser = await puppeteer.launch({defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 }});
        const page = await browser.newPage();
        await page.goto(URL);
        if (verbosity > 0) console.log(`Waiting for ${waitFirst}ms..`);
        await page.waitFor(waitFirst);

        // Get number of confirmed cases
        const element = await page.$("#ember27");
        const text = await page.evaluate(element => element.textContent, element);
        const confirmed = await text.replace('Total Confirmed', '').trim();
        if (verbosity > 0) console.log(`------------\nTotal confirmed: ${confirmed}\n------------`);

        if (verbosity > 0) console.log(`${parseInt(previouslyConfirmed.replace(',',''))} < ${parseInt(confirmed.replace(',',''))}`);

        if (
            parseInt(previouslyConfirmed.replace(',',''))
            <
            parseInt(confirmed.replace(',',''))
            ) {
            if (verbosity > 0) {
                console.log(`Confirmed cases increased!`)
                console.log(`-----------------------`);
            }
            console.log(`${previouslyConfirmed} → ${confirmed} · ${date}`);
            if (verbosity > 0) console.log(`-----------------------`);

            previouslyConfirmed = confirmed;

            fs.writeFileSync(filename, confirmed);

            // player.play('smb_coin.wav', function(err){
            //     if (err) { 
            //         console.log(err);
            //     }
            // });

            if (verbosity > 0) console.log(`Waiting for ${wait - waitFirst}ms..`);
            await page.waitFor(wait - waitFirst);
        
            // Taking screenshot
            if (verbosity > 0) console.log(`Taking screenshot..`);
            await page.screenshot({path: `screens/${date}_covid_${confirmed.replace(',', '.')}.png`});

            // Make gif
            // exec("make gif && open bin", (error, stdout, stderr) => {
            //     if (error) {
            //         if (verbosity > 0) console.log(`error: ${error.message}`);
            //         return;
            //     }
            //     if (stderr) {
            //         if (verbosity > 0) console.log(`stderr: ${stderr}`);
            //         return;
            //     }
            //     if (verbosity > 0) console.log(`stdout: ${stdout}`);
            // });            
        } else {
            if (verbosity > 0) console.log(`Confirmed cases stayed the same..`);
        }
      
        await browser.close();
        if (verbosity > 0) console.log();
        if (verbosity > 0) console.log(`Sleeping for ${sleepTime / 1000 / 60} mins.. Zzz..`);
        if (verbosity > 0) console.log();
        await sleep(sleepTime);
    }

})();