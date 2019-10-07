import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import './Chat.css';

let socket;

// location comes form react-router (has the props `location`)
const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const [users, setUsers] = useState('');
   
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // the server address
  const ENDPOINT = 'localhost:5000';

  // only run when ENDPOINT or search params change
  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    // request to server, have a message to `io.on('connect', callback)`
    socket = io(ENDPOINT);

    setRoom(room);
    setName(name);

    // message name, payload, callback called by the server
    socket.emit('join', { name, room }, (error) => {
      if(error) {
        console.log(error);
      }
    });

  }, [ENDPOINT, location.search])

  // handle messages
  useEffect(() => {
    socket.on('message', (message) => {
      setMessages([...messages, message]);
    });

    socket.on('roomData', ({ users }) => {
      setUsers(users);
    })

    // clean-up  
    return () => {
      socket.emit('disconnect');
      socket.off();
    }
  }, [messages])


  const sendMessage = (event) => {
    // prevent default for key press
    event.preventDefault();

    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }

  // main UI for chatting
  return (
    <div className="outerContainer">
      <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      <TextContainer users={users}/>
    </div>
  );

}

export default Chat;
