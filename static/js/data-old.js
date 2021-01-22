function makeGraph(chart_id, type, data, graph_label, data_label) {
    var ctx = document.getElementById(chart_id).getContext('2d');
    var myChart = new Chart(ctx, {
        type: type,
        data: {
            labels: data_label,
            datasets: [{
                label: graph_label,
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// read cookies

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

const stats = JSON.parse(getCookie("stats"));

// update elements

// total time watched
document.getElementById("total_time_watched").innerHTML = stats["total_time_watched_string"];

// Time Watched per Year graph
makeGraph("time_watched_per_year_graph", "bar", stats["time_watched_per_year"], "Time Watched Per year", stats["year_labels"])

// Another graph


// Average Time Watched per Day of the Week

const day_labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
makeGraph("average_time_watched_per_day_graph", "bar", stats["average_time_watched_per_day_graph"], "Time Watched Per year", day_labels)


// Titles watched
document.getElementById("number_of_titles_watched").innerHTML = stats["number_of_titles_watched"];
document.getElementById("number_of_movies_watched").innerHTML = stats["number_of_movies_watched"];
document.getElementById("number_of_tvepisodes_watched").innerHTML = stats["number_of_tvepisodes_watched"];

// Most Watched

document.getElementById("most_watched_img_1").innerHTML = stats["most_watched"][0]["img"];
document.getElementById("most_watched_title_1").innerHTML = stats["most_watched"][0]["title"];
document.getElementById("most_watched_time_1").innerHTML = stats["most_watched"][0]["time"];
document.getElementById("most_watched_img_2").innerHTML = stats["most_watched"][1]["img"];
document.getElementById("most_watched_title_2").innerHTML = stats["most_watched"][1]["title"];
document.getElementById("most_watched_time_2").innerHTML = stats["most_watched"][1]["time"];
document.getElementById("most_watched_img_3").innerHTML = stats["most_watched"][2]["img"];
document.getElementById("most_watched_title_3").innerHTML = stats["most_watched"][2]["title"];
document.getElementById("most_watched_time_3").innerHTML = stats["most_watched"][2]["time"];



// First, Last, Year Ago Watched

document.getElementById("first_watch_img").innerHTML = stats["first_watch"]["img"];
document.getElementById("first_watch_title").innerHTML = stats["first_watch"]["title"];
document.getElementById("first_watch_date").innerHTML = stats["first_watch"]["date"];
document.getElementById("last_watch_img").innerHTML = stats["last_watch"]["img"];
document.getElementById("last_watch_title").innerHTML = stats["last_watch"]["title"];
document.getElementById("last_watch_date").innerHTML = stats["last_watch"]["date"];
document.getElementById("year_ago_watch_img").innerHTML = stats["year_ago_watch"]["img"];
document.getElementById("year_ago_watch_title").innerHTML = stats["year_ago_watch"]["title"];
document.getElementById("year_ago_watch_date").innerHTML = stats["year_ago_watch"]["date"];