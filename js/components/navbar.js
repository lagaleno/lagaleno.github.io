const links = [
    {
        label: 'linkedin',
        link: 'https://www.linkedin.com/in/lagaleno/'
    },
    {
        label: 'resume',
        link: 'https://drive.google.com/file/d/15yDm7dEJbU4JEUI0ryQqO80Z_ZWcVFn3/view?usp=sharing'
    },
    {
        label: 'github',
        link: 'https://github.com/lagaleno'
    },
    {
        label: 'mail',
        link: 'mailto: galenolarissa@gmail.com'
    }

]

const nav = `
    <div class="container">

        <div class="row">
            <div class="hide-on-small-only center-align">

                <p class="name"> LARISSA GALENO </p>

                <div class="links">
                    <a href=${links[0].link} target='_blank'>${links[0].label}</a> | 
                    <a href="${links[1].link}" target='_blank'>${links[1].label}</a> | 
                    <a href="${links[2].link}" target='_blank'>${links[2].label}</a> | 
                    <a href="${links[3].link}" target='_blank'>${links[3].label}</a>
                </div>
                
            </div>
        
            <div class="hide-on-med-and-up"> 
                <div class="center-align col s11 offset-s1">
                    <img class="logo" src="assets/img/logo/logo.svg" alt="logo">
                </div>
                <ul id="slide-out" class="sidenav">
                    <li><div class="user-view center">
                        <p class="name"> LARISSA GALENO </p>
                    </div></li>
                    <li><a href="${links[0].link}" target='_blank'>${links[0].label}</a></li>
                    <li><div class="divider"></div></li>
                    <li><a href="${links[1].link}" target='_blank'>${links[1].label}</a></li>
                    <li><div class="divider"></div></li>
                    <li><a href="${links[2].link}" target='_blank'>${links[2].label}</a></li>
                    <li><div class="divider"></div></li>
                    <li><a href="${links[3].link}" target='_blank'>${links[3].label}</a></li>
                </ul>
                <div class='col s1 offset-s10' style="margin-top: -30px">
                    <a href="#" data-target="slide-out" class="sidenav-trigger"><i class="material-icons white-text right-align" id="menu">menu</i></a>
                </div>
            </div>
        </div>

    </div>
`


document.getElementById("intro").innerHTML = nav

