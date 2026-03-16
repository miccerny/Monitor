// API enpoint testovací služby pro RTT
const URL = "https://performance.t-mobile.cz/test2/_ua/juniordev/ping";

// JSON payload obsahující IP adresu, kterou chceme posílat
const ip = { ip: "62.141.14.33" };

// Přihlašovací údaje pro Basic Autentizaci, zakodované do base64
const Auth = Buffer.from("user:password").toString("base64");

// pole pro uložení namřených vzorků max. 100
const samples = [];

// Funkce odešle ping request na API, změří RTT a uloží výsledek do pole samples
async function ping() {
  const start = Date.now();

  try {
    // Odeslání POST požadavku na testovací API
    const response = await fetch(URL, {
      headers: {
        Authorization: "Basic " + Auth,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(ip),
    });

    const end = Date.now();

    // Výpočet RTT (Round trip time)
    const rtt = end - start;

    // Uložení úspěšného měření
    if (response.ok) {
      samples.push({
        success: true,
        rtt: rtt,
        timeStamp: new Date().toISOString(),
      });
    } else {
      // Uložení neúspěšného měření (např. HTTP error)
      samples.push({
        success: false,
        status: response.status,
        timeStamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Zachycení síťové chyby nebo jiné vyjímky při requestu
    samples.push({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timeStamp: new Date().toISOString(),
    });
  }
  // V7piš posledního naměřeného vzorku
  const lastSample = samples[samples.length - 1];
  console.log("Actual sample: ");
  console.log(
    `Adress: ${URL}, Time response: ${lastSample.rtt} ms, Date: ${start}`,
  );

  // Udržení maximálně 100 vzorků v paměti
  keepHundredSamples();

  // Přepočet a výpis statistik
  stats();
}

// Funkce odstraní nejstarší vzorky pokud jejich počet přesáhne 100
function keepHundredSamples() {
  while (samples.length > 100) {
    samples.shift();
  }
}

// Výpočet a výpis statistik z aktuálně uložených vzorků
function stats() {
  // Celkový počet vzorků
  const totalSamples = samples.length;
  console.log("-----------------");
  console.log(`Total samples: ${totalSamples}`);

  // Výběr pouze z úspěšných měření
  const successSamples = samples.filter((sample) => sample.success);

  // Výběr neúspěšných vzorků pro výpočet packet loss
  const failedSamples = samples.filter((sample) => !sample.success);

  // Vytvoření pole RTT hodnto z úspěšných měření
  const rtts = successSamples.map((sample) => sample.rtt);

  // Výpočet maximální RTT hodnoty
  if (successSamples.length > 0) {
    const max = Math.max(...rtts);
    console.log(`Max RTT: ${max.toFixed(0)} ms`);
  } else {
    console.log(`Max RTT: ${0} `);
  }

  //Výpočet minimální RTT hodnoty
  if (successSamples.length > 0) {
    const minRTT = Math.min(...rtts);
    console.log(`Min RTT: ${minRTT.toFixed(0)} ms`);
  } else {
    console.log(`Min RTT: ${0} `);
  }

  // Výpočet průměrné RTT hodnoty
  if (rtts.length > 0) {
    const avgRtt =
      rtts.reduce(function (sum, value) {
        return sum + value;
      }, 0) / rtts.length;
    console.log(`Avg RTT: ${avgRtt.toFixed(0)} ms`);
  } else {
    console.log(`Avg RTT: ${0} `);
  }

  // Výpočet ztrátovosti paketů
  if (totalSamples) {
    const lostPacket = (failedSamples.length / totalSamples) * 100;
    console.log(`Lost packet: ${lostPacket.toFixed(2)} %`);
  } else {
    console.log(`Lost packet: ${0} %`);
  }

  console.log("Press Ctrl+C for Stop");
}

// Inicializační výpis při spuštění
console.log("Start monitoring:");
console.log(`Connect to adress: ${URL}`);
console.log(`Sending JSON data: IP ${ip.ip}`);

// Spuštění měření každých 10 sekund
setInterval(ping, 10000);

// První měření ihned po startu aplikace
ping();
