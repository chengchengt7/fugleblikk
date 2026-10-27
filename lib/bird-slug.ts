export function birdSlug(name: string) {
  return name.normalize("NFC").trim().toLocaleLowerCase("nb-NO");
}
