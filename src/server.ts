//express in ts
import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
/* import multer from 'multer'; */
import ytdl from 'ytdl-core';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

Ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
/* const storage = multer.diskStorage({
    filename: function (_req, file, cb) {
        cb(null, file.originalname)
    },
    destination: function (_req, _file, cb) {
        cb(null, './uploads')
    }
})

const upload = multer({storage});
 */
const app = express();
const port = 3000;
app.use(express.urlencoded());
app.use(express.json());
app.use(express.text());
app.use(cors());
app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World!');
});

app.post('/',(_req: Request, res: Response) => {
    if(typeof _req.body === 'string') {
        try{
            const handleUrl =async () => {
                const info = await ytdl.getInfo(_req.body as string);
                const format = ytdl.chooseFormat(info.formats, 
                { quality: 'highest',
                  filter: 'audioonly' 
                });
                res.setHeader('Content-Type', 'audio/mpeg'),
                res.setHeader('Transfer-Encoding', 'chunked');
                res.setHeader('Accept-Ranges', 'bytes');
                    /* Ffmpeg().input(ytdl.downloadFromInfo(info,{
                        format: format }))
                        .audioBitrate(128)
                        .audioCodec('libmp3lame')
                        .format('mp3')
                        .on('error',(err) => {console.log(err); res.end('Error in converting')})  
                        .pipe(res,{end:true});  */   
                        Ffmpeg().input(format.url).inputOptions([
                            '-reconnect 1',
                            '-reconnect_streamed 1',
                            '-reconnect_delay_max 5',
                            '-reconnect_at_eof 1'

                        ]).audioBitrate(128)
                        .audioCodec('libmp3lame')
                        .format('mp3')
                        .on('error',(err) => {console.log(err); res.end('Error in converting')})
                        .pipe(res,{end:true});        
            }
            
            handleUrl();
        }
        catch(err){
            console.log(err);
            res.end('Error in parsing url');
        }
    }
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});



