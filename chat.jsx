import React, { useEffect, useState, useRef } from "react";
import Sendsvg from "../../Svg-componets/Sendsvg";
import Pinsvg from "../../Svg-componets/Pinsvg";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../../../queryFunctions/queryFunctions";
import moment from "moment/moment";
import useActionMutation from "../../../queryFunctions/useActionMutation";
// import socket from "../../../socket";
import { useLocation } from "react-router-dom";
// import useReadCountStore from "../../../store/unReadMsgCount";
import Inputc from "../../Input-comonets/Inputc";

const Chat = () => {
  //   const { readCount, decrementReadCount } = useReadCountStore();
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([
    {
      _id: 123,
      partnerName: "John Doe",
      partnerImage: userData?.profileImage || "/default-avatar.png",
      specialty: "Inspector",
    },
  ]);
  const [newMessage, setNewMessage] = useState(""); // state for the new message
  const [selectUser, setSelectUser] = useState({
    _id: 123,
    partnerImage: userData?.profileImage || "/default-avatar.png",
    partnerName: userData?.name || "User",
    specialty: "Inspector",
  });
  const [images, setImages] = useState([]); // array of File
  const [imgUrls, setImgUrls] = useState([]); // array of base64 URLs

  const fileInputRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const location = useLocation();

  //   const { data, isLoading } = useQuery({
  //     queryKey: ["message-list"],
  //     queryFn: () =>
  //       fetchData(`/chat/message-list?doctorId=${location.state || ""}`),
  //     keepPreviousData: true,
  //   });

  //   const { data: messageHistory, isLoading: messageLoading } = useQuery({
  //     queryKey: ["message-history", selectUser?._id],
  //     queryFn: () => fetchData(`/chat/message-history/${selectUser?._id}`),
  //     keepPreviousData: true,
  //     enabled: !!selectUser?._id,
  //   });

  //   useEffect(() => {
  //     if (messageHistory?.data?.length !== 0) {
  //       setMessages(messageHistory?.data);
  //     } else {
  //       setMessages([]);
  //     }
  //   }, [messageHistory]);

  //   useEffect(() => {
  //     if (data?.data?.length !== 0) {
  //       if (location?.state && location?.state !== "") {
  //         setSelectUser(data?.data[0]);
  //       }
  //       setChatList(data?.data);
  //     }
  //   }, [data]);

  //   useEffect(() => {
  //     if (userData?._id) {
  //       socket.emit("join", userData?._id);
  //       console.log("Joined room:", userData?._id);
  //     }

  //     socket.on("receiveMsg", (data) => {
  //       const newMsg = {
  //         sender: data?.create?.sender,
  //         receiver: data?.create?.receiver,
  //         message: data?.create?.message,
  //         time: data?.create?.time,
  //       };

  //       setMessages((prevMessages) =>
  //         Array.isArray(prevMessages) ? [...prevMessages, newMsg] : [newMsg]
  //       );
  //     });

  //     return () => {
  //       socket.disconnect();
  //     };
  //   }, [userData?._id]);

  const handleSelectUser = (selectedUser) => {
    setChatList((prevList) =>
      prevList?.map((user) =>
        user._id === selectedUser._id ? { ...user, unreadCount: 0 } : user
      )
    );
    decrementReadCount(selectedUser.unreadCount);
    setSelectUser(selectedUser);
  };

  const { triggerMutation, loading, error } = useActionMutation({
    onSuccessCallback: (data) => {
      const newMsg = {
        receiver: data.data?.receiver,
        message: newMessage,
        sender: data.data?.sender,
        file: data.data?.file,
        time: moment().format("hh:mm a"),
      };

      setMessages((prevMessages) =>
        Array.isArray(prevMessages) ? [...prevMessages, newMsg] : [newMsg]
      );
      setImages([]);
      setImgUrls([]);
      setNewMessage("");
    },
  });

  const sendMessage = () => {
    const formData = new FormData();
    formData.append("receiver", selectUser?._id);
    formData.append("message", newMessage);
    if (images?.length > 0) {
      images.forEach((img, index) => {
        formData.append(`file`, img);
      });
    }

    triggerMutation({
      endPoint: "/chat/send-message",
      body: formData,
      method: "post",
    });
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // Delay to ensure the DOM is updated

    return () => clearTimeout(timer); // Clean up on unmount
  }, [messages]);

  const handleFileClick = () => {
    fileInputRef.current?.click(); // ⬅️ This opens the file picker
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const fileReaders = newFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ file, url: reader.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((newFileData) => {
      setImages((prev) => [...prev, ...newFiles]);
      setImgUrls((prev) => [...prev, ...newFileData]);
    });
  };

  const currSendMSg = () => {
    const newMsg = {
      message: newMessage,
      sender: {
        profileImage: userData?.profileImage || "/default-avatar.png",
      },
      time: moment().format("hh:mm a"),
    };

    setMessages((prevMessages) =>
      Array.isArray(prevMessages) ? [...prevMessages, newMsg] : [newMsg]
    );
    setNewMessage("");
  };
  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2>Chat</h2>
        {chatList?.length > 0 ? (
          chatList?.map((user, index) => (
            <div
              onClick={() => handleSelectUser(user)}
              key={index}
              className="user"
            >
              <img src={user?.partnerImage} alt="User" />
              <div className="user-info">
                <h4>{user?.partnerName}</h4>
                <h5>{user?.specialty || ""}</h5>
                <p>
                  {user?.latestMessage ||
                    (user?.file?.length > 0 &&
                      `${
                        user?.file?.length > 4 ? "4+" : user?.file?.length
                      } attachment${user?.file?.length > 1 ? "s" : ""}`)}
                </p>
              </div>
              <span className="time">{user?.latestMessageTime || ""}</span>
              <br />
              {user?._id !== selectUser?._id && user?.unreadCount > 0 && (
                <div className="count">{user?.unreadCount}</div>
              )}
            </div>
          ))
        ) : (
          <div className="emptyChat">
            <p>Chat is Empty</p>
          </div>
        )}
      </div>

      <div className="chat-window">
        {selectUser?._id && (
          <>
            <div className="chat-header">
              <img src={selectUser?.partnerImage} alt="User" />
              <div>
                <h3>{selectUser?.partnerName}</h3>
                <p>{selectUser?.specialty || ""}</p>
              </div>
            </div>

            <div className="chat-messages">
              {messages?.map((msg, index) => {
                const myId = userData?.assistantOf
                  ? userData?.assistantOf
                  : userData?._id;
                const isMeReceiver = myId === msg?.receiver?._id;

                // const imgFilter = msg?.file?.filter((f) =>
                //   f?.fileType?.includes("image/")
                // );
                // const docFilter = msg?.file?.filter(
                //   (f) =>
                //     f?.fileType?.includes("application/msword") ||
                //     f?.fileType?.includes(
                //       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                //     )
                // );
                // const pdfFilter = msg?.file?.filter((f) =>
                //   f?.fileType?.includes("application/pdf")
                // );

                return (
                  <div
                    key={msg._id}
                    className={`message ${isMeReceiver ? "received" : "sent"}`}
                  >
                    <img src={msg?.sender?.profileImage} alt="Sender" />

                    <div className="message-content">
                      {/* {imgFilter?.length > 0 && (
                        <ImageGrid images={imgFilter} />
                      )}

                      {docFilter?.map((data, i) => (
                        <div key={i} className="pdf-div-main">
                          <div className="pdf-div">
                            <img src={doc} alt="doc" />
                            <h6 className="mt-3">{data?.name}</h6>
                          </div>
                        </div>
                      ))}

                      {pdfFilter?.map((data, i) => (
                        <div key={i} className="pdf-div-main">
                          <div className="pdf-div">
                            <img src={pdf} alt="pdf" />
                            <h6 className="mt-3">{data?.name}</h6>
                          </div>
                        </div>
                      ))} */}
                      <p>{msg.message}</p>
                      <span className="time">{msg.time}</span>
                    </div>
                  </div>
                );
              })}

              {/* This ref will make sure to scroll to the latest message */}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-write-sec">
              <div className="chat-file-div">
                {imgUrls.map(({ file, url }, index) => (
                  <img
                    key={index}
                    src={
                      /(application\/pdf|application\/msword|application\/doc|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(
                        file.type
                      )
                        ? file.type.includes("pdf")
                          ? pdf
                          : doc
                        : url
                    }
                    alt={`uploaded-${index}`}
                  />
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Enter your message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="chat-icon-box">
                  <div onClick={handleFileClick} style={{ cursor: "pointer" }}>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,image/png,image/jpg,image/jpeg"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      //   onChange={handleFileChange}
                    />
                    <Pinsvg />
                  </div>
                  <button
                    // disabled={newMessage.trim() === "" && images.length === 0}
                    className="send-btn"
                    onClick={currSendMSg}
                  >
                    {/* {loading ? <Loader /> : <Sendsvg />} */}
                    <Sendsvg />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
