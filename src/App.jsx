import { useState } from 'react';
import './App.css'
import Base64 from './base_64.js';

function App() {
  const [txt, setTxt] = useState("");
  const [data, setData] = useState({
    name: "",
    email: "",
    birthdate: "",
    login: "",
    password: "",
    repeat: ""
  });
  const [auth, setAuth] = useState({
    login: "",
    password: "",
  });


  const request = (url, conf) => new Promise((resolve,reject) => {
    if(url.startsWith('/')) {
      url = "http://localhost:81" + url;
    }
    fetch(url, conf).then(r => r.json()).then(j => {
      if(j.status.isSuccess) {
        resolve(j.data);
      }
      else {
        console.error(j);
        reject(j);
      }
    });
  });

  const testGet = () => {
    request("/api/client/login").then(setTxt);
  };

  const testPut = () => {
    request("/api/client", {
        method: 'PUT'
      }
    ).then(setTxt);
  };

  const testPost = () => {
    console.log(data);
    request("/api/client", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
    })
    .then(j => setTxt(JSON.stringify(j)));
  };

  const install = () => {
    request("/api/client/install")
    .then(j => setTxt(JSON.stringify(j)));
  };

  const onAuthClick = () => {
    // RFC 7617
    // 1.  obtains the user-id and password from the user,
    console.log(`user-id: ${auth.login}, password: ${auth.password}`);
    // 2.  constructs the user-pass by concatenating the user-id, a single colon (":") character, and the password,
    const userPass = auth.login + ':' + auth.password;
    // 3-4 obtains the basic-credentials by encoding this octet sequence using Base64
    const credentials = Base64.encode(userPass);
    console.log(credentials);
    request("/api/client/auth", {
      method: "GET",
      headers: {
        "Authorization": 'Basic ' + credentials
      }
    }).then(j => setTxt(JSON.stringify(j)));
  };

  return <>
  <h1>Випробування API</h1>
    <button onClick={testGet}>GET</button>
    <button onClick={testPut}>PUT</button>
    <button onClick={install}>INSTALL</button>
    <div style={{border: "1px solid lightgray", margin: "10px 0", padding: "5px"}}>
        <input type="text"     value={data.name}      onChange={e => setData({...data, name: e.target.value})}/> <br/>
        <input type="email"    value={data.email}     onChange={e => setData({...data, email: e.target.value})}/> <br/>
        <input type="date"     value={data.birthdate} onChange={e => setData({...data, birthdate: e.target.value})}/> <br/>
        <input type="text"     value={data.login}     onChange={e => setData({...data, login: e.target.value})}/> <br/>
        <input type="password" value={data.password}  onChange={e => setData({...data, password: e.target.value})}/> <br/>
        <input type="password" value={data.repeat}    onChange={e => setData({...data, repeat: e.target.value})}/> <br/>
        <button onClick={testPost}>Реєстрація</button>
    </div>
    <div style={{border: "1px solid lightgray", margin: "10px 0", padding: "5px"}}>
      <h2>Автентифікація</h2>
      <label>
        <input type="text" value={auth.login} onChange={e => setAuth({...auth, login: e.target.value})}/>
      </label> <br/>
      <label>
        <input type="password" value={auth.password}  onChange={e => setAuth({...auth, password: e.target.value})}/>
      </label> <br/>
      <button onClick={onAuthClick}>Вхід</button>
    </div>
    <p>{txt}</p>    
  </>;
}

export default App
