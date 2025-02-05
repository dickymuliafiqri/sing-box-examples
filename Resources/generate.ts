import { $ } from "bun";

const exportList: { geoip: string[]; geosite: string[] } = {
  geoip: [],
  geosite: ["rule-ads", "oisd-full", "oisd-nsfw", "category-porn"],
};

async function compileAssets(name: "geoip" | "geosite") {
  const path = `${import.meta.dir}/${name}/${name}.db`;
  for (const ruleTag of exportList[name]) {
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

async function releaseAssets() {
  try {
    await $`gh release delete latest -y`;
  } catch (e: any) {
    console.error(e.message);
  } finally {
    await $`gh release create latest --title "Latest Rules"`;
  }

  try {
    console.log(`[+] Releasing assets...`);
    await $`gh release upload latest ${import.meta.dir}/*/*.srs --clobber`;
  } catch (e: any) {
    console.error(e.message);
  }
}

(async () => {
  for (const name of ["geosite", "geoip"]) {
    await compileAssets(name as any);
  }
  await releaseAssets();
})();
