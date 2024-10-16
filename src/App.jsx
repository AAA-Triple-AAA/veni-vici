import { useState } from "react";
import "./App.css";

const App = () => {
    const [count, setCount] = useState(0);
    const [film, setFilm] = useState({});

    const handleFind = () => {
        setCount(count + 1);
    };

    return (
        <div className="page">
            <div className="history-list">
                <h3>HISTORY</h3>
            </div>
            <div className="film-listing-container">
                <h2>TRIPLE A FILM RECOMMENDATION SYSTEM</h2>
                {count != 0 && <div>MOVIE</div>}
                <button onClick={handleFind}>FIND FILM 🔀</button>
            </div>
            <div className="ban-list">
                <h3>BAN LIST</h3>
                <p>
                    Select an attribute in the film listing to never see it
                    again.
                </p>
            </div>
        </div>
    );
};

export default App;
