import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import styles from "./questionnare.module.css";
import { Logo } from '../../svgs/logoSVG';
import { useNavigate } from 'react-router-dom';
import LoginContext from "../../context/context";
import { LuLogIn, LuLogOut } from 'react-icons/lu';
import headerStyles from "../message/message.module.css";


const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [questionNo, setQuestionNo] = useState(0);
    const [responses, setResponses] = useState([]);
    const { logout, loggedIn } = useContext(LoginContext);
    const [rensponseText, setRensponseText] = useState('')

    const navigate = useNavigate();

    useEffect(() => {
        const getQuestions = async () => {
            try {
                const response = await axios.post('http://20.197.0.69:3000/get-questions', {});
                setQuestions(response.data);
                setQuestionNo(0)
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        };

        getQuestions();

    }, []);

    useEffect(() => {
        if (questions.length > 0 && questionNo < questions.length) {
            setSelectedQuestion(questions[questionNo]);
        }
    }, [questionNo, questions]);
    console.log(responses)

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = async () => {
        const newResponse = {
            questionID: selectedQuestion.QuestionNo,
            questionText: selectedQuestion.QuestionText,
            answerText: selectedAnswer,
        };

        setResponses([...responses, newResponse]);

        if (questionNo < questions.length - 1) {
            setQuestionNo(questionNo + 1);
            setSelectedAnswer('');
        } else {
            try {
                const respomse = await axios.post('http://20.197.0.69:3000/get-analysis', {
                    "uid": 1234,
                    "questions": responses
                });
                setQuestionNo(0);
                setResponses([]);
                console.log(respomse.data.analysis)
                setRensponseText(respomse.data.analysis)

            } catch (error) {
                console.error("Error submitting responses:", error);
            }
        }
    };

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
        <div>
            <header style={{ width: "100%", display: "flex", justifyContent: "space-between", flexDirection: "row", padding: 40 }} >
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
                    <button
                        className=' rounded-lg border-2 p-2 border-gray-600'
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
                        className=' rounded-lg border-2 p-2 border-gray-600'
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
            <div className={styles.quizContainer}>
                <h3>{selectedQuestion?.QuestionText}</h3>
                <div className={styles.optionsContainer}>
                    {selectedQuestion?.options && Object.entries(selectedQuestion.options).map(([key, value]) => (
                        <button
                            key={key}
                            className={styles.quizButton}
                            style={{
                                backgroundColor: selectedAnswer === key ? 'white' : '',
                                color: selectedAnswer === key ? 'black' : ''
                            }}
                            onClick={() => handleAnswerSelect(value)}
                        >
                            {value}
                        </button>
                    ))}
                </div>
                <button
                    className={styles.nextButton}
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer}
                >
                    Next
                </button>
            </div>

            {rensponseText && (<p>{rensponseText}</p>)}
        </div>
    );
};

export default Quiz;
