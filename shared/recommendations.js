const categoryTerms = {
  "coffee-stroll": /coffee|tea|café|cafe|stroll|\bté\b|paseo|\bch[aá](?=\s|[,.;]|$)|passeio/i,
  "board-games": /board.?game|competition|juegos? de mesa|competici[oó]n|jogos? de tabuleiro|competi[cç][aã]o/i,
  "pottery-workshop": /pottery|clay|workshop|making|creative|cer[aá]mica|arcilla|taller|creativ|acuarela|aquarela|argila|oficina/i,
  "outdoor-walk": /walk|hike|coastal|outdoor|fresh air|day trip|paseo|senderismo|costero|aire libre|excursi[oó]n|caminhada|trilha|ar livre|passeio|beira.mar|excurs[aã]o/i,
  "dinner-out": /dinner|food|tapas|wine|restaurant|cena|comida|vino|jantar|vinho|restaurante/i,
  retreat: /retreat|spa|wellness|wellbeing|retiro|bienestar|bem.estar/i,
  gallery: /gallery|exhibition|art museum|galer[ií]a|exposici[oó]n|museo|galeria|exposi[cç][aã]o|museu/i,
  cinema: /cinema|film|movie|cine|pel[ií]cula/i,
};
export const categoryLabels = {
  "coffee-stroll": "Coffee & a stroll", "board-games": "Board games",
  "pottery-workshop": "Creative workshop", "outdoor-walk": "Outdoor walk",
  "dinner-out": "Dinner out", retreat: "Wellbeing & retreats", gallery: "Gallery", cinema: "Cinema",
};
export function activityCategories(value = "") {
  return Object.entries(categoryTerms).filter(([, pattern]) => pattern.test(String(value))).map(([category]) => category);
}
// Names, ages, personality types and gender play no part in ordering ideas.
// Private free-text preferences are interpreted only in the visitor's browser.
export function rankIdeas(ideas, friends = [], preferences = {}) {
  return ideas.map((idea, index) => {
    const category = idea.category || idea.iconName;
    let score = 0;
    const reasons = new Set();
    for (const friend of friends) {
      const likes = [friend.likes, ...(friend.interests || [])].filter(Boolean).join(" ");
      if (activityCategories(likes).includes(category)) { score += 2; reasons.add("Matches a saved interest"); }
      if (activityCategories(friend.avoids).includes(category)) score -= 3;
      const quiet = /quiet|low.key|tranquil|sil[eê]ncio|silencios|sosseg/i.test([friend.note, likes].join(" ")) || /loud|noisy|crowd|ruidos|multitud|barulh|multid[aã]o/i.test(friend.avoids || "");
      if (quiet && idea.noise === "low") { score += 1; reasons.add("A quieter option"); }
      if (quiet && idea.noise === "high") score -= 2;
    }
    if (preferences.profile?.pace === "Low key") {
      if (idea.noise === "low") { score += 1; reasons.add("Fits your low-key pace"); }
      if (idea.noise === "high") score -= 2;
    }
    if (preferences.discovery?.accessible && idea.mobilityAccessible) {
      score += 1; reasons.add("Has a starter accessibility note; confirm with the venue");
    }
    return { ...idea, reason: [...reasons].join(" · "), score, order: index };
  }).sort((a, b) => b.score - a.score || a.order - b.order);
}
