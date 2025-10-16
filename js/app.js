(() => {
  document.addEventListener('DOMContentLoaded', async () => {
    // Här hämtas referenser till HTML-elementen i index.html via deras ID-attribut.
    // Så kan man koppla ihop javascript med HTML-filen.
    const startButton = document.getElementById("start");
    const resetButton = document.getElementById("reset");
    const inputWord   = document.getElementById("input");
    const divWrapper  = document.getElementById("divWrapper");


    // Deklarerar en variabel WORDLIST_URL med en ordlista-URL från github som ligger i Torbackas offentliga repo
    const WORDLIST_URL =
      "https://raw.githubusercontent.com/Torbacka/wordlist/master/SAOL13_117224_Ord.txt";

    // Skapar en tom lista som ska användas senare för att bli den rensade "texten"
    let dictionaryList = [];
    startButton.disabled = true;
    divWrapper.textContent = "Ladda ordlista …";

    // Här hämtas ordlistan med hjälp av en fetch-request
      const res = await fetch(WORDLIST_URL, { cache: "force-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      // skapar en variabel "MIN_LEN" (minimum length) så att alla ord som filtreras ut sen är lika lång
    // eller längre än tre bokstäver
      const MIN_LEN = 3;
      // Skapar ordlistan "dictionaryList" utifrån den hämtade texten ("text") som
    // bl a rensar bort extra mellanslag, tomma rader och akronymer.
      dictionaryList = text
        .split(/\r?\n/)
        .map(w => w.trim())
        .filter(Boolean)
        .filter(w => /^\p{L}+$/u.test(w))
        .filter(w => !/^[A-ZÅÄÖ]+$/.test(w))
        .map(w => w.replace(/-/g, ''))
        .map(w => w.normalize("NFC").toLocaleUpperCase("sv-SE"))
        .filter(w => w.length >= MIN_LEN);

      startButton.disabled = false;
      divWrapper.textContent = "";


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

    /* När start-knappen i HTML-dokumentet trycks gör den här funktionen att den lyssnar på klicket
       och om knappen har tryckts så skapas en variabel input utifrån den redan deklarerade variabeln inputWord.
       sen skapas en output-variabel containedWords där funktionen canBeMadeFrom används på dictionaryList.
       Alla ord filtreras ut som är längre än 2 bokstäver OCH inte längre än ordet i inputfältet
       OCH innehåller alla eller en del bokstäver av input-ordet/bokstäver. Ordet i input-fältet
       får inte vara kortare än tre och inte längre än 7 bokstäver.
      */
    startButton.addEventListener("click", () => {

      /* Skapar en funktion som först skapar en paragraph-element i HTML-filen som får klassen
      "message" tilldelad, och innehållet av "para1" är string-parametern (stringIn);
      paragraph-elementet bifogas till divven "divWrapper" i HTML-dokumentet */
      function showMessage(stringIn) {
        let para1 = document.createElement('p');
        para1.innerText = stringIn;
        para1.classList.add("message");
        divWrapper.appendChild(para1);
      }

      const rawInput = (inputWord.value || "").trim();
      if (!rawInput) {
        showMessage("Skriv ett ord.");
        inputWord.focus();
        return;
      }
      // Här görs input jämförbart
      const input = rawInput
        .normalize("NFC")
        .toLocaleUpperCase("sv-SE")
        .replace(/-/g, "");

      // Kontrollera längden. När input-ordet är längre än 7 bokstäver så visas ett meddelande.
      if (input.length > 7) {
        showMessage("Ordet får inte vara längre än 7 bokstäver. Försök igen.");
        inputWord.focus();
        return;
      }
      // Kontrollera längden. När input-ordet är kortare än 3 bokstäver så visas ett meddelande.
      if (input.length < 3) {
        showMessage("Ordet måste ha minst 3 bokstäver.");
        inputWord.focus();
        return;
      }
      // Den här nya variabeln "contained words" är outputen. Det läggs bara till ord när den har
      //den riktiga längden och om canBeMadeFrom => true.
      const containedWords = dictionaryList
        .filter(w => w.length > 2 && w.length <= input.length && canBeMadeFrom(w, input))
        .sort((a,b) => a.length - b.length || a.localeCompare(b, "sv"))
        .slice(0, 50);

      /* Här sätts divven "divWrapper" i HTML-dokumentet så att den inte visa ngt, och
      det skapas en ny punktlista,för varje ord i listan containedWords skapas en listpunkt
      med innehållet av just det ordet och ordet läggs till nyskapade punktlista.
      Sen läggs punktlistan till tomma divven "divWrapper" i HTML-dokumentet.
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
    och sätter inputfältet och divven "divWrapper" i HTML-dokumentet på tomt.
    Fokusen sätts tillbaka till input-fältet så att markören hamnar där.
     */
    resetButton.addEventListener("click", () => {
      inputWord.value = "";
      divWrapper.innerHTML = "";
      inputWord.focus();
    });
  });
})();
