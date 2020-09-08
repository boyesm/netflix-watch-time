/////// data

const tmdb_api_key = '237f6b5d8de5e8cd30158e7ca0215232';

let stats = {
    "number_of_titles_watched": 0,
    "number_of_movies_watched": 0,
    "number_of_tvepisodes_watched": 0,
    "total_time_watched_min": 0,
    "total_time_watched_string": "",
    "first_day_watched": 0,
    "first_show_watched": "",
    "time_watched_per_year": [0],
    "year_labels": [],
    "media_watch_data": {}, // {"title": {"time_min": 12, "img": "https:///imglink"}, ...}
    "most_watched": [], //[{"title": "breaking bad", "time": 12h, "img": "https:///imglink"}, ...]
};


/////// csv functions
function convert_csv_to_json(csv) {
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
    return result;
}

/////// data processing functions

// cookie storage

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}


function createCookies() {
    let cur_date = formatDate();

    console.log("CREATIN COOKE:")

    setCookie("last_updated", cur_date, 100);
    setCookie("stats", JSON.stringify(stats), 100);
}

// dates

function toDateObj(dateString) {
    let parts = dateString.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
}


//create button

// function createButton() {
//     let nextLink = document.createElement("A");
//     nextLink.innerHTML = "See your data!";

//     let att = document.createAttribute("class");
//     att.value = "btn btn-primary btn-lg";
//     nextLink.setAttributeNode(att);

//     att = document.createAttribute("href");
//     att.value = "data.html";
//     nextLink.setAttributeNode(att);

//     att = document.createAttribute("role");
//     att.value = "button";
//     nextLink.setAttributeNode(att);

//     document.getElementById("next-button").appendChild(nextLink);
// }

function minutesToString(minutes) {
    const seconds = minutes * 60;
    var numyears = Math.floor(seconds / 31536000);
    var numdays = Math.floor((seconds % 31536000) / 86400);
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    return numyears + " years " + numdays + " days " + numhours + " hours " + numminutes + " minutes";
}

function createYearLabels(last_year) {
    let years = []

    const cur_year = new Date().getFullYear()

    for (let i = 0; i < cur_year - last_year; i++) {
        years.push(cur_year - i);
    }

    return years;
}

function createStats() {
    // time watched string
    minutesToString(stats["total_time_watched_min"]);

    // Time Watched per Year
    stats["year_labels"] = createYearLabels(2010);


    // Most Watched
    let temp_arr = [];

    console.log(stats["media_watch_data"])

    for (let i = 0; i < Object.keys(stats["media_watch_data"]).length; i++) {
        temp_arr.push([Object.keys(stats["media_watch_data"])[i], stats["media_watch_data"][Object.keys(stats["media_watch_data"])[i]]["time_min"]]);
    }

    console.log(temp_arr)

    temp_arr.sort(function(a, b) {
        return a[1] - b[1];
    });

    console.log(temp_arr)

    for(let i = 0; i < 3; i++){
        stats["most_watched"].push({"title": temp_arr[2-i][0], "time": minutesToString(temp_arr[2-i][1]), "img": stats["media_watch_data"][temp_arr[2-i][0]]["img"]});
        // stats["most_watched"].push({"title": temp_arr[i][0], "time": temp_arr[i][0], "img": stats["media_watch_data"][temp_arr[i][0]]["time_min"]});
    }

    console.log(stats["most_watched"])


    // console.log(stats);
    // console.log(stats["number_of_movies_watched"]);
    // console.log(stats["total_time_watched_min"]);

}

function processData(watch_data_json) {
    /////// setup loop to read all data lines

    let allFetchReq = [];

    const cur_year = new Date().getFullYear()

    for (let i = 0; i < watch_data_json.length; i++) {
        let title = watch_data_json[i]["Title"].split(": ")[0];

        if (title[0] == "\"" && title[title.length - 1] == "\"") {
            title = title.substring(1, -1)
        }


        let date = toDateObj(watch_data_json[i]["Date"]);

        let m = {
            "title": title,
            "id": 0,
            "release_date": "",
            "media_type": "",
            "runtime": 0,
            "cover": "",
        }

        allFetchReq.push(0)

        /////// send an async http request to tmdb for data on movie/show
        console.log("sending request")
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdb_api_key}&language=en-US&query=${title}&page=1&include_adult=false`)
            .then(response => response.json())
            .then(response_json => {

                // console.log(response_json);

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
            .then(response1 => response1.json())
            .then(response_json1 => {
                // console.log(response_json1);
                if (m["media_type"] == "tv") {
                    try {
                        m["runtime"] = response_json1["episode_run_time"][0];
                    }
                    catch{
                        m["runtime"] = 22
                    }
                }
                else if (m["media_type"] == "movie") {
                    try {
                        m["runtime"] = response_json1["runtime"];
                    }
                    catch{
                        m["runtime"] = 120
                    }
                }
            })
            .then(() => { // process stats

                // titles watched
                stats["number_of_titles_watched"] += 1;

                // movies/tv watched
                if (m["media_type"] == "movie") {
                    stats["number_of_movies_watched"] += 1;
                } else if (m["media_type"] == "tv") {
                    stats["number_of_tvepisodes_watched"] += 1;
                }

                // total time watched (minutes)
                stats["total_time_watched_min"] += m["runtime"];

                // time spent watching each movie/tv show
                if (m["title"] in stats["media_watch_data"]) {
                    stats["media_watch_data"][m["title"]]["time_min"] += m["runtime"];
                } else {
                    stats["media_watch_data"][m["title"]] = {
                        "time_min": m["runtime"],
                        "img": m["cover"],
                    }
                }

                // first media watched
                if (i == watch_data_json.length - 1) {
                    stats["first_show_watched"] = title;
                    stats["first_day_watched"] = date;
                }

                // time watched each year               

                if ((cur_year - parseInt(date.getFullYear())) > stats["time_watched_per_year"].length) {
                    // console.log(stats["time_watched_per_year"])
                    stats["time_watched_per_year"].push(m["runtime"])
                } else {
                    stats["time_watched_per_year"][(cur_year - parseInt(date.getFullYear()))] += m["runtime"];
                }



                allFetchReq[i] = 1;
                console.log(m)
            })

            .catch((error) => {
                allFetchReq[i] = 1;
                console.log(error);
            });

    }

    function completedFetch() {
        console.log("ALL FETCH REQS HAVE CONCLUDED!!!")

        // console.log(stats)

        createStats()
        createCookies() /// create cookies

        console.log(stats);

        // window.location.href = "data.html" // redirect!!! to data page
    }

    function checkIfDone() {
        let a = allFetchReq.every(freq => { return freq === 1 });
        if (a) {
            clearInterval(req);
            completedFetch();
        }
        return;
    }

    console.log("GOT HERE")

    let req = setInterval(checkIfDone, 100)
}




/////// run code
let uploadedFile;

document.getElementById('file-selector')
    .addEventListener('change', function () {
        var fr = new FileReader();
        fr.onload = function () {

            uploadedFile = fr.result
            console.log("file is uploaded");
            // undisable submit button

        }
        fr.readAsText(this.files[0]);
    })


function submitCSV() {
    const new_file = convert_csv_to_json(uploadedFile);
    console.log(new_file);
    processData(new_file);
}
