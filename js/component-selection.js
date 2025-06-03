function getBestComponents(selectedGames, selectedPerf, gamesData, componentsData) {
   let possibleCPUs = new Set();
   let possibleGPUs = new Set();
   let maxRam = 0;
   let totalStorage = 0;

   selectedGames.forEach((gameKey) => {
      const game = gamesData.games[gameKey];
      const perf = game[selectedPerf];

      perf.cpu.forEach((cpu) => possibleCPUs.add(cpu));
      perf.gpu.forEach((gpu) => possibleGPUs.add(gpu));

      const ram = perf.ram;
      if (ram > maxRam) maxRam = ram;

      const storage = game.storage;
      totalStorage += storage;
   });

   // wybieramy najlepsze CPU
   const bestCPU = [...possibleCPUs].reduce((best, cpu) => {
      const rank = componentsData.cpu[cpu]?.rank ?? Infinity;
      const bestRank = componentsData.cpu[best]?.rank ?? Infinity;
      return rank < bestRank ? cpu : best;
   });

   // Znajdujemy grę i poziom, z którego pochodzi najlepszy CPU
   const gameWithBestCPU = selectedGames.find((gameKey) =>
      gamesData.games[gameKey][selectedPerf].cpu.includes(bestCPU),
   );
   // Przypisujemy alternatywne CPU
   let altCPU = null;
   if (gameWithBestCPU)
      altCPU = gamesData.games[gameWithBestCPU][selectedPerf].cpu.find((cpu) => cpu !== bestCPU) ?? null;
   // Pobranie socketów
   const socket = componentsData.cpu[bestCPU]?.socket ?? 0;
   const altSocket = componentsData.cpu[altCPU]?.socket ?? 0;

   // Ten sam proces dla GPU
   const bestGPU = [...possibleGPUs].reduce((best, gpu) => {
      const rank = componentsData.gpu[gpu]?.rank ?? Infinity;
      const bestRank = componentsData.gpu[best]?.rank ?? Infinity;
      return rank < bestRank ? gpu : best;
   });
   const gameWithBestGPU = selectedGames.find((gameKey) =>
      gamesData.games[gameKey][selectedPerf].gpu.includes(bestGPU),
   );
   let altGPU = null;
   if (gameWithBestGPU)
      altGPU = gamesData.games[gameWithBestGPU][selectedPerf].gpu.find((gpu) => gpu !== bestGPU) ?? null;

   // TDP głównej konfiguracji
   const cpuTdp = componentsData.cpu[bestCPU]?.tdp ?? 0;
   const gpuTdp = componentsData.gpu[bestGPU]?.tdp ?? 0;
   const power = Math.ceil(((cpuTdp + gpuTdp) * 1.3) / 50) * 50;
   // TDP alternatywnej konfiguracji (jeśli istnieje)
   const altCpuTdp = componentsData.cpu[altCPU]?.tdp ?? cpuTdp;
   const altGpuTdp = componentsData.gpu[altGPU]?.tdp ?? gpuTdp;
   const altPower = Math.ceil(((altCpuTdp + altGpuTdp) * 1.4) / 50) * 50;

   return {
      cpu: bestCPU,
      altCpu: altCPU,
      gpu: bestGPU,
      altGpu: altGPU,
      ram: `${maxRam}GB`,
      storage: `${totalStorage}GB`,
      power: `${power}W`,
      altPower: `${altPower}W`,
      socket: `${socket}`,
      altSocket: `${altSocket}`,
   };
}

function setComponentTextAndColor(elementId, text, colorMap) {
   const element = document.getElementById(elementId);
   element.textContent = text;

   for (const keyword in colorMap) {
      if (text.includes(keyword)) {
         element.style.color = colorMap[keyword];
         return;
      }
   }
}

function displayResult(result) {
   setComponentTextAndColor('cpu', result.cpu, {
      Intel: '#0071c5',
      AMD: '#ef0707',
   });
   setComponentTextAndColor('altCpu', result.altCpu || 'Brak alternatywy', {
      Intel: '#0071c5',
      AMD: '#ef0707',
   });
   setComponentTextAndColor('gpu', result.gpu, {
      GeForce: '#76b900',
      Radeon: '#ef0707',
   });

   setComponentTextAndColor('altGpu', result.altGpu || 'Brak alternatywy', {
      GeForce: '#0cb300',
      Radeon: '#ef0707',
   });

   document.getElementById('ram').textContent = result.ram;
   document.getElementById('storage').textContent = result.storage;
   document.getElementById('Power').textContent = result.power;
   document.getElementById('altPower').textContent = result.altPower;

   setComponentTextAndColor('socket', result.socket, {
      AM: '#ef0707',
      1: '#0071c5',
   });

   setComponentTextAndColor('altSocket', result.altSocket, {
      AM: '#ef0707',
      1: '#0071c5',
   });
}

async function loadData(selectedGames, selectedPerf) {
   const gamesRes = await fetch('assets/data/games.json');
   const componentsRes = await fetch('assets/data/components.json');
   const gamesData = await gamesRes.json();
   const componentsData = await componentsRes.json();

   const result = getBestComponents(selectedGames, selectedPerf, gamesData, componentsData);
   displayResult(result);
}

document.querySelector('.games__form').addEventListener('submit', (e) => {
   e.preventDefault();
   const selectedGames = Array.from(document.querySelectorAll('input[name="games"]:checked')).map(
      (input) => input.value,
   );

   if (selectedGames.length > 0) {
      const selectedPerf = document.querySelector('input[name="performance"]:checked').value;
      loadData(selectedGames, selectedPerf);

      const result = document.getElementById('result');
      result.classList.add('active');
      result.scrollIntoView({ behavior: 'smooth' });
   } else {
      const images = document.querySelectorAll('.games__tile>img');
      images.forEach((image) => {
         image.classList.add('alert');
         setTimeout(() => {
            image.classList.remove('alert');
         }, 1000);
      });
      return;
   }
});
