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
            // console.log(currentline[j]);
            obj[headers[j]] = currentline[j].slice(1, -1);
        }
        result.push(obj);
    }
    return result;
}


/////// data processing functions





function processData(watch_data_json) {
    /////// setup loop to read all data lines
    console.log(watch_data_json.length)
    for (let i = 0; i < watch_data_json.length; i++) {
        const title = watch_data_json[i]["Title"];
        const date = watch_data_json[i]["Date"];

        m = {
            "title": "",
            "id": 0,
            "media_type": "",
            "runtime": 0
        }

        /////// send an async http request to tmdb for data on movie/show
        console.log("sending request")
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdb_api_key}&language=en-US&query=${title}&page=1&include_adult=false`)
            .then(response => response.json())
            .then((response_json) => {
                // console.log(response_json);
                
                // get id and media type
                m["id"] = response_json["results"][0]["id"];
                m["media_type"] = response_json["results"][0]["media_type"];

                // get runtime
                if (m["media_type"] == "tv") {
                    fetch(`https://api.themoviedb.org/3/tv/${m['id']}?api_key=${tmdb_api_key}&language=en-US`)
                        .then(response => response.json())
                        .then((response_json1) => {
                            m["runtime"] = response_json1["episode_run_time"][0];
                        })
                        .then(console.log(m))
                        .catch(m["runtime"] = 22)
                }
                else if (m["media_type"] == "movie") {
                    fetch(`https://api.themoviedb.org/3/movie/${m['id']}?api_key=${tmdb_api_key}&language=en-US`)
                        .then(response => response.json())
                        .then((response_json1) => {
                            m["runtime"] = response_json1["runtime"];
                        })
                        .then(console.log(m))
                        .catch(m["runtime"] = 120)
                }
            })
            .catch(error => console.log(error));

        /////// when request is finished update stats
        stats["number_of_titles_watched"]+=1;

        if(m["media_type"] == "movie"){
            stats["number_of_movies_watched"]+=1;
        } else if(m["media_type"] == "tv"){
            stats["number_of_tvepisodes_watched"]+=1;
        }
    }
}

/////// cookie storage

// function formatDate() {
//     var d = new Date(),
//         month = '' + (d.getMonth() + 1),
//         day = '' + d.getDate(),
//         year = d.getFullYear();

//     if (month.length < 2)
//         month = '0' + month;
//     if (day.length < 2)
//         day = '0' + day;

//     return [year, month, day].join('-');
// }

// function createCookies() {
//     let cur_date = formatDate();

//     document.cookie = `last_updated=${cur_date}; path=/`;
//     document.cookie = `stats=${stats}; path=/`;
// }


/////// run code
document.getElementById('file-selector')
    .addEventListener('change', function () {
        var fr = new FileReader();
        fr.onload = function () {
            /////// convert data into json
            const netflix_watch_data = convert_csv_to_json(fr.result);
            console.log(netflix_watch_data);
            /////// process data
            // check when the last update was to the users data based on cookies to avoid wasted time
            // const date1 = new Date('7/13/2010');
            // const date2 = new Date('12/15/2010');
            // const diffTime = Math.abs(date2 - date1);
            // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


            processData(netflix_watch_data);







            /////// store data as cookies
            // createCookies();

            /////// redirect to data page
        }
        fr.readAsText(this.files[0]);
    }) 