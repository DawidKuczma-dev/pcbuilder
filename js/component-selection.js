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
   const Power = Math.ceil(((cpuTdp + gpuTdp) * 1.3) / 50) * 50;
   // TDP alternatywnej konfiguracji (jeśli istnieje)
   const altCpuTdp = componentsData.cpu[altCPU]?.tdp ?? cpuTdp;
   const altGpuTdp = componentsData.gpu[altGPU]?.tdp ?? gpuTdp;
   const altPower = Math.ceil(((altCpuTdp + altGpuTdp) * 1.3) / 50) * 50;

   return {
      cpu: bestCPU,
      altCpu: altCPU,
      gpu: bestGPU,
      altGPU: altGPU,
      ram: `${maxRam}GB`,
      storage: `${totalStorage}GB`,
      Power: `${Power}W`,
      altPower: `${altPower}W`,
   };
}

function displayResult(result) {
   document.getElementById('cpu').textContent = result.cpu;
   document.getElementById('altCpu').textContent = result.altCpu || 'Brak alternatywy';
   document.getElementById('gpu').textContent = result.gpu;
   document.getElementById('altGpu').textContent = result.altGPU || 'Brak alternatywy';
   document.getElementById('ram').textContent = result.ram;
   document.getElementById('storage').textContent = result.storage;
   document.getElementById('Power').textContent = result.Power;
   document.getElementById('altPower').textContent = result.altPower;
}

async function loadData(selectedGames, selectedPerf) {
   const gamesRes = await fetch('../assets/data/games.json');
   const componentsRes = await fetch('../assets/data/components.json');
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
