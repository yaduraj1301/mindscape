import { useNavigate } from "react-router-dom";
import { Logo } from "../../svgs/logoSVG";
import styles from "./message.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";
import LoginContext from "../../context/context";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import Chat from "./Chat";

function LoaderRipple() {
    return (
        <div className={styles["lds-ripple"]}>
            <div></div>
            <div></div>
        </div>
    );
}

function Message() {
    const [chatId, setChatId] = useState(null);
    const navigate = useNavigate();
    const { logout, loggedIn } = useContext(LoginContext);
    const mainRef = useRef();
    const [chat, setChat] = useState([{
        "message": "Hello there, I am Skye.  It's nice to connect with you. What's on your mind today? \n",
        "own": false
    }]);
    const [chatState, setChatState] = useState("busy");
    const [chatInit, setChatInit] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false)
    //   let ws = useRef(null);

    useEffect(() => {
        if (mainRef.current) {
            const container = mainRef.current;
            container.scrollTop = container.scrollHeight;
        }
        setTimeout(() => {
            setChatInit(true)
        }, 2000)
    }, [chat]);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await axios.get(process.env.REACT_APP_API_LINK + "/chat", {
                    withCredentials: true,
                });
                setChatId(data.data.chatId);
                console.log(data);
            } catch (error) {
                console.log("Error Fetching Data");
            }
        }
        fetchData();
    }, []);

    // console.log(message)

    const handleClick = async () => {
        setLoading(true)
        setChatInit(true)
        setMessage("")
        // setChatState("busy")

        if (message.length === 0) {
            alert("Enter something...")
            return;
        }

        setChat((prevChat) => [...prevChat, { message, own: true }]);
        console.log(chat);


        try {
            const response = await axios.post("http://20.197.0.69:3000/chat", {
                messages: message,
                uid: chatId
            });
            console.log(response.data);

            setChat((prevChat) => [...prevChat, { message: response.data, own: false }]);
            setMessage("");
            setChatState("idle");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false)
        }
    };

    console.log(chat)

    const logoutUser = async () => {
        try {
            const { data } = await axios.get(
                process.env.REACT_APP_API_LINK + "/logout",
                {
                    withCredentials: true,
                }
            );
            console.log(data);
            if (data?.msg === "loggedout") {
                logout();
            }
        } catch (error) {
            console.log("Err in logout");
        }
    };

    return (
        <div className={styles.messageContainer}>
            <header>
                <div className={styles.logoContainer} onClick={() => {
                    navigate('/')
                }}>
                    <Logo />
                    <div className={styles.headerText}>
                        <h4>Mindscape</h4>
                        <h6>A mental health chat assistance</h6>
                    </div>
                </div>

                <div className="flex flex-row gap-4">
                    {loggedIn && (
                        <button
                            onClick={() =>
                                navigate("/quiz")
                            }
                        >
                            Quiz
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (!loggedIn) navigate("/login");
                            else {
                                navigate("/analysis");
                            }
                        }}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => {
                            if (!loggedIn) navigate("/login");
                            else {
                                logoutUser();
                            }
                        }}
                    >
                        {!loggedIn ? <LuLogIn /> : <LuLogOut />}
                    </button>
                </div>
            </header>
            <main
                ref={mainRef}
                style={
                    !chatInit || chat.length === 0
                        ? {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }
                        : {}
                }
            >
                {!chatInit && (
                    <div className={styles.loadingChatInit}>
                        <LoaderRipple />
                    </div>
                )}
                {chatInit && chat.length === 0 && (
                    <div className={styles.emptyChat}>
                        No Previous Chat History!
                        <br />
                        Chat with me now.
                    </div>
                )}
                {chatInit &&
                    chat &&
                    chat.map((x, i) => {
                        return (
                            <Chat
                                text={x.message}
                                own={x.own}
                                key={i}
                                isLoading={x.isLoading ? true : false}
                            />
                        );
                    })}
            </main>
            <footer>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter message..."
                    />
                    <button
                        type="submit"
                        onClick={handleClick}
                        disabled={loading}
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default Message;
