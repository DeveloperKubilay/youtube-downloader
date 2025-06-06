var folders = {
    video: "C:\\Users\\kubil\\Desktop\\localstorage",
    music: "C:\\Users\\kubil\\Desktop\\localstorage"
}

const { ytmp3, ytmp4 } = require('@vreden/youtube_scraper');
const readline = require('readline')
const fetch = require('node-fetch');
const fs = require('fs')
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Video ise 1'i Müzikse 2'yi tuşlayınız: ", async function (tür) {
    require('child_process').exec("clipboard_x86_64.exe --paste", (err, stdout, stderr) => {
        if (!stdout) { rl.question('Video linki: ', function (url) { download(url, tür); }) } else {
            var text = stdout.split('\n').join("").split("\r").join("")
            if (!text.startsWith("https://www.youtube.com/watch?") && !text.startsWith("https://youtu.be/")) {
                rl.question('Video linki: ', function (url) { download(url, tür); })
            } else {
                download(text, tür)
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

function download(url, tür) {
    video = tür === "1" ? ytmp4(url,"1080") : ytmp3(url, "128")

    video.then(result => {
        if (result.status && result.download.status) {
            console.log('Downloading:', result.download);
            const filename = fixtext(result.download.filename.replace(/\s*\([^)]*\)\.(mp3|mp4)$/, ".$1"));
            const filePath = path.join(tür === "1" ? folders.video : folders.music, filename);
            
            fetch(result.download.url)
                .then(res => {
                    if (tür === "1") {
                        processVideo(res, filePath);
                    } else {
                        processAudio(res, filePath);
                    }
                })
                .catch(err => {
                    console.error(`İndirme hatası: ${err.message}`);
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
            console.log(`İndirme: ${percentage}%`);
        }
    });
    
    res.body.pipe(tempFile);
    
    tempFile.on('finish', () => {
        console.log('İndirme tamamlandı, video işleniyor...');
        

        ffmpeg(tempPath)
            .outputOptions([
                '-movflags faststart',
                '-c:v copy',          
                '-c:a copy'
            ])
            .save(filePath)
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`İşleme: ${Math.floor(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log(`Video işlendi: ${filePath}`);
                fs.unlink(tempPath, err => {
                    if (err) console.error(`Geçici dosya silinirken hata: ${err.message}`);
                });
                process.exit(0);
            })
            .on('error', (err) => {
                console.error(`Video işleme hatası: ${err.message}`);
                process.exit(1);
            });
    });
    
    tempFile.on('error', (err) => {
        console.error(`Geçici dosya yazma hatası: ${err.message}`);
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
            console.log(`İndirme: ${percentage}%`);
        }
    });
    
    res.body.pipe(dest);
    
    dest.on('finish', () => {
        console.log(`İndirme tamamlandı: ${filePath}`);
        process.exit(0);
    });
    
    dest.on('error', (err) => {
        console.error(`Dosya yazma hatası: ${err.message}`);
    });
}
