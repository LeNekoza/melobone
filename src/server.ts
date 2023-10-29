//express in ts
import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
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

app.post('/',(_req: Request, res: Response) => {
    async function handleFile(){
    if(typeof _req.body === 'string') {
        try{
            const handleUrl = async () => {
                const info = await ytdl.getInfo(_req.body as string);
                const format = ytdl.chooseFormat(info.formats, 
                { quality: 'highest',
                  filter: 'audioonly' 
                })
                const ffmpeg = 
                Ffmpeg().input(ytdl.downloadFromInfo(info,{
                        format: format }))
                        .outputOptions('-preset','ultrafast')
                        .audioBitrate(128)
                        .audioCodec('libmp3lame')
                        .format('mp3')
                       
                        const conversionPromise = new Promise((resolve,reject) => {
                            ffmpeg.on('error', (err) => {
                                console.error('Error in conversion:', err);
                                reject(err);
                            })
                           .on('end', () => {
                                console.log('conversion ended');
                                resolve('done');
                            })  
                        })
                        ffmpeg.writeToStream(res,{end:true})
                        await conversionPromise;
                        
                    }                         
                await handleUrl();
                    console.log('writing to stream done');
        }
        catch(err){
            console.log(err);
            res.end('Error in parsing url');
        }
    }
}
handleFile();
});


app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});



