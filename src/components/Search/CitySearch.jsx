import React, { useState, useEffect } from "react";

function CitySearch({ selected, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [cities, setCities] = useState([]);

  // Load dataset (make sure worldcities.json is in the public folder)
  useEffect(() => {
    fetch("/worldcities.json")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch((err) => console.error("Error loading city data:", err));
  }, []);

  // Search filter
  const handleSearch = (value) => {
    setQuery(value);
    if (value.length > 1) {
      const filtered = cities
        .filter((c) =>
          c.city.toLowerCase().startsWith(value.toLowerCase())
        )
        .slice(0, 10); // Show only top 10 results
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="city-search">
      <input
        type="text"
        value={query || selected}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for a city..."
        className="custom-select"
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((c, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(`${c.city}, ${c.admin_name}, ${c.country}`);
                setQuery(`${c.city}, ${c.admin_name}, ${c.country}`);
                setResults([]);
              }}
            >
              {c.city}, {c.admin_name}, {c.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CitySearch;
