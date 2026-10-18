const ARTSDATABANKEN_API_ENDPOINT = "https://nortaxa.artsdatabanken.no/api/v1";

// Scientific name ID 252 is Aves (birds). This endpoint returns CSV.
export const BIRD_TAXONOMY_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/DataTransfer/Export?scientificNameId=252&includeSynonyms=false&includeVernacularNames=true&exportType=Csv`;

export const BIRD_SEARCH_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/TaxonName/Search`;

export const BIRD_DETAILS_API_ENDPOINT = `${ARTSDATABANKEN_API_ENDPOINT}/TaxonName/ByTaxonId`;

export const XENO_CANTO_API_ENDPOINT = "https://xeno-canto.org/api/3/recordings";
