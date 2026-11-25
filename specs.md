# foot-guun — specyfikacja

## 1. Cel
Generator stopek mailowych dla pracowników firmy. Nazwa: **foot**er **g**enerator z twistem — „foot-gun”.

## 2. Templatka
Templatka znajduje się w tym samym folderze i nazywa się: stopka.html

## 3. Stack i hosting
- Statyczne pliki: `index.html`, `style.css`, `app.js`.
- Vanilla JS, bez frameworków, bez builda, bez backendu.
- Hosting: GitHub Pages.

## 4. Layout
- Dwie kolumny: po lewej formularz, po prawej podgląd na żywo.
- Pod nimi pasek z opcjami eksportu.
- Na wąskich ekranach kolumny układają się jedna pod drugą.

## 5. Formularz
Pola:
- Imię i nazwisko (`text`)
- Stanowisko (`text`)
- Numer telefonu (`tel`)
- Email (`email`)
- Kafelek z logo (`radio`: Turkusowy / Czarny / Biały, domyślnie Turkusowy)

Formularz nie ma przycisków (brak „Generuj”, „Wyślij” itp.). Puste pola wypełniane są w stopce wartościami domyślnymi (te same wartości jako `placeholder` w inputach):
- Imię i nazwisko: `Dżejson Kowalski`
- Stanowisko: `Head of Self-Inflicted Wounds`
- Telefon: `+48 000 000 000`
- Email: `kooooooooowalski@opc.je`

## 6. Podgląd na żywo
- Odświeża się na zdarzenie `input` z debounce ~300 ms, czyli gdy użytkownik przestanie pisać.
- Wszystkie wartości są escapowane, żeby wpisany tekst nie mógł wstrzyknąć HTML.
- Przełącznik Dark / Light przy podglądzie symuluje tło i kolor tekstu klienta poczty. Strona ma tylko ciemny motyw.

## 7. Szablon stopki
- Układ oparty na `<table>` z inline CSS, bo tylko tak wyświetla się poprawnie w klientach pocztowych.
- Bez bloku `<style>` i bez kolorów zależnych od trybu jasny/ciemny: tło i kolor tekstu wybiera klient poczty.
- Stałe kolory: akcent `#02898d` (imię, linki, tło komórki z logo) i półprzezroczyste ramki `rgba(128,128,128,0.23)` z pełnym fallbackiem `#d1d4d7` dla Outlooka.
- Kafelek z logo w jednym z dwóch stylów (wybór w formularzu):
  - Turkusowy: tło w kolorze akcentu, logo `ddmono.png` (całe białe).
  - Czarny: tło `#101213`, logo `dddark.png` (białe „DATA”, turkusowe „DISE”).
  - Biały: tło `#ffffff`, logo `ddlight.png` (czarne „DATA”, turkusowe „DISE”).
- Telefon jako pogrubiony tekst (link bez koloru klienci barwią na niebiesko), email jako link `mailto:`.
- Ten sam HTML służy do podglądu i do eksportu.

## 8. Eksport
Dwie opcje, które razem pokrywają większość klientów pocztowych:

| Opcja | Mechanizm | Dla kogo |
|---|---|---|
| **HTML code** | Przycisk „Kopiuj kod” (`navigator.clipboard.writeText`) i „Pokaż kod” (podgląd kodu w popupie) | Outlook, Apple Mail, Thunderbird, Missive i inne |
| **Rich text** | Przycisk „Kopiuj” zapisujący do schowka `ClipboardItem` z `text/html` i `text/plain` | Gmail (wklejenie w Ustawienia → Podpis) |

- Po skopiowaniu pokazuje się krótki komunikat „Skopiowano!”.
- Przyciski kopiowania są dozwolone, bo wymaganie „bez buttonów” dotyczy tylko formularza.

## 9. Poza zakresem
- Zdjęcia
- Wiele szablonów
- Zapisywanie danych (localStorage, backend)

## 10. Kryteria akceptacji
- [ ] Strona działa z GitHub Pages bez builda.
- [ ] Podgląd aktualizuje się po przerwie w pisaniu, bez klikania.
- [ ] Puste pola pokazują w podglądzie wartości domyślne.
- [ ] Wpisanie `<b>` nie zmienia formatowania (escaping działa).
- [ ] „HTML code” kopiuje poprawny kod HTML.
- [ ] „Rich text” po wklejeniu w podpis Gmaila zachowuje formatowanie i linki.
- [ ] Layout działa na desktopie i mobile.
