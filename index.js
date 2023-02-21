var folders = {
    video:"C:\\Users\\kubil\\Desktop\\edit\\fidyo",
    music:"C:\\Users\\kubil\\Desktop\\edit\\müzik"
}

const readline = require('readline'),fs = require('fs'), ytdl = require('ytdl-core'), path = require('path'), ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Video ise 1'i Müzikse 2'yi tuşlayınız: ", async function (tür) {
    require('child_process').exec("clipboard_x86_64.exe --paste", (err, stdout, stderr) => {
        if (!stdout) { rl.question('Video linki: ', function (url) { download(url,tür); }) } else {
            var text = stdout.split('\n').join("").split("\r").join("")
            if (!text.startsWith("https://www.youtube.com/watch?") && !text.startsWith("https://youtu.be/")) {
                rl.question('Video linki: ', function (url) { download(url,tür); })
            } else {
                download(text,tür)
            }
        }
    })
});

function download(url,tür) {
    if (tür === "1") {
        video = ytdl(url, { quality: 'highest' })
        video.on('info', (info) => {
            console.log(`İndiriliyor bittiğinde otomatik kapanıcaktır`);
                yer = folders.video
                video.pipe(fs.createWriteStream(path.join(yer, fixtext(info.videoDetails.title) + '.mp4')))
                video.on('end', function (info) { process.exit(0) })
            }) 
    } else { 
        video = ytdl(url, { quality: 'highestaudio' })
        video.on('info', (info) => {
            console.log(`İndiriliyor bittiğinde otomatik kapanıcaktır`);    
                yer = folders.music
                ffmpeg(video).audioBitrate(128).save(path.join(yer, fixtext(info.videoDetails.title) + '.mp3')).on('progress', p => {
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(`${p.targetSize}kb indirildi ${p.currentKbps}kb/s ${p.timemark}`)
                }).on('end', () => { process.exit(0) });
            })
    }
        rl.close();
}
function fixtext(text){var temptext = ""
    alphabet = Array.from("0123456789AaÀàÁáÂâÃãÄäBbCcÇçDdÈèÉéÊêËëFfGgHhÌiìÍíÎîÏïJjKkLlMmNnÑñOoÒòÓóÔôÕõÖöPpQqRrSsTtÙùÚúÛûÜüVvWwXxÝýŸÿZz ");
    for (i=0; i<text.length; i++){if(alphabet.filter((z)=>z == text[i]).length) temptext += text[i]}
    return temptext
}