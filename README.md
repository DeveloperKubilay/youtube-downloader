# youtube-downloader
Nodejs'den hem video hem müzik indirme uygulaması video editleme'si için mükemmel

Kurulum: npm init -y && npm i readline fs ytdl-core path fluent-ffmpeg @ffmpeg-installer/ffmpeg
```js
const readline = require('readline'), fs = require('fs'), ytdl = require('ytdl-core'), path = require('path'), ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Video ise 1'i Müzikse 2'yi tuşlayınız: ", function (tür) {
    rl.question('Video linki: ', function (url) {
        rl.question('Dosya konumu girin: ', function (yer) {
            if(!tür || !url || !yer) return console.log("Bazı yerleri unutun galiba");
            video = ytdl(url, { quality: 'highestaudio' })
            video.on('info', (info) => {
                console.log(`İndiriliyor`);
                if (tür === "1") {
                    video.pipe(fs.createWriteStream(path.join(yer, fixtext(info.videoDetails.title) + '.mp4')))
                    video.on('end', function (info) { process.exit(0) })
                } else {
                    ffmpeg(video).audioBitrate(128).save(path.join(yer, fixtext(info.videoDetails.title) + '.mp3')).on('progress', p => {
                        readline.cursorTo(process.stdout, 0);
                        process.stdout.write(`${p.targetSize}kb indirildi ${p.currentKbps}kb/s ${p.timemark}`)
                    }).on('end', () => { process.exit(0) });
                } rl.close();
            })
        })
    })
});
function fixtext(text){var temptext = ""
    alphabet = Array.from("0123456789AaÀàÁáÂâÃãÄäBbCcÇçDdÈèÉéÊêËëFfGgHhÌiìÍíÎîÏïJjKkLlMmNnÑñOoÒòÓóÔôÕõÖöPpQqRrSsTtÙùÚúÛûÜüVvWwXxÝýŸÿZz ");
    for (i=0; i<text.length; i++){if(alphabet.filter((z)=>z == text[i]).length) temptext += text[i]}
    return temptext
}
```
