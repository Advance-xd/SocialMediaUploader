const args = process.argv.slice(2);

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

async function getRedditVideos(reddit) {
    if (!fs.existsSync("./reddit")) {
        fs.mkdirSync("./reddit");
    }
    const topPosts = await getTopRedditPosts(reddit)
    fs.writeFileSync("./reddit/videosdata.json", JSON.stringify(topPosts, null, 4));

    for (let i = 0; i < topPosts.length; i++){
        let videoUrl = await getvideoURL(topPosts[i].data.url)
        //console.log(videoUrl)
        
        await downloadM3U8(videoUrl, "./reddit/video_" + i + ".mp4", i)
    }
}



async function getvideoURL(url) {
    try {
        console.log(url)
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);
        let videoUrl = $('shreddit-player').attr('src');
        if (videoUrl == undefined){
            videoUrl = $('shreddit-player-2').attr('src');
        }
        return videoUrl
    } catch {
        console.log("Error getting video download url")
        await new Promise(resolve => setTimeout(resolve, 3000));
        return await getvideoURL(url)
    }
    
}

const ffmpeg = require('fluent-ffmpeg');
const backgroundVideo = false

async function downloadM3U8(m3u8Url, outputPath, id) {
    if (backgroundVideo){
        return new Promise((resolve, reject) => {
            const musicPath = "./backmusic2.mp3"
            const backvideo = "./backvideo.mp4"
            console.log("Video URL:", m3u8Url);
            console.log("Output Path:", outputPath);
            console.log("Music Path:", musicPath);
    
            const command = ffmpeg(m3u8Url)
                .input(backvideo) // Input the background video
                .input(musicPath) // Input the background music
                .outputOptions('-c:v libx264') // Use libx264 for video encoding
                .outputOptions('-c:a aac') // Use AAC codec for audio
                .outputOptions('-filter_complex', 
                    // Scale the background video to 1080x1920
                    '[1:v]scale=1080:1920,format=yuva420p[bg];' +
                    // Scale the main video to its original size
                    '[0:v]scale=1.5*iw:1.5*ih, format=yuva420p[main];' +
                    // Overlay the main video centered on the background video
                    '[bg][main]overlay=(W-w)/2:(H-h)/2[outv];' +
                    // Adjust volume of the background music to 60%
                    '[2:a]volume=0.4[a1];' +
                    // Combine the main video's audio with the adjusted background music
                    '[0:a][a1]amerge=inputs=2[a]'
                )
                .outputOptions('-map', '[outv]') // Map the final video stream
                .outputOptions('-map', '[a]') // Map the final audio stream
                .outputOptions('-shortest') // Ensure the output duration matches the shortest input
                .on('end', () => {
                    console.log(`Downloaded and saved to ${outputPath}`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error: ', err.message);
                    reject(err);
                })
                .output(outputPath);
            
            command.run();
        });
    } else {
        return new Promise((resolve, reject) => {
            console.log(m3u8Url + " " + outputPath)
            ffmpeg(m3u8Url)
                .outputOptions('-c copy') // Copy codec to avoid re-encoding
                .on('end', () => {
                    console.log(`Downloaded and saved to ${outputPath}`);
                    //if (id == videos - 1){
                    //    uploadVideo(0)
                    //}
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error: ', err.message);
                    reject(err);
                })
                .output(outputPath)
                .run();
        });
    }
    

    
}


let topVideoPosts = []


const fetchlimit = 200
const videos = 7
const maxvideolength = 16
const minvideolength = 5

const blacklist = [
    "https://v.redd.it/k7704o4lllkd1",
    "https://v.redd.it/nn51qct4b9nd1"
]

// Fetch the top 7 posts from the r/WarthunderMemes subreddit
async function getTopRedditPosts(reddit) {
    const response = await axios.get('https://www.reddit.com/r/'+reddit+'/top/.json?limit='+fetchlimit+'&t=week');
    console.log(response.status)
    console.log(response.data.data.childern)

    
    const posts = response.data.data.children;
    
    // Filter out non-video posts and get only the videos
    let videoPosts = posts.filter(post => {
        const url = post.data.url;
        return (url.includes('youtube.com') || url.includes('youtu.be') || post.data.is_video) && blacklist.includes(url) == false;
    });

    videoPosts = videoPosts.filter(post => {
        console.log(post.data.media.reddit_video.duration)
        return minvideolength < post.data.media.reddit_video.duration && post.data.media.reddit_video.duration < maxvideolength;
    });

    topVideoPosts = videoPosts.slice(0, videos);
    console.log(posts.length)
    // Output the top video posts
    topVideoPosts.forEach((post, index) => {
        console.log(`${index + 1}. Title: ${post.data.title}`);
        console.log(`   URL: ${post.data.url}`);
        console.log(`   Author: ${post.data.author}`)
        console.log(`   Upvotes: ${post.data.ups}\n`);
    });

    return topVideoPosts

}

const commands = [
    getRedditVideos
]

async function main() {
    console.log(args[1])
    //commands[args[0]]([args[1]]);
    getRedditVideos(args[1])
    
}

main()