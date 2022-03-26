'use strict';

// TODO: replace with real fetching from the server
const fetch = Array.prototype.pop.bind([
    { q: 'детективістични', a: 'detektywistyczny' },
    { q: 'зажаленє', a: 'zażalenie' },
    { q: 'інцидентални', a: 'incydentalny' },
    { q: 'маржа', a: 'marża' },
]);

function framework({ reactions, actions, data, dev = false, persist }) {
    try {
        if (persist) {
            const saved = JSON.parse(localStorage.getItem(persist) || '')
            if (saved && saved.count > 0) {
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
            value = `${value}`.toLowerCase();
            this.progress = calculateProgress(this.question.a, value)
            this.status = compare(this.question.a, value)
            if (this.status === STATUS.OK) {
                this.advanceSoon = true;
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
                $('#game').innerText = 'Coś poszło nie tak: ' + store.error;
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
                const next = store.count + 1;
                setTimeout(async () => {
                    try {
                        store.question = await fetch();
                        store.count = next;
                        store.status = STATUS.START;
                        $('#ans').value = '';
                        store.progress = 0;
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