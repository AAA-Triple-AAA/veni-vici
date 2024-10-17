import { useState, useEffect } from "react";
import "./App.css";

const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

const App = () => {
    const [count, setCount] = useState(0);
    const [film, setFilm] = useState({});

    const [excludeGenres, setExcludeGenres] = useState([]);
    const [excludeYears, setExcludeYears] = useState([]);
    const [excludeRatings, setExcludeRatings] = useState([]);
    const [excludeDirectors, setExcludeDirectors] = useState([]);
    const [countries, setCountries] = useState([]);
    const [countryMap, setCountryMap] = useState([]);

    const [excludedCategories, setExcludeCategories] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        getCountries();
    }, []);

    async function getCountries() {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/configuration/countries?api_key=${ACCESS_KEY}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch countries");
            }
            const tempCountries = await response.json();
            setCountryMap([...tempCountries]);
            setCountries(tempCountries.map((country) => country.iso_3166_1));
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    }

    async function getRandomFilm() {
        let allFilmData;
        let filmData;
        let isValid = false;
        let attempts = 10;

        while (!isValid && attempts != 0) {
            try {
                const randPage = Math.floor(Math.random() * 500) + 1;
                const randFilm = Math.floor(Math.random() * 20);
                const response = await fetch(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${ACCESS_KEY}&include_adult=false&include_video=false&language=en-US&page=${randPage}&sort_by=popularity.desc&without_genres=${excludeGenres.join(
                        ","
                    )}&without_people=${excludeDirectors.join(
                        "|"
                    )}&with_origin_country=${countries.join(
                        "|"
                    )}&vote_average.gte=1.0`
                );
                allFilmData = await response.json();
                if (!allFilmData.results || allFilmData.results.length === 0) {
                    continue;
                }
                filmData = await getFilmDetails(
                    allFilmData.results[randFilm].id
                );
                if (
                    excludeRatings.indexOf(filmData.rating) === -1 &&
                    excludeYears.indexOf(filmData.year) === -1
                ) {
                    isValid = true;
                }
            } catch (error) {
                console.log("ERROR OCCURRED (FILM DATA):", error);
            }
            attempts--;
        }
        return filmData;
    }

    async function getFilmDetails(movieId) {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${ACCESS_KEY}&append_to_response=credits`
            );
            const filmData = await response.json();
            const title = filmData.title;
            const genre = filmData.genres[0].name;
            const genreId = filmData.genres[0].id;
            const year = new Date(filmData.release_date).getFullYear();
            const country = countryMap.find(
                (country) => country.iso_3166_1 === filmData.origin_country[0]
            ).english_name;
            const countryId = filmData.origin_country[0];
            const rating = Math.round(filmData.vote_average);
            const director = filmData.credits.crew.find(
                (person) => person.job === "Director"
            )?.name;
            const poster_path = filmData.poster_path;

            return {
                title,
                genre,
                genreId,
                year,
                country,
                countryId,
                rating,
                director,
                poster_path,
            };
        } catch {
            console.log("ERROR OCCURRED (DETAILS)");
            getRandomFilm();
        }
    }

    const handleFind = async () => {
        if (film && film.title) {
            let pastFilm = { title: film.title, poster: film.poster_path };
            setHistory([...history, pastFilm]);
        }
        const newFilm = await getRandomFilm();
        setFilm(newFilm);
        setCount(count + 1);
    };

    const handleExclude = (category) => {
        if (category === "year") {
            setExcludeYears([...excludeYears, film.year]);
            if (excludedCategories.indexOf(film.year) === -1)
                setExcludeCategories([
                    ...excludedCategories,
                    { type: "year", value: film.year },
                ]);
        } else if (category === "rating") {
            setExcludeRatings([...excludeRatings, film.rating]);
            if (excludedCategories.indexOf(`${film.rating}/10`) === -1)
                setExcludeCategories([
                    ...excludedCategories,
                    { type: "rating", value: `${film.rating}/10` },
                ]);
        } else if (category === "director") {
            setExcludeDirectors([...excludeDirectors, film.director]);
            if (excludedCategories.indexOf(film.director) === -1)
                setExcludeCategories([
                    ...excludedCategories,
                    { type: "director", value: film.director },
                ]);
        } else if (category === "country") {
            setCountries([
                ...countries.filter((country) => country != film.countryId),
            ]);
            if (excludedCategories.indexOf(film.country) === -1)
                setExcludeCategories([
                    ...excludedCategories,
                    { type: "country", value: film.country },
                ]);
        } else if (category === "genre") {
            setExcludeGenres([...excludeGenres, film.genreId]);
            const found = excludedCategories.find(
                (category) => category.value === film.genre
            );
            if (!found)
                setExcludeCategories([
                    ...excludedCategories,
                    { type: "genre", value: film.genre },
                ]);
        }
    };

    const includeCategory = (category, categoryType) => {
        setExcludeCategories(
            excludedCategories.filter((item) => item.value !== category)
        );
        if (categoryType === "year") {
            setExcludeYears(excludeYears.filter((year) => year !== category));
        } else if (categoryType === "rating") {
            setExcludeRatings(
                excludeRatings.filter((rating) => rating !== category)
            );
        } else if (categoryType === "director") {
            setExcludeDirectors(
                excludeDirectors.filter((director) => director !== category)
            );
        } else if (categoryType === "country") {
            const countryId = countryMap.find(
                (country) => country.english_name === category
            ).iso_3166_1;
            setCountries([...countries, countryId]);
        } else if (categoryType === "genre") {
            setExcludeGenres(
                excludeGenres.filter((genreId) => genreId !== category)
            );
        }
    };

    return (
        <div className="page">
            <div className="history-list">
                <h3>HISTORY</h3>
                {history
                    .map((pastFilm) => (
                        <div className="past-film" key={pastFilm.title}>
                            <img
                                className="history-img"
                                src={`https://image.tmdb.org/t/p/w400${pastFilm.poster}`}
                                alt=""
                            />
                            <h4>{pastFilm.title}</h4>
                        </div>
                    ))
                    .reverse()}
            </div>
            <div className="film-listing-container">
                <h2>TRIPLE A&apos;s FILM CURATOR</h2>
                {count != 0 && film?.title && (
                    <div>
                        <h1>{film.title}</h1>
                        <div className="film-info">
                            <img
                                src={`https://image.tmdb.org/t/p/w400${film.poster_path}`}
                                alt="poster"
                            />
                            <div className="attribute-container">
                                <button onClick={() => handleExclude("genre")}>
                                    🎭{film.genre}
                                </button>
                                <button
                                    onClick={() => handleExclude("country")}>
                                    🌎
                                    {film.countryId === "US"
                                        ? "USA"
                                        : film.country}
                                </button>
                                <button
                                    onClick={() => handleExclude("director")}>
                                    🎬{film.director}
                                </button>
                                <button onClick={() => handleExclude("rating")}>
                                    ⭐{film.rating}/10
                                </button>
                                <button onClick={() => handleExclude("year")}>
                                    📅{film.year}
                                </button>
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

                {excludedCategories
                    .map((category, index) => (
                        <button
                            onClick={() =>
                                includeCategory(category.value, category.type)
                            }
                            className="banned-button"
                            key={`${category.value}-${index}`}>
                            {category.value === "United States of America"
                                ? "USA"
                                : category.value}
                        </button>
                    ))
                    .reverse()}
            </div>
        </div>
    );
};

export default App;
