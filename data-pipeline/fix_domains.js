const fs = require('fs');

const path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json';
const companies = JSON.parse(fs.readFileSync(path, 'utf8'));

// Known domain overrides for companies where autocomplete might fail
const OVERRIDES = {
  "UST": "ust.com",
  "TCS": "tcs.com",
  "Accenture": "accenture.com",
  "Wipro": "wipro.com",
  "Cognizant": "cognizant.com",
  "Capgemini": "capgemini.com",
  "Infosys": "infosys.com",
  "HCLTech": "hcltech.com",
  "Tech Mahindra": "techmahindra.com",
  "LTM Limited": "ltimindtree.com",
  "IBM": "ibm.com",
  "WNS": "wns.com",
  "DXC Technology": "dxc.com",
  "Mphasis": "mphasis.com",
  "Coforge": "coforge.com",
  "Optum Global Solutions": "optum.com",
  "Hexaware Technologies": "hexaware.com",
  "L&T Technology Services": "ltts.com",
  "Oracle": "oracle.com",
  "eClerx": "eclerx.com",
  "Virtusa Consulting Services": "virtusa.com",
  "GlobalLogic": "globallogic.com",
  "Persistent Systems": "persistent.com",
  "ITC Infotech": "itcinfotech.com",
  "Nagarro": "nagarro.com",
  "Hewlett Packard Enterprise": "hpe.com",
  "Carelon Global Solutions": "carelon.com",
  "Publicis Sapient": "publicissapient.com",
  "Kyndryl": "kyndryl.com",
  "KPIT Technologies": "kpit.com",
  "HCL Group": "hcl.com",
  "NTT DATA": "nttdata.com",
  "Bosch Global Software Technologies": "bosch-softwaretechnologies.com",
  "CGI Inc": "cgi.com",
  "Cyient": "cyient.com",
  "Digitide Solutions": "digitide.com",
  "Atos": "atos.net",
  "Amdocs": "amdocs.com",
  "Eviden": "eviden.com",
  "EY Global Delivery Services ( EY GDS)": "ey.com",
  "Tata Elxsi": "tataelxsi.com",
  "Quest Global": "questglobal.com",
  "Zensar Technologies": "zensar.com",
  "ADP Private Limited": "adp.com",
  "Societe Generale Global Solution Centre": "societegenerale.com",
  "Genpact": "genpact.com",
  "TP": "teleperformance.com",
  "Jio": "jio.com",
  "Tata Communications": "tatacommunications.com",
  "Bajaj Finserv": "bajajfinserv.in",
  "Reliance Industries": "ril.com",
  "Mahindra & Mahindra": "mahindra.com",
  "L&T Infotech": "ltimindtree.com",
  "Infosys BPM": "infosysbpm.com",
  "IBS Software": "ibsplc.com",
  "Ernst & Young": "ey.com",
  "Deloitte": "deloitte.com",
  "KPMG": "kpmg.com",
  "PwC": "pwc.com",
  "SAP": "sap.com",
  "Microsoft": "microsoft.com",
  "Google": "google.com",
  "Amazon": "amazon.com",
  "Flipkart": "flipkart.com",
  "Swiggy": "swiggy.com",
  "Zomato": "zomato.com",
  "Zoho": "zoho.com",
  "Freshworks": "freshworks.com",
  "Razorpay": "razorpay.com",
  "Paytm": "paytm.com",
  "PhonePe": "phonepe.com",
  "BYJU'S": "byjus.com",
  "Ola": "olacabs.com",
  "Tata Consultancy Services": "tcs.com",
  "Mindtree": "ltimindtree.com",
  "Wipro Technologies": "wipro.com",
  "CMS IT Services": "cmsitservices.com",
  "VVDN Technologies": "vvdntech.com",
  "Intellect Design Arena": "intellectdesign.com",
  "Datamatics Global Services": "datamatics.com",
  "Team Computers": "teamcomputers.com",
  "JustDial": "justdial.com",
  "Sun Pharmaceutical Industries": "sunpharma.com",
  "Hindustan Unilever": "hul.co.in",
  "Hindalco Industries": "hindalco.com",
  "Pidilite Industries": "pidilite.com",
  "CG Power": "cgglobal.com",
  "Muthoot Finance": "muthootfinance.com",
  "Adani Enterprises": "adani.com",
  "Bharti Airtel": "airtel.in",
  "Asian Paints": "asianpaints.com",
  "Maruti Suzuki": "marutisuzuki.com",
  "Larsen & Toubro": "larsentoubro.com",
};

async function fetchDomain(name) {
  // Check overrides first
  if (OVERRIDES[name]) return OVERRIDES[name];
  
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
  // Find companies that need domain fixes (auto-generated slug-style domains)
  const needsFix = companies.filter(c => {
    const domain = c.domain || '';
    return domain.includes('-') && domain.endsWith('.com');
  });
  
  console.log(`Total companies: ${companies.length}`);
  console.log(`Companies needing domain fix: ${needsFix.length}`);
  
  // Get unique company names that need fixing
  const uniqueNames = [...new Set(needsFix.map(c => c.name))];
  console.log(`Unique company names to look up: ${uniqueNames.length}`);
  
  // Fetch domains for unique names
  const domainMap = {};
  const chunkSize = 10;
  for (let i = 0; i < uniqueNames.length; i += chunkSize) {
    const chunk = uniqueNames.slice(i, i + chunkSize);
    const promises = chunk.map(async (name) => {
      const domain = await fetchDomain(name);
      if (domain) {
        domainMap[name] = domain;
      }
    });
    await Promise.all(promises);
    process.stdout.write(`\rLooking up: ${Math.min(i + chunkSize, uniqueNames.length)} / ${uniqueNames.length}`);
  }
  
  console.log(`\nResolved ${Object.keys(domainMap).length} domains.`);
  
  // Apply domain fixes to all companies
  let fixed = 0;
  for (const company of companies) {
    // Apply override or API result
    if (OVERRIDES[company.name]) {
      company.domain = OVERRIDES[company.name];
      fixed++;
    } else if (domainMap[company.name]) {
      company.domain = domainMap[company.name];
      fixed++;
    }
  }
  
  console.log(`Fixed ${fixed} company domains.`);
  
  // Save
  fs.writeFileSync(path, JSON.stringify(companies, null, 2));
  console.log('Saved successfully.');
  
  // Print remaining auto-generated domains
  const remaining = companies.filter(c => {
    const d = c.domain || '';
    return d.includes('-') && d.endsWith('.com');
  });
  console.log(`\nRemaining auto-generated domains: ${remaining.length}`);
  for (const c of remaining.slice(0, 20)) {
    console.log(`  ${c.name}: ${c.domain}`);
  }
}

run();
