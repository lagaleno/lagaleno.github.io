
const nav = `
    <div class="container">

        <div class="row">
            <div class="hide-on-small-only center-align">

                <p class="name"> LARISSA GALENO </p>

                <div class="links">
                    <a href="https://www.linkedin.com/in/lagaleno/" target='_blank'>linkedin</a> | 
                    <a href="https://drive.google.com/file/d/13Wd2fouvI6JevvOx-M3C38czxPHLuchu/view?usp=sharing" target='_blank'>resume</a> | 
                    <a href="https://github.com/lagaleno" target='_blank'>github</a> | 
                    <a href='mailto: galeno@dcc.ufrj.br' target='_blank'>mail</a>
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
                    <li><a href="https://www.linkedin.com/in/lagaleno/" target='_blank'>linkedin</a></li>
                    <li><div class="divider"></div></li>
                    <li><a href="https://drive.google.com/file/d/13Wd2fouvI6JevvOx-M3C38czxPHLuchu/view?usp=sharing" target='_blank'>resume</a></li>
                    <li><div class="divider"></div></li>
                    <li><a href="https://github.com/lagaleno" target='_blank'>github</a></li>
                    <li><div class="divider"></div></li>
                    <li><a href='mailto: galeno@dcc.ufrj.br' target='_blank'>mail</a></li>
                </ul>
                <div class='col s1 offset-s10' style="margin-top: -30px">
                    <a href="#" data-target="slide-out" class="sidenav-trigger"><i class="material-icons white-text right-align" id="menu">menu</i></a>
                </div>
            </div>
        </div>

    </div>
`


document.getElementById("intro").innerHTML = nav

