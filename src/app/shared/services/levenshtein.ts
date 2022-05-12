export function getLevenshteinDistance(adress1: string, adress2: string){
  function levenshtein(string1: string, string2: string) {
    if (adress1.includes(adress2)){
      return 0;
    }
    let matrix = Array.from({ length: string1.length+1 }).map(() => Array.from({ length: string2.length+1 }).map(() => 0))

    let cost = Array.from({ length: string1.length }).map(() => Array.from({ length: string2.length}).map(() => 0))
                
    for (let i = 0; i < string1.length+1; i++) matrix[i][0] = i
      
    for (let j = 0; j < string2.length+2; j++) matrix[0][j] = j
        
    for (let i = 1; i < string1.length+1; i++) {
      for (let j = 1; j < string2.length+1; j++) {
        if (string1[i-1] !== string2[j-1]) {
          cost[i-1][j-1] = 1
        }
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j - 1] + 1, 
          matrix[i - 1][j - 1] + cost[i-1][j-1]
        )
      }
    }   
    return matrix[string1.length][string2.length]
  }
    
  if (levenshtein(adress1, adress2) !== 0) {
    const wordsInAdress1 = adress1.split(/[\s,-]+/);
    const wordsInAdress2 = adress2.split(/[\s,-]+/);
    let levDist = 0;
    for (let word2 of wordsInAdress2){
      let levenshteinDistance = Infinity;
      for (let word1 of wordsInAdress1){
        let levenshteinDist = levenshtein(word1, word2);
        if (levenshteinDist < levenshteinDistance){
          levenshteinDistance = levenshteinDist;
        }
      }
      levDist += levenshteinDistance;
    }
    return levDist/wordsInAdress2.length;
  }
  return levenshtein(adress1, adress2);   
}