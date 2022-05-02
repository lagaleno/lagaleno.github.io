const info = [
    {
        label: 'frontend',
        title: 'Portfolio (2022)',
        description: 'What you are seeing now is a v0 of my Portfolio, to start I wanted something really simple to code and that I would be able to showcase some projects of mine. I have plans to improve it, using React+Next and the Prismic CMS and also improve the UI as I prototyped in Figma.',
        link: 'https://www.figma.com/proto/9eJbJFeLrxIASbq92vA6V3/porti?page-id=501%3A6&node-id=501%3A7&viewport=241%2C48%2C0.22&scaling=min-zoom&starting-point-node-id=501%3A7',
        link_btn: 'Check out Figma',
    },
    {
        label: 'teaching',
        title: 'Own Python Course (2020)',
        description: 'Throughout my graduation I helped many students to overcome difficulties while learning programming with Python. With that in mind I developed my own "Introduction to Python" course. The slides can be seen in the google drive and at the final of the course I would a apply a survey to measure the quality. (The slides are in Portuguese)',
        link: 'https://drive.google.com/drive/folders/1tYV7tnNlnyZ3EUon1BGrSuLzg-VNonLv?usp=sharing',
        link_btn: 'Check out Slides',
    },
    {
        label: 'ui/ux',
        title: 'Crunchyroll redesign (2020)',
        description: 'In order to learn and practice UI and UX design I decided to propose a new interface to the streaming service Crunchyroll. So I interviewed users to find some usability problems, also run a Heuristic evaluation and collected some references. With that I prototyped a new interface in Figma.',
        link: 'https://www.figma.com/proto/xfnZbI65LANMsqY1Z6EfD4/crunchyroll_project?page-id=0%3A1&node-id=1%3A2&viewport=241%2C48%2C0.03&scaling=min-zoom&starting-point-node-id=1%3A2',
        link_btn: 'Check out Figma',
    },
    {
        label: 'ui/ux',
        title: 'Open data portal redesign (2022)',
        description: 'Open data portals is a topic that is gaining a lot of relevance. Because of that, in one college subject we were challenged to study about open data portals usability. With that I user a specific portal, conducted a heuristic evaluation, prototyped a new interface and then conducted usability testing sessions to check if the proposal was good. The result was great.',
        link: 'https://www.figma.com/proto/76pEp6TG61NqGY4dpByFX0/lab_sisinfo_ii?page-id=135%3A186&node-id=135%3A187&viewport=241%2C48%2C0.06&scaling=scale-down&starting-point-node-id=135%3A187',
        link_btn: 'Check out prototype',
    },
    {
        label: 'data science',
        title: 'Music Recommendation (2021)',
        description: 'As a challenge to learn more about numerical methods and similarity methods I decided to a music recommendation project using Spotify data (Spotify API) and recommend music given another music as input. This way I was able to exercise these contents and work on data visualizing. For this used Python, google colab and google sheets.',
        link: 'https://github.com/lagaleno/recommendation_system/blob/main/recommendation_system_Final_onehot.ipynb',
        link_btn: 'Check out Code',
    },
    {
        label: 'frontend',
        title: 'KDQ (2021)',
        description: 'In order to learn React.js I builded a game called "Kpop dance Quiz". At first the user would see the dance of a kpop song without any sound, and then would type the name of the song and artist. After 15 seconds the result will appear and the points will be computed. For this, I also build a database in google sheets so that my react application can make request for data and the video is played with the youtube API.',
        link: 'https://lagaleno.github.io/kdq/',
        link_btn: 'Check out Game',
    },
]

window.onload = function() {
    let render = [];
    
    for(var i = info.length-1; i >= 0 ; i--) {
        console.log('oi')
        render.push(drawCard(info[i].label, info[i].title, info[i].description, info[i].link, info[i].link_btn ))
    }

    document.getElementById("cards").innerHTML = render.join('')
}

function drawCard(label, title, description, link, link_btn) {
    const card = `
        <div class="col s12 m6">
            <div class="card medium">
                <div class="card-content">
                    <span class="label"> ${label} </span>
                    <span class="card-title">${title}</span>
                    <p>${description}</p>
                </div>
                <div class="card-action">
                    <a href="${link}" target='_blank'>${link_btn}</a>
                </div>
            </div>
        </div>
    `

    return card;
}