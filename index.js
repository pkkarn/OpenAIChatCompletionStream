const { Configuration, OpenAIApi } = require("openai");

function parseData(input) {
    // Split by "data:" and filter out any empty strings
    const dataStrings = input.split('data:').slice(1); // The first element will be empty, so slice it off
  
    return dataStrings.map(dataString => {
      const trimmedString = dataString.trim(); // Remove any extra whitespace
      
      if (trimmedString === '[DONE]') {
        return '[DONE]';
      }
  
      const sanitizedString = trimmedString.replace(/\n/g, "\\n"); // Replace newline characters with escaped version
      return JSON.parse(sanitizedString); // Parse the sanitized JSON string
    });
}

async function chatCompeletionStream(prompt, apiKey, onData) {
    
    const configuration = new Configuration({
        apiKey: apiKey,
    });

    const openai = new OpenAIApi(configuration);
    
    
	const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
    }, { responseType: 'stream' });
    
    const stream = completion.data

	// Remainder chunk - When json is incomplete

	let output = '';

	const processedChunks = new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            const listOfOutput = parseData(chunk.toString())

            listOfOutput.forEach(output => {
            if(output !== '[DONE]') {
                const result = `${output.choices[0].delta?.content || ''}`  
                output += result
                onData(result)
            }
          })
        });
        
        stream.on('end', () => {
            setTimeout(() => {
                resolve(output)
            }, 10);
        });
        
        stream.on('error', (err) => {
            reject(err);
        });
		
	});

	return processedChunks;
}

chatCompeletionStrea(
'write a programm of linked list and explain it in javascirpt', 
'OPENAI_KEY', 
(chunk) => {
    console.log(chunk)
})

/***

Output:

Sure! Here's an example of a LinkedList program written in JavaScript:

```javascript
// Define a class for the Node
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// Define a class for the LinkedList
class LinkedList constructor {
 () {
    this.head = null;
    this.size = 0;


and so on...
***/

module.exports = { chatCompeletionStream }
