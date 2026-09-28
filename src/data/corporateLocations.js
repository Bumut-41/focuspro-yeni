const TR_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

export const CORPORATE_COUNTRIES = [
  { code: "TR", name: "Türkiye", cities: TR_CITIES },
  { code: "DE", name: "Almanya", cities: ["Berlin", "Münih", "Hamburg", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"] },
  { code: "US", name: "Amerika Birleşik Devletleri", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"] },
  { code: "GB", name: "Birleşik Krallık", cities: ["Londra", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Edinburgh", "Bristol", "Cardiff", "Belfast"] },
  { code: "FR", name: "Fransa", cities: ["Paris", "Marsilya", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"] },
  { code: "NL", name: "Hollanda", cities: ["Amsterdam", "Rotterdam", "Lahey", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere"] },
  { code: "AZ", name: "Azerbaycan", cities: ["Bakü", "Gence", "Sumgayıt", "Mingeçevir", "Şirvan", "Nahçıvan"] },
  { code: "CY", name: "Kıbrıs", cities: ["Lefkoşa", "Girne", "Gazimağusa", "Güzelyurt", "Lefke", "İskele"] },
  { code: "AE", name: "Birleşik Arap Emirlikleri", cities: ["Dubai", "Abu Dabi", "Şarika", "Acman", "Ras Al Khaimah"] },
  { code: "SA", name: "Suudi Arabistan", cities: ["Riyad", "Cidde", "Mekke", "Medine", "Dammam"] },
  { code: "QA", name: "Katar", cities: ["Doha", "Al Rayyan", "Al Wakrah"] },
  { code: "KZ", name: "Kazakistan", cities: ["Astana", "Almatı", "Şımkent", "Aktau"] },
  { code: "GE", name: "Gürcistan", cities: ["Tiflis", "Batum", "Kutaisi"] },
  { code: "BG", name: "Bulgaristan", cities: ["Sofya", "Filibe", "Varna", "Burgaz"] },
  { code: "GR", name: "Yunanistan", cities: ["Atina", "Selanik", "Patras", "Heraklion"] }
];

export function citiesForCountry(code) {
  return CORPORATE_COUNTRIES.find((country) => country.code === code)?.cities ?? [];
}
