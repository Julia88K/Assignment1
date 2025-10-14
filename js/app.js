(() => {
  document.addEventListener('DOMContentLoaded', async () => {
    // Man hämtar referenser till HTML-elementen i index.html via deras ID-attribut.
    // Så kan man koppla ihop javascript med HTML-filen.
    const startButton = document.getElementById("start");
    const resetButton = document.getElementById("reset");
    const inputWord   = document.getElementById("input");
    const divWrapper  = document.getElementById("divWrapper");

    // Hämtar en ordlista från github
    const WORDLIST_URL =
      "https://raw.githubusercontent.com/Torbacka/wordlist/master/SAOL13_117224_Ord.txt";

    let dictionaryList = [];
    startButton.disabled = true;
    divWrapper.textContent = "Ladda ordlista …";


    try {
      const res = await fetch(WORDLIST_URL, { cache: "force-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const t = await res.text();
      const MIN_LEN = 3;
      dictionaryList = t
        .split(/\r?\n/)
        .map(w => w.trim())
        .filter(Boolean)
        .filter(w => /^\p{L}+$/u.test(w))
        .filter(w => !/^[A-ZÅÄÖ]+$/.test(w))
        .map(w => w.normalize("NFC").toLocaleUpperCase("sv-SE"))
        .filter(w => w.length >= MIN_LEN);

      startButton.disabled = false;
      divWrapper.textContent = "";
    } catch (err) {
      console.error("Dictionary load failed:", err);
      divWrapper.textContent = "Kunde inte ladda ordlistan. Kontrollera din internetanslutning.";
      return;
    }

    // Funktionen testar om word kan byggas av bokstäverna i letters
    function canBeMadeFrom(word, letters) {
      const have = Object.create(null);
      for (const ch of letters) {
        if (have[ch]) have[ch]++;
        else have[ch] = 1;
      }
      for (const ch of word) {
        if (!have[ch]) return false;
        have[ch]--;
      }
      return true;
    }

    /* När start-knappen i html-filen trycks gör den här funktionen att den lyssnar på klicket
       och om knappen har tryckts så skapas en variabel input utifrån den redan deklarerade variabeln inputWord.
       sen skapas en variabel containedWords där funktionen canBeMadeFrom används på dictionaryList.
       Alla ord filtreras ut som är längre än 2 bokstäver OCH inte längre än ordet i inputfältet
       OCH innehåller alla eller en del bokstäver av input-ordet/bokstäver.
      */
    startButton.addEventListener("click", () => {
      const input = (inputWord.value || "")
        .trim()
        .normalize("NFC")
        .toLocaleUpperCase("sv-SE");
      if (!input) return;

      const containedWords = dictionaryList
        .filter(w => w.length > 2 && w.length <= input.length && canBeMadeFrom(w, input))
        .sort((a,b) => a.length - b.length || a.localeCompare(b, "sv"))
        .slice(0, 300);

      /* Här sätts divven "divWrapper" så att inte visa ngt, och det skapas en ny punktlista,
      för varje ord i listan containedWords skapas en listpunkt med innehållet av
      just det ordet och ordet läggs till nyskapade punktlista.
      Sen läggs punktlistan till tomma divven divWrapper i html dokumentet.
       */
      divWrapper.innerHTML = "";
      const ul = document.createElement("ul");
      containedWords.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word;
        ul.appendChild(li);
      });
      divWrapper.appendChild(ul);
    });

    /* Den här funktionen "lyssnar" på när resetknappen trycks
    och sätter inputfältet och divven "divWrapper" i html dokumentet på tomt.
    Fokusen sätts tillbaka till input-fältet så att markören hamnar där.
     */
    resetButton.addEventListener("click", () => {
      inputWord.value = "";
      divWrapper.innerHTML = "";
      inputWord.focus();
    });
  });
})();
