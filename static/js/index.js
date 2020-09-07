/////// data

const tmdb_api_key = '237f6b5d8de5e8cd30158e7ca0215232';

let stats = {
    "number_of_titles_watched": 0,
    "number_of_movies_watched": 0,
    "number_of_tvepisodes_watched": 0,
    "total_time_watched_min": 0,
    "first_day_watched": 0,
    "first_show_watched": "",
    "time_watched_per_year": [0],
    "time_watched_per_month": [[0]],
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



function processData(watch_data_json) {
    /////// setup loop to read all data lines

    let allFetchReq = [];

    for (let i = 0; i < watch_data_json.length; i++) {
        let title = watch_data_json[i]["Title"].split(": ")[0];
        let date = watch_data_json[i]["Date"];

        let m = {
            "title": watch_data_json[i]["Title"].split(": ")[0],
            "id": 0,
            "release_date": "",
            "media_type": "",
            "runtime": 0
        }

        /////// send an async http request to tmdb for data on movie/show
        console.log("sending request")
        let newFetchReq = fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdb_api_key}&language=en-US&query=${title}&page=1&include_adult=false`)
            .then(response => response.json())
            .then(response_json => {

                console.log(response_json);

                // get id and media type
                m["id"] = response_json["results"][0]["id"];
                // console.log(response_json["results"][0]["id"])
                m["media_type"] = response_json["results"][0]["media_type"];
                // console.log(response_json["results"][0]["media_type"])

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
                console.log(response_json1);
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

                ///// quantity

                // titles watched
                stats["number_of_titles_watched"] += 1;

                // movies/tv watched
                if (m["media_type"] == "movie") {
                    stats["number_of_movies_watched"] += 1;
                } else if (m["media_type"] == "tv") {
                    stats["number_of_tvepisodes_watched"] += 1;
                }


                ///// time

                // total time watched
                stats["total_time_watched_min"] += m["runtime"];

                // time spent watching each movie/tv show

                // time spent watching movies

                // time spent watching tv shows

                // first media watched

                // most netflix watched in one day

                // how long have you been watching netflic for




                // console.log(m)
            })

            .catch((error) => {
                console.log(error);
            });

        allFetchReq.push(newFetchReq);

    }

    Promise.allSettled(allFetchReq)
        .then(console.log("ALL FETCH REQS HAVE CONCLUDED!!!"))
        // .then(createCookies()) /// create cookies
        .then(console.log(stats))
    // .then(window.location.href = "data.html") // redirect!!! to data page
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
