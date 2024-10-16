import { useState } from "react";
import "./App.css";

const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

const App = () => {
    const [count, setCount] = useState(0);
    const [film, setFilm] = useState({});

    const handleFind = async () => {
        const film = await getRandomFilm();
        console.log(film);
        setFilm(film);
        setCount(count + 1);
    };

    async function getRandomFilm() {
        let allFilmData;
        const randPage = Math.floor(Math.random() * 500) + 1;
        const randFilm = Math.floor(Math.random() * 20);
        do {
            const response = await fetch(
                `https://api.themoviedb.org/3/discover/movie?api_key=${ACCESS_KEY}&include_adult=false&include_video=false&language=en-US&page=${randPage}&sort_by=popularity.desc`
            );
            allFilmData = await response.json();
        } while (allFilmData.status_code === 34); // Retry if movie not found
        return getFilmDetails(allFilmData.results[randFilm].id);
    }

    async function getFilmDetails(movieId) {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${ACCESS_KEY}&append_to_response=credits`
        );
        const filmData = await response.json();

        const title = filmData.title;
        const genre = filmData.genres[0].name;
        const year = new Date(filmData.release_date).getFullYear();
        const country = filmData.production_countries.map(
            (country) => country.name
        )[0];
        const rating = Math.round(filmData.vote_average);
        const director = filmData.credits.crew.find(
            (person) => person.job === "Director"
        )?.name;

        const poster_path = filmData.poster_path;

        return {
            title,
            genre,
            year,
            country,
            rating,
            director,
            poster_path,
        };
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
                        <div className="film-info">
                            <img
                                src={`https://image.tmdb.org/t/p/w400${film.poster_path}`}
                                alt="poster"
                            />
                            <div className="attribute-container">
                                <button>🎭{film.genre}</button>
                                <button>🌎{film.country}</button>
                                <button>🎬{film.director}</button>
                                <button>⭐{film.rating}/10</button>
                                <button>📅{film.year}</button>
                            </div>
                        </div>
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
