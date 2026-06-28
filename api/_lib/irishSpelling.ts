/** American → Irish English, longest matches first. */
const SPELLING_RULES: [string, string][] = [
  ["organizational", "organisational"],
  ["organizations", "organisations"],
  ["organization", "organisation"],
  ["organizing", "organising"],
  ["organized", "organised"],
  ["organizes", "organises"],
  ["organize", "organise"],
  ["specialization", "specialisation"],
  ["specializing", "specialising"],
  ["specialized", "specialised"],
  ["specializes", "specialises"],
  ["specialize", "specialise"],
  ["prioritization", "prioritisation"],
  ["prioritizing", "prioritising"],
  ["prioritized", "prioritised"],
  ["prioritizes", "prioritises"],
  ["prioritize", "prioritise"],
  ["recognizing", "recognising"],
  ["recognized", "recognised"],
  ["recognizes", "recognises"],
  ["recognize", "recognise"],
  ["analyzing", "analysing"],
  ["analyzed", "analysed"],
  ["analyzes", "analyses"],
  ["analyze", "analyse"],
  ["behavioral", "behavioural"],
  ["behaviors", "behaviours"],
  ["behavior", "behaviour"],
  ["favorites", "favourites"],
  ["favorite", "favourite"],
  ["favors", "favours"],
  ["favor", "favour"],
  ["honors", "honours"],
  ["honored", "honoured"],
  ["honor", "honour"],
  ["neighbors", "neighbours"],
  ["neighbor", "neighbour"],
  ["labeled", "labelled"],
  ["labeling", "labelling"],
  ["modeling", "modelling"],
  ["traveled", "travelled"],
  ["traveling", "travelling"],
  ["traveler", "traveller"],
  ["counselor", "counsellor"],
  ["counselors", "counsellors"],
  ["defense", "defence"],
  ["centered", "centred"],
  ["centering", "centring"],
  ["centers", "centres"],
  ["center", "centre"],
  ["colors", "colours"],
  ["colored", "coloured"],
  ["color", "colour"],
  ["labor", "labour"],
];

function preserveCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function applyIrishSpelling(text: string): string {
  if (!text) return text;

  let result = text;
  for (const [american, irish] of SPELLING_RULES) {
    const pattern = new RegExp(`\\b${american}\\b`, "gi");
    result = result.replace(pattern, (match) => preserveCase(match, irish));
  }
  return result;
}
