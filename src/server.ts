//express in ts
import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
/* import multer from 'multer'; */
import ytdl from 'ytdl-core';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
/* import path from 'path'; */
/* import fs from 'fs'; */
/* import {fileURLToPath} from 'url'; */
/* const __filename = fileURLToPath(import.meta.url); */
/* const __dirname = path.dirname(__filename); */
Ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
/* const tempDir = path.join(__dirname,'./temp'); */
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
                            ffmpeg.on('end', () => {
                                console.log('conversion ended');
                                resolve('done');
                            })
                        })
                        ffmpeg.writeToStream(res,{end:true})
                        await conversionPromise;
                       /*  ffmpeg.save(path.join(tempDir,'output.mp3'));
                        await conversionPromise; */
            
                    }                         
            

                await handleUrl();
                    console.log('done converting');
                    
                   /*  const fileStream = fs.createReadStream(`${__dirname}/temp/output.mp3`)
                    fileStream.on('open',()=>{ */
                        /* res.set({
                            'Content-Type':'audio/mpeg',
                            'Content-Disposition': 'attachment; filename="output.mp3"'
                        }) */
                   /*  res.attachment('output.mp3')
                        fileStream.pipe(res)
                    })
                    fileStream.on('error',err=>{
                        res.send('Error: ' + err)
                    })
 */






                   /*  const file = path.join(tempDir,'output.mp3');
                    const stat = fs.statSync(file);
                    const fileSize = stat.size;
                    const range =  _req.headers.range;
                    if(range){
                        const parts = range.replace(/bytes=/,"").split("-");
                        const start = parseInt(parts[0],10);
                        const end = parts[1] ? parseInt(parts[1],10) : fileSize-1;
                        const chunksize = (end-start)+1;
                        const fileStream = fs.createReadStream(file,{start,end});
                        console.log("start: "+ start + " end: " + end + " chunksize: " + chunksize);
                        const head = {
                            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': chunksize,
                            'Content-Type': 'audio/mpeg',
                            'Content-disposition':'attachment; filename=output.mp3'
                        }
                        res.writeHead(206,head);
                        fileStream.on('error', (err) => {
                            console.error('Error reading file:', err);
                            res.end();
                          });
                        fileStream.pipe(res)
                        
                    }
                    else{
                        const head = {
                            'Content-Length': fileSize,
                            'Content-Type': 'audio/mpeg'
                        }
                        res.writeHead(200,head);
                        fs.createReadStream(file)
                        .pipe(res,{end:true})
                        
                      
                    } */
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



