/**
 * Sri Lanka Location Data
 * Provinces → Districts → Cities/Towns
 */
const SL_LOCATIONS = {
  "Western": {
    "Colombo": [
      "Athurugiriya", "Avissawella", "Battaramulla", "Boralesgamuwa", "Colombo 01", "Colombo 02", "Colombo 03", "Colombo 04", "Colombo 05", "Colombo 06", "Colombo 07", "Colombo 08", "Colombo 09", "Colombo 10", "Colombo 11", "Colombo 12", "Colombo 13", "Colombo 14", "Colombo 15", "Dehiwala", "Hanwella", "Hokandara", "Homagama", "Kaduwela", "Kesbewa", "Kohuwala", "Kolonnawa", "Kosgama", "Kottawa", "Maharagama", "Makumbura", "Malabe", "Moratuwa", "Mount Lavinia", "Nawala", "Nugegoda", "Padukka", "Pannipitiya", "Piliyandala", "Rajagiriya", "Ratmalana", "Sri Jayawardenepura Kotte"
    ],
    "Gampaha": [
      "Biyagama", "Delgoda", "Divulapitiya", "Dompe", "Ekala", "Gampaha", "Ganemulla", "Hendala", "Ja-Ela", "Kadawatha", "Kandana", "Katunayake", "Kelaniya", "Kiribathgoda", "Mahara", "Minuwangoda", "Mirigama", "Negombo", "Nittambuwa", "Peliyagoda", "Ragama", "Seeduwa", "Thihariya", "Udugampola", "Veyangoda", "Wattala", "Yakkala"
    ],
    "Kalutara": [
      "Agalawatta", "Aluthgama", "Bandaragama", "Beruwala", "Bulathsinhala", "Dodangoda", "Horana", "Ingiriya", "Kalutara", "Katukurunda", "Maggona", "Matugama", "Panadura", "Payagala", "Wadduwa", "Walallawita"
    ]
  },
  "Central": {
    "Kandy": [
      "Akurana", "Alawatugoda", "Digana", "Galagedara", "Gampola", "Gelioya", "Hasalaka", "Kadugannawa", "Kandy", "Katugastota", "Kundasale", "Madawala", "Menikhinna", "Nawalapitiya", "Peradeniya", "Pilimathalawa", "Poojapitiya", "Teldeniya", "Ukuwela", "Wattegama", "Weligalla"
    ],
    "Matale": [
      "Dambulla", "Galewela", "Laggala", "Matale", "Naula", "Palapathwela", "Pallepola", "Rattota", "Sigiriya", "Ukuwela", "Yatawatta"
    ],
    "Nuwara Eliya": [
      "Agarapathana", "Ambagamuwa", "Bogawantalawa", "Dickoya", "Ginigathhena", "Hanguranketha", "Hatton", "Kotagala", "Kotmale", "Maskeliya", "Nallathanniya", "Nanu Oya", "Norwood", "Nuwara Eliya", "Pundaluoya", "Ragala", "Rikillagaskada", "Talawakele", "Walapane"
    ]
  },
  "Southern": {
    "Galle": [
      "Ahangama", "Ambalangoda", "Baddegama", "Batapola", "Bentota", "Boossa", "Elpitiya", "Galle", "Habaraduwa", "Hikkaduwa", "Imaduwa", "Karandeniya", "Karapitiya", "Koggala", "Nagoda", "Neluwa", "Pitigala", "Thawalama", "Unawatuna", "Uragasmanhandiya", "Wanduramba", "Yakkalamulla"
    ],
    "Matara": [
      "Akuressa", "Deniyaya", "Devinuwara", "Dickwella", "Gandara", "Hakmana", "Kamburupitiya", "Kotapola", "Makandura", "Matara", "Mirissa", "Morawaka", "Mulatiyana", "Pasgoda", "Pitabeddara", "Thihagoda", "Urubokka", "Weligama"
    ],
    "Hambantota": [
      "Ambalantota", "Angunakolapelessa", "Beliatta", "Hambantota", "Hungama", "Kataragama", "Lunugamvehera", "Middeniya", "Ranna", "Sooriyawewa", "Tangalle", "Tissamaharama", "Walasmulla", "Weeraketiya"
    ]
  },
  "Northern": {
    "Jaffna": [
      "Alaveddy", "Chavakachcheri", "Chunnakam", "Inuvil", "Jaffna", "Karainagar", "Karaveddy", "Kayts", "Kokuvil", "Kondavil", "Kopay", "Manipay", "Nallur", "Point Pedro", "Tellippalai", "Vaddukoddai", "Valvettithurai", "Velanai"
    ],
    "Kilinochchi": [
      "Akkarayankulam", "Dharmapuram", "Kandavalai", "Karachchi", "Kilinochchi", "Pallai", "Paranthan", "Pooneryn"
    ],
    "Mannar": [
      "Adampan", "Madhu", "Mannar", "Murunkan", "Musali", "Nanattan", "Pesalai", "Silavathurai", "Talaimannar"
    ],
    "Mullaitivu": [
      "Mallavi", "Mankulam", "Manthai East", "Maritimepattu", "Mullaitivu", "Oddusuddan", "Puthukkudiyiruppu", "Thunukkai", "Welioya"
    ],
    "Vavuniya": [
      "Cheddikulam", "Nedunkeni", "Omanthai", "Padaviya", "Pampaimadu", "Vavuniya", "Vavuniya South", "Vengalacheddikulam"
    ]
  },
  "Eastern": {
    "Trincomalee": [
      "Gomarankadawala", "Kantale", "Kinniya", "Kuchchaveli", "Morawewa", "Mutur", "Nilaveli", "Serunuwara", "Seruvila", "Thambalagamuwa", "Trincomalee", "Uppuveli"
    ],
    "Batticaloa": [
      "Batticaloa", "Chenkalady", "Eravur", "Kalkudah", "Kalmunai", "Kaluwanchikudy", "Kattankudy", "Kiran", "Kokkadichcholai", "Manmunai North", "Manmunai South", "Oddamavadi", "Paddippalai", "Pasikudah", "Valaichchenai"
    ],
    "Ampara": [
      "Addalaichenai", "Akkaraipattu", "Ampara", "Arugam Bay", "Damana", "Dehiattakandiya", "Kalmunai", "Lahugala", "Maha Oya", "Nintavur", "Panama", "Pottuvil", "Sainthamaruthu", "Samanthurai", "Uhana"
    ]
  },
  "North Western": {
    "Kurunegala": [
      "Alawwa", "Bingiriya", "Dambadeniya", "Dodangaslanda", "Galgamuwa", "Giriulla", "Hettipola", "Ibbagamuwa", "Kuliyapitiya", "Kurunegala", "Maho", "Mawathagama", "Melsiripura", "Narammala", "Nikaweratiya", "Pannala", "Polgahawela", "Polpithigama", "Wariyapola"
    ],
    "Puttalam": [
      "Anamaduwa", "Arachchikattuwa", "Chilaw", "Dankotuwa", "Kalpitiya", "Madampe", "Mahawewa", "Marawila", "Mundel", "Nattandiya", "Navakkuli", "Norochcholai", "Puttalam", "Wennappuwa"
    ]
  },
  "North Central": {
    "Anuradhapura": [
      "Anuradhapura", "Eppawala", "Galnewa", "Horowpothana", "Kahatagasdigiliya", "Kebithigollewa", "Kekirawa", "Medawachchiya", "Mihintale", "Nochchiyagama", "Padaviya", "Rajanganaya", "Talawa", "Tambuttegama"
    ],
    "Polonnaruwa": [
      "Aralaganwila", "Bakamuna", "Dimbulagala", "Giritale", "Hingurakgoda", "Kaduruwela", "Lankapura", "Manampitiya", "Medirigiriya", "Minneriya", "Polonnaruwa", "Thamankaduwa", "Welikanda"
    ]
  },
  "Uva": {
    "Badulla": [
      "Badulla", "Bandarawela", "Diyatalawa", "Ella", "Haldummulla", "Hali-Ela", "Haputale", "Kandaketiya", "Lunugala", "Mahiyanganaya", "Meegahakivula", "Passara", "Rideemaliyadda", "Uva-Paranagama", "Welimada"
    ],
    "Monaragala": [
      "Bibile", "Buttala", "Katharagama", "Madulla", "Medagama", "Monaragala", "Okkampitiya", "Sevanagala", "Siyambalanduwa", "Thanamalwila", "Wellawaya"
    ]
  },
  "Sabaragamuwa": {
    "Ratnapura": [
      "Ayagama", "Balangoda", "Eheliyagoda", "Embilipitiya", "Godakawela", "Imbulpe", "Kahawatta", "Kalawana", "Kiriella", "Kuruvita", "Nivithigala", "Opanayake", "Pelmadulla", "Rakwana", "Ratnapura"
    ],
    "Kegalle": [
      "Aranayake", "Bulathkohupitiya", "Dehiowita", "Deraniyagala", "Galigamuwa", "Kegalle", "Mawanella", "Rambukkana", "Ruwanwella", "Warakapola", "Yatiyanthota"
    ]
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
