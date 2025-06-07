var folders = {
    video:"C:\\Users\\kubil\\Desktop\\edit\\fidyo",
    music:"C:\\Users\\kubil\\Desktop\\edit\\müzik"
}

const { ytmp3, ytmp4 } = require('@vreden/youtube_scraper');
const readline = require('readline')
const fetch = require('node-fetch');
const fs = require('fs')
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Press 1 for Video or 2 for Music: ", async function (type) {
    require('child_process').exec("clipboard_x86_64.exe --paste", (err, stdout, stderr) => {
        if (!stdout) { rl.question('Video link: ', function (url) { download(url, type); }) } else {
            var text = stdout.split('\n').join("").split("\r").join("")
            if (!text.startsWith("https://www.youtube.com/watch?") && !text.startsWith("https://youtu.be/")) {
                rl.question('Video link: ', function (url) { download(url, type); })
            } else {
                download(text, type)
            }
        }
    })
});

function fixtext(text) {
    var temptext = ""
    alphabet = Array.from("0123456789AaÀàÁáÂâÃãÄäBbCcÇçDdÈèÉéÊêËëFfGgHhÌiìİEĞYŞÍíÎîÏïJjKkLlMmNnÑñOoÒòÓóÔôÕõÖöPpQqRrSsTtÙùÚúÛûÜüVvWwXxÝýŸÿZz ");
    for (i = 0; i < text.length; i++) { if (alphabet.filter((z) => z == text[i]).length) temptext += text[i] }
    return temptext.slice(0, -3) + "." + temptext.slice(-3)
}

function download(url, type) {
    video = type === "1" ? ytmp4(url,"1080") : ytmp3(url, "128")

    video.then(result => {
        if (result.status && result.download.status) {
            console.log('Downloading:', result.download);
            const filename = fixtext(result.download.filename.replace(/\s*\([^)]*\)\.(mp3|mp4)$/, ".$1"));
            const filePath = path.join(type === "1" ? folders.video : folders.music, filename);
            
            fetch(result.download.url)
                .then(res => {
                    if (type === "1") {
                        processVideo(res, filePath);
                    } else {
                        processAudio(res, filePath);
                    }
                })
                .catch(err => {
                    console.error(`Download error: ${err.message}`);
                });
        }
    });

    rl.close();
}

function processVideo(res, filePath) {
    const tempPath = path.join(path.dirname(filePath), `temp_${Date.now()}.mp4`);
    const tempFile = fs.createWriteStream(tempPath);
    let total = parseInt(res.headers.get('content-length'), 10);
    let downloaded = 0;
    
    res.body.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total && !isNaN(total)) {
            const percentage = ((downloaded / total) * 100).toFixed(2);
            console.log(`Downloading: ${percentage}%`);
        }
    });
    
    res.body.pipe(tempFile);
    
    tempFile.on('finish', () => {
        console.log('Download completed, processing video...');
        
        ffmpeg(tempPath)
            .outputOptions([
                '-movflags faststart',
                '-c:v copy',          
                '-c:a copy'
            ])
            .save(filePath)
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`Processing: ${Math.floor(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log(`Video processed: ${filePath}`);
                fs.unlink(tempPath, err => {
                    if (err) console.error(`Error deleting temporary file: ${err.message}`);
                });
                process.exit(0);
            })
            .on('error', (err) => {
                console.error(`Video processing error: ${err.message}`);
                process.exit(1);
            });
    });
    
    tempFile.on('error', (err) => {
        console.error(`Temporary file writing error: ${err.message}`);
    });
}

function processAudio(res, filePath) {
    const dest = fs.createWriteStream(filePath);
    let total = parseInt(res.headers.get('content-length'), 10);
    let downloaded = 0;
    
    res.body.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total && !isNaN(total)) {
            const percentage = ((downloaded / total) * 100).toFixed(2);
            console.log(`Downloading: ${percentage}%`);
        }
    });
    
    res.body.pipe(dest);
    
    dest.on('finish', () => {
        console.log(`Download completed: ${filePath}`);
        process.exit(0);
    });
    
    dest.on('error', (err) => {
        console.error(`File writing error: ${err.message}`);
    });
}
