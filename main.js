'use strict';


const words = `
dom;kot;kawałek;mokre;mało;cześć;ukojenie;sprzęgła;przyczepność;pomalować;przekładnie;tango;systematizacja;narzut;krętactwo;mandolina;karat;wytrwałość;wyprasować;upolować;zbawiciel;dostawanie;zwerbować;głaskał;sądownictwo;oczywisty;niezależność;wolny;dodaje;kleik;torus;z drewna;dziwne;komitet;przetransportować;egzosfera;skartografować;zielony;alkaliczne;orientacja;stan zawieszenia;charyzma;flora;wojsko;zawoalować;poprzeczny;grzmot;ból ucha;liniowiec;mędrkować;nabój;siano;spetryfikować;jaskra;amfiia;album;heteroseksualność;zło;przyrząd;karty;zamyślony;zamocowane;ścierność;kamera;solenie;nieugięty;magazyn;wykonturować;odsolenie;koziorożec alpejski;pozaszywać;smutki;chromatografia;materializm;kombinacja;świergotek;lektyna;panorama;rozmagnesowywać;aromat;doprecyzować;malarz;serum;stagnacja;nonszalancja;galeria;biomasa;harmonogram;apraksja;płótna;kleszcze;chrzan;alarmowanie;kucanie;odsiadywać;żółtaczka;nowela;łóżko;wklej;cegła;strumień;trener;Ziemia;śródmieście;drzewo;obsada;pogoda;komfort;żarówka;masło;pierścienie;plecy;dochód;zagięcie;nożyczki;szczegół;promieni;palec u nogi;gospodarstwo rolne;ramię;kamień;Popatrz;kochanie;serce;jajka;piasek;powód;włóczęga;kotek;biegać;początek;tarcie;sędzia;słowo;płótno;kopalnia;ciasta;poduszka;kaczki;formularz;cmentarz;fabuła;koszula;dzwon;znaczek;rękawica,mama;skarpetka;zaszokować;puchar;fasola;kredka;kłopoty;bagażnik;ziemniak;choroba;książki;ciężarówki;papier;rolka;odpowiedź;z przodu;klejnot;dźwięk;opinia;sznurek;dzwonki;linia;biznes;słońce;warzywo;grzmot;brama;karta;korek;kreda;sypialnia;olbrzymy;kapusta;koralik;efekt;bitwa;krzaki;indyk;półka;struktura;niespodzianka;wymiana;doświadczenie;część;niewolnik;przedstawiciel;wiedza;barszczyk;szczeniak,szczudła;praca;wołowina;gitara;przekazywać;przyplątał;zakupione;trójścian;glany;scedować;zreferować;owsiany;łańcuchowy;pokorniutki;czerń;twórczość;wirtuozeria;poddzierżawić;ekologia;pies;szczoteczka;pożyczony;stypulować;zakryty;propan;okopowy;przekonywać;czekolada;plądrujący;pomedytować;tendencja;łóżko;księgowość;fotel;niektóry;planować;preliminarny;medalik;przekładowy;korzeniowy;skórzany;niesmaczny;pojąć;nadgorliwy;sprzedawca;wyrobów;żelaznych;problem;niezasobny;biczowanie;nagrywać;etymologiczny;plankton;wieżowy;zbiegać się;substancjalny;zapalenie naczyń;mimika;chart;niegotowy;zsynchronizować;niższy;naciąganie;półwysep;chłopski;kamizelka;obszarpywać;własność;dochodowy;wymiarowość;drożdże piwne;reprodukować;omdlenie;zwiastun;onkolog;niegrzeczny;ukośny;zrutynizować;pokrewny;mahoń;bezterminowy;hazardowny;mongolski;dyskutować;półprzewodnikowy;językowy;odtwarzalny;archipelag;rozpluskiwać;pasy transmisyjne;odchylenie;szczur;
`.trim().split(';');

const alphabet = {
    "a": "а",
    "b": "б",
    "c": "ц",
    "d": "д",
    "e": "е",
    "f": "ф",
    "g": "ґ",
    "h": "г",
    "i": "і",
    "j": "й",
    "k": "к",
    "l": "л",
    "ł": "л",
    "m": "м",
    "n": "н",
    "o": "о",
    "p": "п",
    "r": "р",
    "s": "с",
    "t": "т",
    "u": "у",
    "w": "в",
    "y": "и",
    "z": "з",
    "ż": "ж",
    " ": " ",
}
const alphabetPairs = Object.entries(alphabet);
const alphabetKeys = Object.keys(alphabet);

const clomps = Object.entries({
    "ch": "х",
    "cz": "ч",
    "sz": "ш",
    "szcz": "щ",
    "je": "є",
    "ie": "є",
    "ji": "ї",
    "ju": "ю",
    "iu": "ю",
    "ja": "я",
    "ia": "я"
})

const allConvertable = (word) => {
    word = word.toLowerCase();
    // all characters of the word are found in alphabetKeys;
    return word.split('').every(c => alphabetKeys.includes(c));
}
const getWord = async () => {
    // return a random element from words array
    let word;
    do {
        word = words[Math.floor(Math.random() * words.length)];
    } while (!allConvertable(word));
    return word;
}


function translate(word) {
    word = word.toLowerCase();
    for (const [clomp, repl] of clomps) {
        word = word.replaceAll(clomp, repl);
    }
    for (const [lat, cyr] of alphabetPairs) {
        word = word.replaceAll(lat, cyr);
    }
    return word;
}

const getQuestion = async () => {
    const word = await getWord();
    return {
        q: translate(word),
        a: word
    }
}

function framework({ reactions, actions, data, dev = false, persist }) {
    try {
        if (persist) {
            const saved = JSON.parse(localStorage.getItem(persist) || '{}')
            if (saved && saved.count > 0 && !saved.error) {
                data = saved
            }
        }
        let updateSoon = true;
        const store = new Proxy(data, {
            set(d, k, v) {
                d[k] = v;
                dev && console.trace('SET', k, v);
                return updateSoon = true;
            }
        })
        store.actions = Object.freeze(Object.fromEntries(Object.entries(actions).map(ac => [ac[0], ac[1].bind(store)])));
        const $cache = new Map();
        const $ = (q) => {
            if (!$cache.has(q)) {
                $cache.set(q, document.querySelector(q));
            }
            return $cache.get(q)
        }
        const ONCE = Symbol();
        setInterval(() => {
            if (updateSoon) {
                try {
                    updateSoon = false;
                    dev && console.log(data);
                    persist && localStorage.setItem(persist, JSON.stringify(data))
                    reactions.map(r => r.call({}, $, store, actions));
                } catch (error) {
                    console.error(error)
                    store.error = error.message
                }
            }
        }, 250)
        reactions = reactions.filter(r => r.call({ ONCE }, $, store, actions) !== ONCE)
    } catch (error) {
        console.error(error)
        store.error = error.message
    }
}

const STATUS = { START: 'start', OK: 'ok', WRONG: 'wrong' };

framework({
    dev: true,
    persist: 'data1',
    data: {
        question: { q: 'кворум', a: 'kworum' },
        count: 0,
        status: STATUS.START
    },
    actions: {
        check(value) {
            value = `${value}`.toLowerCase().trim();
            this.progress = calculateProgress(this.question.a, value)
            this.status = compare(this.question.a, value)
            if (this.status === STATUS.OK) {
                this.advanceSoon = true;
                this.count += 1;

            }
        },
        skip() {
            this.status = STATUS.WRONG;
            this.advanceSoon = true;
        }
    },
    reactions: [
        function init($, store) {
            const { check, skip } = store.actions;
            const $ans = $('#ans');
            $ans.addEventListener('keyup', () => check($ans.value))
            $ans.addEventListener('change', () => check($ans.value))
            $('#nxt').addEventListener('click', skip)
            return this.ONCE
        },

        function update($, store) {
            if (store.error) {
                $('#errors').innerText = 'Coś poszło nie tak: ' + store.error;
            }
            $('#que').value = store.question.q;
            $('#game').setAttribute('class', store.status);
            $('.hint').innerText = store.status === STATUS.WRONG ? store.question.a : '';
            $('#ans').focus();
            $('#progress').style.width = `${store.progress}%`;
            $('#count').innerText = store.count;
        },
        function next($, store) {
            if (store.advanceSoon) {
                store.advanceSoon = false;
                setTimeout(async () => {
                    try {
                        const newQ = await getQuestion();
                        if (newQ && newQ.q) {
                            store.question = newQ;
                            store.status = STATUS.START;
                            $('#ans').value = '';
                            store.progress = 0;
                        } else {
                            store.error = 'skończyły się pytania'
                        }
                    } catch (error) {
                        console.error(error)
                        store.error = error.message
                    }
                }, 1500)
            }
        },
    ],
})

function compare(good, value) {
    if (value === good) {
        return STATUS.OK
    } else if (value.length >= good.length) {
        return STATUS.WRONG
    } else {
        return STATUS.START
    }
}

function calculateProgress(good, value) {
    const matching = value.split('').filter((a, i) => good[i] === a).length;
    return Math.round(100 * matching / good.length)
}