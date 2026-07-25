// Classes and departments only share a link through their names (the
// Class model has no department field) - both "DAE Civil Technology" and
// "DAE Civil Technology - Year 1" resolve to the same "Civil" category via
// this function, which is what lets us match a department to its classes.
export function classCategory(name: string): string | null {
  if (/civil/i.test(name)) return "Civil";
  if (/electrical/i.test(name)) return "Electrical";
  if (/mechanical/i.test(name)) return "Mechanical";
  if (/\bDIT\b|information technology/i.test(name)) return "DIT";
  return null;
}

// Turns a seeded class name like "DAE Civil Technology - Year 1" or
// "Diploma in Information Technology (DIT) - Year 2" into a compact label
// like "Civil 1" / "DIT 2" for dropdowns. Falls back to the raw name for
// anything that doesn't match the expected pattern (e.g. a class an admin
// renamed by hand), so this never hides real data.
export function shortClassLabel(name: string): string {
  const yearMatch = name.match(/Year\s+(\d+)/i);
  const year = yearMatch ? yearMatch[1] : "";
  const category = classCategory(name);

  if (!category) return name;
  return year ? `${category} ${year}` : category;
}
