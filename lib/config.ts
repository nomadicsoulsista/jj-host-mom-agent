export const CHAPTER_NAME = "Jack and Jill of America, Inc. — Montgomery County, MD Chapter";
export const APP_NAME = "Host Mom Activity Planner";

export const GRADE_GROUPS = [
  { id: "Poos", label: "Poos", grades: "Pre-3, Pre-4 and under", ages: "ages 2–4" },
  { id: "G2", label: "Group 2", grades: "Kindergarten – Grade 1", ages: "ages 5–7" },
  { id: "G3", label: "Group 3", grades: "Grades 2–3", ages: "ages 7–9" },
  { id: "G4", label: "Group 4", grades: "Grades 4–5", ages: "ages 9–11" },
  { id: "G5", label: "Group 5", grades: "Grades 6–8", ages: "ages 11–14" },
  { id: "G6", label: "Group 6", grades: "Grades 9–12", ages: "ages 14–18" },
] as const;

export type GradeGroupId = (typeof GRADE_GROUPS)[number]["id"];

export const THRUSTS = [
  { id: "cultural", label: "Cultural", blurb: "Heritage, arts, history, and identity." },
  { id: "educational", label: "Educational", blurb: "Academic enrichment, STEM, literacy, careers." },
  { id: "civic", label: "Civic / Legislative", blurb: "Advocacy, voting, government, community service." },
  { id: "health", label: "Health", blurb: "Physical, mental, and emotional wellness." },
  { id: "social", label: "Social / Recreational", blurb: "Friendship, fun, and polished social skills." },
] as const;

export const BRAND = {
  blue: "#9DC3E6",
  pink: "#D4A5C0",
  ink: "#111111",
};
