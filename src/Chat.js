import React, { useEffect, useState } from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'
var Buffer = require('buffer/').Buffer

const convert = (from, to) => str => Buffer.from(str, from).toString(to)
const { Configuration, OpenAIApi } = require("openai");
var encryptedKey = "736b2d4131367a6e53786b695177704439566554314c4b5433426c626b464a4f56765a78483430546a3578566d61704d37714c"
const hexToUtf8 = convert('hex', 'utf8')
const configuration = new Configuration({
  apiKey: hexToUtf8(encryptedKey),
});
delete configuration.baseOptions.headers['User-Agent'];
const openai = new OpenAIApi(configuration);
function refreshPage() {
    window.location.reload(false);
  }
  

function Chat({socket, username, room, token}) {
    const [currentMessage,SetcurrentMessage] = useState('')
    const [messageList,setMessageList] = useState([])
    const [value,Setvalue] = useState('')


    const sendMessage = async () => {
        if (currentMessage !== "") {
          const messageData = {
            room: room,
            author: username,
            message: currentMessage,
            time:
              new Date(Date.now()).getHours() +
              ":" +
              new Date(Date.now()).getMinutes(),
          };
          await socket.emit("send_message", messageData);
          setMessageList((list) => [...list, messageData]);
          SetcurrentMessage('')

        }
      };

    useEffect(()=> {
        socket.on('receive_message', (data)=> {

            setMessageList((list)=> [...list,data])
            Setvalue(data.message)
        })
    }, [socket])
    
    const toggle = async() => {
      console.log("yes")

      
      // const prompt = 'You are a helpful assistant.';
      // const messages = [
      //   { role: 'system', content: 'You are a helpful assistant.' },
      //   { role: 'user', content: 'Who won the world series in 2020?' },
      //   { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
      //   { role: 'user', content: 'Where was it played?' },
      // ];
      
      // fetch(endpoint, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${apiKey}`,
      //   },
      //   body: JSON.stringify({
      //     model: 'gpt-3.5-turbo',
      //     messages: messages,
      //   }),
      // })
        // .then((response) => response.json())
        // .then((data) => console.log(data))
        // .catch((error) => console.error('Error:', error));
  
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{"role": "user", "content": value}],
          });
          console.log(response)
          console.log(response.data.choices)
          console.log(response.data.choices[0].message.content)
          const chatGpt = response.data.choices[0].message.content
          console.log('this is from open')
      
          SetcurrentMessage(chatGpt)

    }
    
    return (
        <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
            id='chat'
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            SetcurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={toggle}>Toggle</button>
        <button type='submit' onClick={sendMessage}>&#9658;</button>
      </div>
      <div className='d-flex justify-content-center mt-5'>
        <button type="button" onClick={refreshPage} class="btn btn-dark">Logout</button>
      </div>
    </div>
    )
}

export default Chat