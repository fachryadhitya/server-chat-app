import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import TextContainer from "../TextContainer/TextContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";

import "./Chat.css";

const ENDPOINT = "http://localhost:5000";

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  const [broadcast, setBroadcast] = useState("");
  const [messages, setMessages] = useState([]);
  const [allRoom, setAllRoom] = useState([]);

  const fetchAllRooms = async () => {
    const data = await fetch(`${ENDPOINT}/allRooms`);
    const result = await data.json();
    setAllRoom(result)
  };

  

  useEffect(() => {
    fetchAllRooms();
  }, []);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name);

    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });

    // socket.on('broadcast', broadcast => {
    //   setMessages(messages => [ ...messages, broadcast ]);
    // });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  const sendAsBroadcast = (event) => {
    event.preventDefault();

    if (broadcast) {
      socket.emit("broadcast", broadcast, () => setBroadcast(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
        <Input
          message={broadcast}
          setMessage={setBroadcast}
          sendMessage={sendAsBroadcast}
        />
      </div>
      <TextContainer users={users} />
    </div>
  );
};

export default Chat;
