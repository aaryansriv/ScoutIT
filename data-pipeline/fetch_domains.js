const fs = require('fs');

const path = 'd:/ScoutIT/frontend/src/lib/mock-companies.json';
const companies = JSON.parse(fs.readFileSync(path, 'utf8'));

async function fetchDomain(name) {
  try {
    const res = await fetch('https://autocomplete.clearbit.com/v1/companies/suggest?query=' + encodeURIComponent(name));
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0 && data[0].domain) {
      return data[0].domain;
    }
  } catch (e) {}
  return null;
}

async function run() {
  console.log(`Fetching domains for ${companies.length} companies...`);
  
  // Process in chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < companies.length; i += chunkSize) {
    const chunk = companies.slice(i, i + chunkSize);
    const promises = chunk.map(async (company) => {
      if (!company.domain) { // skip if already fetched
        const domain = await fetchDomain(company.name);
        if (domain) {
          company.domain = domain;
        } else {
          // guess domain
          company.domain = company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        }
      }
    });
    
    await Promise.all(promises);
    process.stdout.write(`\rProcessed ${Math.min(i + chunkSize, companies.length)} / ${companies.length}`);
  }
  
  console.log('\nDone fetching. Saving...');
  fs.writeFileSync(path, JSON.stringify(companies, null, 2));
  console.log('Saved mock-companies.json successfully.');
}

run();
