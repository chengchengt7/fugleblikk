// Artsdatabanken: taxonomy and Norwegian bird names
const ARTSDATABANKEN_API_ENDPOINT = "https://nortaxa.artsdatabanken.no/api/v1";
export const ARTSDATABANKEN_SPECIES_PAGE_ENDPOINT = "https://artsdatabanken.no/arter/takson";

export const OBSERVED_TAXONOMY_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/DataTransfer/Export?scientificNameId=252&includeSynonyms=true&includeVernacularNames=true&exportType=Csv`;

export const ARTSDATABANKEN_NAME_SEARCH_API_ENDPOINT = "https://lookup.artsdatabanken.no/v1/query";

// Artskart: observation counts and records
export const BIRD_OBSERVATION_SUMMARY_API_ENDPOINT = "https://artskart.artsdatabanken.no/appapi/api/data/GetObservationTaxonCount/";

export const BIRD_OBSERVATIONS_API_ENDPOINT = "https://artskart.artsdatabanken.no/publicapi/api/observations/list";

// iNaturalist: English names and bird photos
export const INATURALIST_TAXON_AUTOCOMPLETE_API_ENDPOINT = "https://api.inaturalist.org/v1/taxa/autocomplete";

export const INATURALIST_TAXA_API_ENDPOINT = "https://api.inaturalist.org/v1/taxa";

// Wikipedia: description fallback
export const WIKIPEDIA_PAGE_SUMMARY_API_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary";

// Xeno-canto: recording metadata for monthly preparation
export const XENO_CANTO_RECORDINGS_API_ENDPOINT = "https://xeno-canto.org/api/3/recordings";

// MapTiler: satellite globe imagery
export const MAPTILER_SATELLITE_TILEJSON_ENDPOINT = "https://api.maptiler.com/maps/satellite-v4/tiles.json";
