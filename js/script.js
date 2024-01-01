console.log("JS now");
let currentSong = new Audio();
let songs;
let currFolder;
let curf;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //to show songs
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        let songName = decodeURIComponent(song.split('/').pop().replace(/\.(mp3)$/, '')).replaceAll("%20", " ");
        songUL.innerHTML += `<li>
        <img class="invert" width="34" src="images/music.svg" alt="">
        <div class="info">
            <div>${songName}</div>
            
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="images/play.svg" alt="">
        </div>
    </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs
}

const playMusic = (track) => {
    console.log(track);
    currentSong.src = `/${currFolder}/` + track + ".mp3";
    // if (!pause) {
    //     currentSong.play()
    // }
    currentSong.play()
    play.src = "images/pause.svg"
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("http://127.0.0.1:3000/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            curf = folder
            //getting metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="20" fill="#000" />
                    
                                <path d="M15 30V10L25 20L15 30Z" stroke="#141B34" fill="#fff" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="http://127.0.0.1:3000/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //loading playlists on click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            songs[0] = decodeURIComponent(songs[0].split('/').pop().replace(/\.(mp3)$/, '')).replaceAll("%20", " ")
            playMusic(songs[0])
        })
    })

}


async function main() {
    await getSongs("songs/default");


    displayAlbums()
    //To attach an event listener to song buttons :)
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    //time updating event listener
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //event listener for cross
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //event listener for prev
    previous.addEventListener("click", () => {
        currentSong.pause();
        curf = currFolder
        let curr = currentSong.src.replace(`http://127.0.0.1:3000/${curf}/`, "");
        const index = songs.indexOf(curr)
        if ((index - 1) >= 0) {
            const nextSong = songs[index - 1];
            const nextSongName = decodeURIComponent(nextSong.split('/').pop().replace(/\.(mp3)$/, '')).replaceAll("%20", " ");
            console.log("Next clicked");
            playMusic(nextSongName);
        }
    });


    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        curf = currFolder
        let curr = currentSong.src.replace(`http://127.0.0.1:3000/${curf}/`, "");
        const index = songs.indexOf(curr);
        if (index !== -1 && index + 1 < songs.length) {
            const nextSong = songs[index + 1];
            const nextSongName = decodeURIComponent(nextSong.split('/').pop().replace(/\.(mp3)$/, '')).replaceAll("%20", " ");
            console.log("Next clicked");
            playMusic(nextSongName);
        }
    });


    //event listener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })


    //event listener to mute volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10

        }
    })


}

main();
