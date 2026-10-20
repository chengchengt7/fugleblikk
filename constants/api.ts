// biome-ignore-all format: Keep each endpoint on one line for scanning.
// Artsdatabanken: taxonomy and Norwegian bird names
const ARTSDATABANKEN_API_ENDPOINT = "https://nortaxa.artsdatabanken.no/api/v1";

export const OBSERVED_TAXONOMY_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/DataTransfer/Export?scientificNameId=252&includeSynonyms=true&includeVernacularNames=true&exportType=Csv`;

// Artskart: observation counts and records
export const BIRD_OBSERVATION_SUMMARY_API_ENDPOINT = "https://artskart.artsdatabanken.no/appapi/api/data/GetObservationTaxonCount/";

export const BIRD_OBSERVATIONS_API_ENDPOINT = "https://artskart.artsdatabanken.no/publicapi/api/observations/list";

// iNaturalist: English names and bird photos
export const INATURALIST_TAXON_AUTOCOMPLETE_API_ENDPOINT = "https://api.inaturalist.org/v1/taxa/autocomplete";

export const INATURALIST_TAXA_API_ENDPOINT = "https://api.inaturalist.org/v1/taxa";

// Wikipedia: description fallback
export const WIKIPEDIA_PAGE_SUMMARY_API_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary";

// Xeno-canto: recordings and audio files
export const XENO_CANTO_RECORDINGS_API_ENDPOINT = "https://xeno-canto.org/api/3/recordings";

export const XENO_CANTO_AUDIO_DOWNLOAD_ENDPOINT = "https://xeno-canto.org";