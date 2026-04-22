/**
 * Sri Lanka Location Data
 * Provinces → Districts → Cities/Towns
 */
const SL_LOCATIONS = {
  "Western": {
    "Colombo": ["Colombo 1-15", "Avissawella", "Battaramulla", "Boralesgamuwa", "Dehiwala", "Hanwella", "Homagama", "Kaduwela", "Kesbewa", "Kohuwala", "Kolonnawa", "Kottawa", "Kotte", "Malabe", "Maharagama", "Mount Lavinia", "Moratuwa", "Mulleriyawa", "Nawala", "Nugegoda", "Padukka", "Pannipitiya", "Piliyandala", "Rajagiriya", "Ratmalana", "Talawatugoda", "Wellampitiya"],
    "Gampaha": ["Gampaha", "Attanagalla", "Biyagama", "Delgoda", "Divulapitiya", "Dompe", "Ekala", "Ganemulla", "Ja-Ela", "Kadawatha", "Kandana", "Katunayake", "Kelaniya", "Kiribathgoda", "Minuwangoda", "Mirigama", "Negombo", "Nittambuwa", "Ragama", "Sapugaskanda", "Veyangoda", "Wattala"],
    "Kalutara": ["Kalutara", "Agalawatta", "Aluthgama", "Bandaragama", "Beruwala", "Bulathsinhala", "Dodangoda", "Horana", "Ingiriya", "Matugama", "Mathugama", "Panadura", "Wadduwa"]
  },
  "Central": {
    "Kandy": ["Kandy", "Akurana", "Digana", "Gampola", "Gelioya", "Kadugannawa", "Katugastota", "Kundasale", "Madawala", "Nawalapitiya", "Peradeniya", "Pilimathalawa", "Teldeniya", "Wattegama"],
    "Matale": ["Matale", "Dambulla", "Galewela", "Naula", "Pallepola", "Rattota", "Sigiriya", "Ukuwela", "Yatawatta"],
    "Nuwara Eliya": ["Nuwara Eliya", "Agarapatana", "Ambagamuwa", "Ginigathhena", "Hanguranketha", "Hatton", "Kotmale", "Maskeliya", "Nanu Oya", "Ragala", "Talawakele", "Walapane"]
  },
  "Southern": {
    "Galle": ["Galle", "Ahangama", "Ambalangoda", "Baddegama", "Bentota", "Elpitiya", "Habaraduwa", "Hikkaduwa", "Hiniduma", "Imaduwa", "Karapitiya", "Koggala", "Neluwa", "Udugama"],
    "Matara": ["Matara", "Akuressa", "Deniyaya", "Devinuwara", "Dickwella", "Hakmana", "Kamburupitiya", "Kekanadura", "Mirissa", "Thihagoda", "Weligama"],
    "Hambantota": ["Hambantota", "Ambalantota", "Angunakolapelessa", "Beliatta", "Kataragama", "Middeniya", "Suriyawewa", "Tangalle", "Tissamaharama", "Walasmulla", "Weeraketiya"]
  },
  "Northern": {
    "Jaffna": ["Jaffna", "Chavakachcheri", "Chunnakam", "Delft", "Kayts", "Kopay", "Manipay", "Nallur", "Point Pedro", "Tellippalai", "Velanai"],
    "Kilinochchi": ["Kilinochchi", "Kandavalai", "Karachchi", "Pallai", "Pooneryn"],
    "Mannar": ["Mannar", "Madhu", "Musali", "Nanattan", "Silavatturai"],
    "Mullaitivu": ["Mullaitivu", "Oddusuddan", "Puthukkudiyiruppu", "Thunukkai"],
    "Vavuniya": ["Vavuniya", "Cheddikulam", "Nedunkeni", "Vavuniya South"]
  },
  "Eastern": {
    "Trincomalee": ["Trincomalee", "Gomarankadawala", "Kantale", "Kinniya", "Kuchchaveli", "Mutur", "Seruvila"],
    "Batticaloa": ["Batticaloa", "Araiyampathy", "Chenkalady", "Eravur", "Kaluwanchikudy", "Kattankudy", "Oddamavadi", "Valaichchenai"],
    "Ampara": ["Ampara", "Akkaraipattu", "Addalaichenai", "Dehiattakandiya", "Kalmunai", "Mahaoya", "Padiyathalawa", "Pottuvil", "Sainthamaruthu", "Samanthurai", "Uhana"]
  },
  "North Western": {
    "Kurunegala": ["Kurunegala", "Alawwa", "Bingiriya", "Dambadeniya", "Galgamuwa", "Ibbagamuwa", "Kuliyapitiya", "Mawathagama", "Narammala", "Nikaweratiya", "Pannala", "Polgahawela", "Wariyapola"],
    "Puttalam": ["Puttalam", "Anamaduwa", "Chilaw", "Dankotuwa", "Kalpitiya", "Madampe", "Marawila", "Nattandiya", "Nuraicholai", "Wennappuwa"]
  },
  "North Central": {
    "Anuradhapura": ["Anuradhapura", "Eppawala", "Galenbindunuwewa", "Galnewa", "Habarana", "Kahatagasdigiliya", "Kekirawa", "Medawachchiya", "Mihintale", "Nochchiyagama", "Padaviya", "Talawa", "Tambuttegama"],
    "Polonnaruwa": ["Polonnaruwa", "Bakamoona", "Hingurakgoda", "Kaduruwela", "Lankapura", "Medirigiriya", "Thamankaduwa", "Welikanda"]
  },
  "Uva": {
    "Badulla": ["Badulla", "Bandarawela", "Diyatalawa", "Ella", "Hali-Ela", "Haputale", "Mahiyanganaya", "Passara", "Welimada"],
    "Monaragala": ["Monaragala", "Bibile", "Buttala", "Kataragama", "Medagama", "Sevanagala", "Siyambalanduwa", "Wellawaya"]
  },
  "Sabaragamuwa": {
    "Ratnapura": ["Ratnapura", "Ayagama", "Balangoda", "Eheliyagoda", "Embilipitiya", "Godakawela", "Kahawatta", "Kiriella", "Kuruvita", "Nivithigala", "Pelmadulla", "Rakwana"],
    "Kegalle": ["Kegalle", "Aranayake", "Bulathkohupitiya", "Dehiowita", "Deraniyagala", "Galigamuwa", "Mawanella", "Rambukkana", "Ruwanwella", "Warakapola", "Yatiyanthota"]
  }
};

/**
 * Populate a <select> element with options.
 * @param {HTMLSelectElement} selectEl
 * @param {string[]} options
 * @param {string} [placeholder]
 */
function populateSelect(selectEl, options, placeholder = 'Select...') {
  selectEl.innerHTML = `<option value="" disabled selected>${placeholder}</option>` +
    options.map(o => `<option value="${o}">${o}</option>`).join('');
}

/**
 * Initialize the cascading province → district → city dropdowns.
 * @param {string} provinceId
 * @param {string} districtId
 * @param {string} cityId
 * @param {Function} [onLocationChange] - callback(province, district, city)
 */
function initLocationDropdowns(provinceId, districtId, cityId, onLocationChange) {
  const provinceEl = document.getElementById(provinceId);
  const districtEl = document.getElementById(districtId);
  const cityEl = document.getElementById(cityId);

  if (!provinceEl || !districtEl || !cityEl) return;

  // Populate provinces
  populateSelect(provinceEl, Object.keys(SL_LOCATIONS), 'Select Province');
  populateSelect(districtEl, [], 'Select District');
  populateSelect(cityEl, [], 'Select City / Area');
  districtEl.disabled = true;
  cityEl.disabled = true;

  provinceEl.addEventListener('change', () => {
    const districts = Object.keys(SL_LOCATIONS[provinceEl.value] || {});
    populateSelect(districtEl, districts, 'Select District');
    districtEl.disabled = districts.length === 0;
    populateSelect(cityEl, [], 'Select City / Area');
    cityEl.disabled = true;
    if (onLocationChange) onLocationChange(provinceEl.value, '', '');
  });

  districtEl.addEventListener('change', () => {
    const cities = SL_LOCATIONS[provinceEl.value]?.[districtEl.value] || [];
    populateSelect(cityEl, cities, 'Select City / Area');
    cityEl.disabled = cities.length === 0;
    if (onLocationChange) onLocationChange(provinceEl.value, districtEl.value, '');
  });

  cityEl.addEventListener('change', () => {
    if (onLocationChange) onLocationChange(provinceEl.value, districtEl.value, cityEl.value);
  });
}
