const form = document.querySelector('.form');
const input = document.querySelector('.find');
const show = document.querySelector('.show');
const error = document.querySelector('.error');
const titles = document.querySelector('.titles');
const navigation = document.querySelector('.navigation');
const spinner = document.querySelector('.spinner');
const showLyric = document.querySelector('.show-lyric');
const close = document.querySelector('.close');


const scrollOnTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


const isFetching = (loading) => {
    loading ? spinner.classList.add('show-loader') : spinner.classList.remove('show-loader');
};


const errorFunction = (msg) => {
    error.textContent = msg;
    error.classList.remove('hide');
    setTimeout(() => {
        error.classList.add('hide');
    }, 3000);
};


const findText = async (artist, song) => {
    const url = `https://api.lyrics.ovh/v1/${artist}/${song}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const text = data.lyrics ? data.lyrics.replace(/\n/g, '<br>') : "Lyrics not available.";
        showLyric.innerHTML = text;
        showLyric.classList.add('show-text');
        close.classList.add('show-close');  // X işareti görünür yapılıyor
    } catch (err) {
        console.error(err);
        errorFunction('Unable to fetch lyrics.');
    }
};


const findLyrics = async (search) => {
    isFetching(true);
    try {
        const res = await fetch(`https://api.lyrics.ovh/suggest/${search}`);
        const data = await res.json();
        if (data.data.length === 0) {
            return errorFunction('No lyrics found.');
        }
        showResult(data);
    } catch (err) {
        console.error(err);
        errorFunction('Something went wrong.');
    } finally {
        isFetching(false);
    }
};


const showResult = (data) => {
    titles.classList.add('show-titles');
    show.innerHTML = '';
    navigation.innerHTML = '';

    data.data.forEach(song => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="center"><a href="${song.link}" target="_blank"><img src="${song.album.cover_small}" alt=""></a></div>
            <div class="title"><strong>${song.title}</strong></div>
            <div class="album">${song.album.title}</div>
            <div class="artist"><a href="${song.artist.link}" target="_blank">${song.artist.name}</a></div>
            <div class="center-lyric"><button data-artist="${song.artist.name}" data-song="${song.title}">Lyric</button></div>
        `;
        show.appendChild(card);
    });


    if (data.prev || data.next) {
        if (data.prev) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Prev';
            prevBtn.onclick = () => paginationFetch(data.prev);
            navigation.appendChild(prevBtn);
        }
        if (data.next) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.onclick = () => paginationFetch(data.next);
            navigation.appendChild(nextBtn);
        }
    }
};


const paginationFetch = async (url) => {
    isFetching(true);
    try {
        // Proxy'ye yönlendiriyoruz
        const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();
        showResult(data);
        scrollOnTop();
    } catch (err) {
        console.error(err);
    } finally {
        isFetching(false);
    }
};





form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchValue = input.value.trim();
    if (!searchValue) {
        return errorFunction('Please enter something.');
    }
    findLyrics(searchValue);
});


show.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const artist = e.target.getAttribute('data-artist');
        const song = e.target.getAttribute('data-song');
        findText(artist, song);
    }
});


close.addEventListener('click', () => {
    showLyric.classList.remove('show-text'); // Şarkı sözlerini kapat
    close.classList.remove('show-close');   // X işaretini gizle
});
