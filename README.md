# Foto hádačka

Jednoduchý statický prototyp týmové hry pro odkrývání fotografie po políčkách.

## Spuštění

Stačí otevřít `index.html` v prohlížeči, případně spustit lokální server:

```bash
python3 -m http.server 4173
```

Aplikace pak poběží na `http://127.0.0.1:4173/`.

## Aktuální funkce

- fotografie je kompletně překrytá čtvercovou mřížkou 20 × 10, tedy 200 políčky,
- kliknutí na políčko ho odkryje,
- lze zvolit 2 až 6 týmů,
- tahy se po odkrytí automaticky střídají mezi týmy,
- počítadlo ukazuje, kolik políček odkryl každý tým,
- tlačítko „Zakrytovat znovu“ vrátí fotku do původního zakrytého stavu.
