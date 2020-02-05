const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apikey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){

 await fetchContentFromWikiPedia(content)
 sanitizeContent(content)
 breakContentIntoSentences(content)

 async function fetchContentFromWikiPedia(content){

   const searchTermPT = {
      "articleName": content.searchTerm,
      "lang": "pt"
    };

   const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
   const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
   const WikipediaResponse = await wikipediaAlgorithm.pipe(searchTermPT)
   const wikipediaContent = WikipediaResponse.get()
    
    content.sourceContentOriginal = wikipediaContent.content
}  


function sanitizeContent(content){

      const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)   
      const withoutDatesInParentheses = removewithoutDatesInParentheses(withoutBlankLinesAndMarkdown)
      content.sourceContentSanitized = withoutDatesInParentheses    

      function removeBlankLinesAndMarkdown(text){
         const allLines = text.split('\n')
      
         const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
            if(line.trim().length === 0 || line.trim().startsWith('=')){
              return false
            }
            return true
         }) 
         return withoutBlankLinesAndMarkdown.join(' ')
      }

      function removewithoutDatesInParentheses (text){
         return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
         
      }
     
   }

   function breakContentIntoSentences(content){
      content.sentences = []

      const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
      sentences.forEach((sentence) => {
         content.sentences.push({
            text: sentence,
            keywords: [],
            images: []
         })
      })
   

   }

}

module.exports = robot