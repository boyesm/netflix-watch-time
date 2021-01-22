const tmdb_api_key = '237f6b5d8de5e8cd30158e7ca0215232';

// get csv file

let uploadedFile;

const fileSelector = document.getElementById('file-selector')

fileSelector.addEventListener('change', function () {
    var fr = new FileReader();
    fr.onload = function () {

        uploadedFile = fr.result
        console.log("file is uploaded");

    }
    fr.readAsText(this.files[0]);
})


// convert to json
function convert_csv_to_json(csv) {
    
    return new Promise((resolve) => {
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(",");
        for (var i = 1; i < lines.length - 1; i++) {
            var obj = {};
            var currentline = lines[i].split(",");
            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j].slice(1, -1);
            }
            result.push(obj);
        }
        resolve(result);
    })
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

// collect movie data
function fetch_watch_data(watch_data_json){
    return new Promise((resolve, reject) => {
        
        let movie_stats = [];
        let prom_array = [];
    
        for (let i = 0; i < watch_data_json.length; i++) {
            
            let title = watch_data_json[i]["Title"].split(": ")[0];
    
            let m = {
                "title": title,
                "id": 0,
                "release_date": "",
                "media_type": "",
                "runtime": 0,
                "cover": "",
            }
    
            let prom = fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdb_api_key}&language=en-US&query=${title}&page=1&include_adult=false`)
                .then(response => response.json())
                // .then(response => console.log(response["results"][0]))
                .then(response_json => { // proces initial api request
                    // console.log(response_json["results"][0])
                    // get id and media type
                    m["id"] = response_json["results"][0]["id"];
                    // console.log(response_json["results"][0]["id"])
                    m["media_type"] = response_json["results"][0]["media_type"];
                    // console.log(response_json["results"][0]["media_type"])
                    m["cover"] = "https://image.tmdb.org/t/p/w500" + response_json["poster_path"];
    
                    // get runtime
                    if (m["media_type"] == "tv") {
                        return fetch(`https://api.themoviedb.org/3/tv/${m['id']}?api_key=${tmdb_api_key}&language=en-US`)
                    }
                    else if (m["media_type"] == "movie") {
                        return fetch(`https://api.themoviedb.org/3/movie/${m['id']}?api_key=${tmdb_api_key}&language=en-US`)
                    }
                })
                .then(response => response.json())
                .then(response_json => { // process second api request
                    if (m["media_type"] == "tv") {
                        try {
                            if(isNaN(response_json["episode_run_time"][0]) == false){
                                m["runtime"] = response_json["episode_run_time"][0];
                            } else {
                                m["runtime"] = 22
                            }
                        }
                        catch{
                            m["runtime"] = 22
                        }
                    }
                    else if (m["media_type"] == "movie") {
                        try {
                            if(isNaN(response_json["runtime"]) == false){
                                m["runtime"] = response_json["runtime"];
                            } else {
                                m["runtime"] = 120
                            }
                        }
                        catch{
                            m["runtime"] = 120
                        }
                    }
                })
                .then(movie_stats.push(m))
                .then(console.log("done"))
            
            prom_array.push(prom);

            sleep(10);

        }
    
        Promise.allSettled(prom_array).then(() => {
            resolve(movie_stats);
        })
    })
}


// process stats
async function calc_time_watched(movie_stats){

    let time_watched = 0;

    for (let i = 0; i < movie_stats.length; i++) {

        time_watched += movie_stats[i]["runtime"];

        sleep(10)

    }

    return time_watched;
}

async function calc_titles_watched(movie_stats){
    let titles_watched = 0;
    let movies_watched = 0;
    let episodes_watched = 0;

    for (let i = 0; i < movie_stats.length; i++) {
        titles_watched += 1;
        if (movie_stats[i]["media_type"] == "movie"){
            movies_watched += 1;
        }
        else if (movie_stats[i]["media_type"] == "tv"){
            episodes_watched += 1;
        }
        sleep(10)
    }

    return [titles_watched, movies_watched, episodes_watched];
}

function minutesToString(minutes) {
    let out = ""
    const seconds = minutes * 60;
    var numyears = Math.floor(seconds / 31536000);
    var numdays = Math.floor((seconds % 31536000) / 86400);
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);

    numyears + " years " + numdays + " days " + numhours + " hours " + numminutes + " minutes"

    if(numyears > 0){
        out += (numyears + " years ");
    }
    if(numdays > 0){
        out += (numdays + " days ");
    }
    if(numhours > 0){
        out += (numhours + " hours ");
    }
    if(numminutes > 0){
        out += (numminutes + " minutes");
    }

    return out;
}

function main2(){
    document.getElementById("loading").style.display = "block";
    
    setTimeout(() => {
        main();
    }, 1000);
}

async function main(){

    console.log("HERE!")

    // sleep(10);

    const watch_data_json = await convert_csv_to_json(uploadedFile);
    const movie_stats = await fetch_watch_data(watch_data_json);
    await new Promise((resolve, reject) => {
        let stat1 = calc_time_watched(movie_stats)
            .then(stat => minutesToString(stat))
            .then(stat => localStorage.setItem("total_watch_time", stat))

        let stat2 = calc_titles_watched(movie_stats)
            .then(out => {
                localStorage.setItem("titles_watched", out[0]);
                localStorage.setItem("movies_watched", out[1]);
                localStorage.setItem("episodes_watched", out[2]);
            })

        Promise.allSettled([stat1, stat2]).then(() => {
            resolve();
        })
    })

    document.getElementById("loading").style.display = "none";
    
    
    // redirect
    window.location.href = "./data.html"

}