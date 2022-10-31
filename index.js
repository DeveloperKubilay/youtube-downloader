const readline = require('readline'), latinize = require('latinize'), fs = require('fs'), ytdl = require('ytdl-core'), path = require('path'), ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Video ise 1'i Müzikse 2'yi tuşlayınız: ", function (tür) {
    rl.question('Video linki: ', function (url) {
        video = ytdl(url, { quality: 'highestaudio' })
        video.on('info', (info) =>{ 
                console.log(`İndiriliyor bittiğinde otomatik kapanıcaktır`);
                if (tür === "1") {
                    yer = "C:\\Users\\kubil\\Desktop\\edit\\fidyo"
                    video.pipe(fs.createWriteStream(path.join(yer, latinize(info.videoDetails.title) + '.mp4')))
                    video.on('end', function (info) { process.exit(0) })
                } else {
                    yer = "C:\\Users\\kubil\\Desktop\\edit\\müzik"
                    ffmpeg(video).audioBitrate(128).save(path.join(yer, latinize(info.videoDetails.title) + '.mp3')).on('progress', p => {
                        readline.cursorTo(process.stdout, 0);
                        process.stdout.write(`${p.targetSize}kb indirildi ${p.currentKbps}kb/s ${p.timemark}`)
                    }).on('end', () => { process.exit(0) });
                } rl.close();
            })
    })
});
