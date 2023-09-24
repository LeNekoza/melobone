import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
Ffmpeg.setFfmpegPath(ffmpegPath);
const app = express();
const port = 3000;
app.use(express.urlencoded());
app.use(express.json());
app.use(express.text());
app.use(cors());
app.get('/', (_req, res) => {
    res.send('Hello World!');
});
app.post('/', (_req, res) => {
    if (typeof _req.body === 'string') {
        try {
            const handleUrl = async () => {
                const info = await ytdl.getInfo(_req.body);
                const format = ytdl.chooseFormat(info.formats, { quality: 'highest',
                    filter: 'audioonly'
                });
                res.set({ "Content-Type": "audio/mpeg" });
                await new Promise((resolve, reject) => {
                    const ffmpegCommand = Ffmpeg().input(ytdl.downloadFromInfo(info, {
                        format: format
                    }))
                        .audioBitrate(128)
                        .audioCodec('libmp3lame')
                        .format('mp3')
                        .on('end', () => console.log('Done converting'))
                        .on('error', () => console.log('Error while converting'));
                    resolve(ffmpegCommand.pipe(res));
                    reject('Error while converting' + "\n" + ffmpegCommand);
                });
            };
            handleUrl();
        }
        catch (err) {
            console.log(err);
            res.end('Error in parsing url');
        }
    }
});
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map