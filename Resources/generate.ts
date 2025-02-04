import { $ } from "bun";

async function compileAssets(name: string, path: string) {
  for await (const line of $`sing-box ${name} list -f ${path}`.lines()) {
    const ruleTag = line.split(" ")[0];

    if (ruleTag) {
      console.log(`[+] Compiling ${name} ${ruleTag}...`);

      const jsonOut = `${import.meta.dir}/${name}/${name}-${ruleTag}.json`;
      const srsOut = `${import.meta.dir}/${name}/${name}-${ruleTag}.srs`;

      try {
        await $`sing-box ${name} export ${ruleTag} -f ${path} -o ${jsonOut}`;
        await $`sing-box rule-set compile ${jsonOut} -o ${srsOut}`;
      } catch (e: any) {
        console.error(e.message);
      }
    }
  }
}

(async () => {
  for (const name of ["geosite", "geoip"]) {
    await compileAssets(name, `${import.meta.dir}/${name}/${name}.db`);
  }
})();
