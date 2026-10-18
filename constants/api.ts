const ARTSDATABANKEN_API_ENDPOINT = "https://nortaxa.artsdatabanken.no/api/v1";

// Scientific name ID 252 is Aves (birds). This endpoint returns CSV.
export const BIRD_TAXONOMY_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/DataTransfer/Export?scientificNameId=252&includeSynonyms=false&includeVernacularNames=true&exportType=Csv`;

export const BIRD_SEARCH_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/TaxonName/Search`;

export const BIRD_DETAILS_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/TaxonName/ByTaxonId`;

export const XENO_CANTO_API_ENDPOINT =
  "https://xeno-canto.org/api/3/recordings";

// Observation preparation includes all public providers and all precision bands.
export const BIRD_OBSERVATIONS_API_ENDPOINT =
  "https://artskart.artsdatabanken.no/publicapi/api/observations/list";
export const BIRD_OBSERVATION_SUMMARY_API_ENDPOINT =
  "https://artskart.artsdatabanken.no/appapi/api/data/GetObservationTaxonCount/";
export const OBSERVED_TAXONOMY_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/DataTransfer/Export?scientificNameId=252&includeSynonyms=true&includeVernacularNames=true&exportType=Csv`;
export const NORWEGIAN_SCOPE_API_ENDPOINT =
  "https://geo.vliz.be/geoserver/MarineRegions/wfs";
