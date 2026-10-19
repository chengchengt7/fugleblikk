const ARTSDATABANKEN_API_ENDPOINT = "https://nortaxa.artsdatabanken.no/api/v1";

export const BIRD_OBSERVATIONS_API_ENDPOINT =
  "https://artskart.artsdatabanken.no/publicapi/api/observations/list";

export const BIRD_OBSERVATION_SUMMARY_API_ENDPOINT =
  "https://artskart.artsdatabanken.no/appapi/api/data/GetObservationTaxonCount/";
  
export const OBSERVED_TAXONOMY_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/DataTransfer/Export?scientificNameId=252&includeSynonyms=true&includeVernacularNames=true&exportType=Csv`;
