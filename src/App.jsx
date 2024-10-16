import { useState } from "react";
import "./App.css";

const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

const App = () => {
    const [count, setCount] = useState(0);
    const [film, setFilm] = useState({});

    const handleFind = async () => {
        const film = await getRandomMovie();
        setFilm(film);
        console.log(film);
        setCount(count + 1);
    };

    async function getLatestMovieId() {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/latest?api_key=${ACCESS_KEY}`
        );
        const data = await response.json();
        return data.id;
    }

    async function getRandomMovieId() {
        const latestId = await getLatestMovieId();
        return Math.floor(Math.random() * latestId) + 1;
    }

    async function getRandomMovie() {
        let movieData;
        do {
            const randomId = await getRandomMovieId();
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${randomId}?api_key=${ACCESS_KEY}&include_adult=false&vote_count.gte=50&popularity.gte=10`
            );
            movieData = await response.json();
        } while (
            movieData.status_code === 34 ||
            !movieData.poster_path ||
            movieData.genres.length == 0
        ); // Retry if movie not found
        return movieData;
    }

    return (
        <div className="page">
            <div className="history-list">
                <h3>HISTORY</h3>
            </div>
            <div className="film-listing-container">
                <h2>TRIPLE A FILM RECOMMENDATION SYSTEM</h2>
                {count != 0 && (
                    <div>
                        <h1>{film.title}</h1>
                        <img
                            src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                            alt="poster"
                        />
                    </div>
                )}
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
