import { faArrowAltCircleUp, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const SidePanel = ({
  people,
  showSidePanel,
  sendMessage,
  sendFile,
  messages,
  user,
}) => {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const changeHandler = (e) => {
    let selected = e.target.files[0];

    if (selected) {
      setFile(selected);
    } else {
      setFile(null);
    }
  };

  const send = () => {
    if (file) {
      sendFile(file);
      setFile(null);
    } else {
      let temp = msg;
      setMsg("");
      sendMessage(temp);
    }
  };

  const handleDownload = (body, mimeType) => {
    const blob = new Blob([body], { type: mimeType });
    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = "filename";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  console.log(messages)
  console.log(user)
  return (
    <div className="sidePanelWrapper">
      <h4 className="top">{showSidePanel}</h4>
      <div className="panel">
        {showSidePanel === "Chats"
          ? messages.map((m) => (
              <div className={m.userName.id === user.id ? "message self" : "message"}>
                <p>{m.userName.username}: </p>
                {m.file ? (
                  <div
                    className="msgFile"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    <button
                      className="downBtn"
                      onClick={() =>
                        handleDownload(m.message.body, m.message.mimeType)
                      }
                    >
                      <FontAwesomeIcon icon={faFile} /> {m.message.fileName}
                    </button>
                  </div>
                ) : (
                  <h6 style={{ margin: "2px", fontWeight: "600" }}>
                    {m.message}
                  </h6>
                )}
                <p
                  style={{
                    margin: "2px",
                    fontSize: "12px",
                    textAlign: "right",
                    marginLeft: 'auto'
                  }}
                >
                  {m.time}
                </p>
              </div>
            ))
          : people.map((p) => (
              <ul className="person">
                <li
                  style={{
                    margin: "2px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  {p.userName.username}
                </li>
              </ul>
            ))}
      </div>
      <div
        className="inputPanel"
        hidden={showSidePanel === "Chats" ? false : true}
      >
        <label className="fileInput">
          <input type="file" onChange={changeHandler} hidden />
          <FontAwesomeIcon icon={faFile} />
        </label>
        <input
          className="messageInput"
          type="text"
          placeholder="write message here"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button className="send" onClick={send}>
          <FontAwesomeIcon icon={faArrowAltCircleUp} />
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
