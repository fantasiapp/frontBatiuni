export const requests = {
  INVALID_CONFIG: "Votre configuration est invalide",
  SERVER_UNAVAILABLE: "Le serveur est momentairement indisponible",
  INVALID_CREDENTIALS: "Vos identifiants sont invalides.",
  UNEXPECTED_ERROR: "Erreur inattendue."
};

export const forms = {
  FIELD_MISMATCH: '$1 doit être identique $2.',
  REQUIRED_FIELD: '$1=(Le champ) est obligatoire.',
  MIN_LENGTH: '$1=(Le champ) doit contenir au moins $2=(8) caractères',
  CASE: '$1=(Le champ) doit contenir une lettre en $2=(miniscule)'
};

const arg_expr = /\$(?:\!|(\d+))(?:(\<|\=)\((.*?)\))?/g;
export function build(template: string, ...args: string[]) {
  arg_expr.lastIndex = 0; //reset regexp
  let output = '', lastMatch: any = null;
  while ( true ) {
    const match = arg_expr.exec(template);
    if ( !match ) break;
    const index = +(match[1]),
      def = match[3],
      arg = Number.isNaN(index) ? '$' : (index ? args[index-1] : template),
      deleteLast = (match[2] == '<') && !arg,
      val = arg || def;
    
    if ( val === void 0 ) throw `Unable to evaluate template ${template}. Missing argument or default value.`;
    output += template.slice(lastMatch ? lastMatch.index + lastMatch[0].length : 0, match.index - (+deleteLast)) + val;
    lastMatch = match;
  }

  output += template.slice(lastMatch ? lastMatch.index + lastMatch[0].length : 0);
  return output;
};
