import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import ytdl from '@distube/ytdl-core';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

Ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

const app = express();
const port = 5000;

app.use(express.urlencoded());
app.use(express.json());
app.use(express.text());
app.use(cors());

app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World!');
});

app.post('/', (_req: Request, res: Response) => {
    async function handleFile() {
        if (typeof _req.body === 'string') {
            try {
                const handleUrl = async () => {
                    const info = await ytdl.getInfo(_req.body, {
                        requestOptions: {
                            headers: {
                                'User-Agent': 'Mozilla/5.0'
                            }
                        }
                    });

                    const format = ytdl.chooseFormat(info.formats, {
                        quality: 'highestaudio',
                        filter: 'audioonly',
                    });

                    const file = ytdl.downloadFromInfo(info, {
                        format: format,
                        requestOptions: {
                            headers: {
                                'User-Agent': 'Mozilla/5.0'
                            }
                        }
                    });

                    const ffmpeg = Ffmpeg()
                        .input(file)
                        .outputOptions('-preset', 'ultrafast')
                        .audioBitrate(128)
                        .audioCodec('libmp3lame')
                        .format('mp3');

                    const conversionPromise = new Promise((resolve, reject) => {
                        ffmpeg.on('end', () => {
                            console.log('conversion ended');
                            resolve('done');
                        }).on('error', (err: any) => {
                            console.error('Error in conversion:', err);
                            reject(err);
                        });
                    });

                    ffmpeg.writeToStream(res, { end: true });
                    await conversionPromise;
                };

                await handleUrl();
                console.log('writing to stream done');
            } catch (err:any) {
                console.log(err);
                if (err.message.includes('Status code: 403')) {
                    res.status(403).send('Error: Access forbidden. The requested resource may require proper authentication or may be restricted.');
                } else {
                    res.status(500).send('Error in parsing URL or processing file');
                }
            }
        } else {
            res.status(400).send('Invalid input');
        }
    }
    handleFile();
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
